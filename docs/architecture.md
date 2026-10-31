# SOUQ Architecture Specification

## 1. System Overview
SOUQ is structured as a decoupled, 12-factor application deployed on a single hardened Ubuntu VPS via Docker Compose.

```mermaid
graph TD
    Client["Client (Browser / Mobile)"] -->|HTTPS| Cloudflare["Cloudflare (DNS, WAF, CDN)"]
    Cloudflare -->|Port 443| Nginx["Nginx Reverse Proxy & Load Balancer"]
    
    subgraph Docker Internal Network [souq-internal-net]
        Nginx -->|Proxy HTTP| API1["Express API Replica 1"]
        Nginx -->|Proxy HTTP| API2["Express API Replica 2"]
        Nginx -->|Static Assets| WebStatic["Vite React SPA Build"]
        
        API1 -->|Session Transactions| Mongo["MongoDB (Replica Set rs0)"]
        API2 -->|Session Transactions| Mongo
        
        API1 -->|Queues / Cache / Limits| Redis["Redis 7 (LRU Capped)"]
        API2 -->|Queues / Cache / Limits| Redis
        
        Worker["BullMQ Worker Service"] -->|Consume Jobs| Redis
        Worker -->|Update States| Mongo
        
        API1 -->|Store Images| Storage["Object Storage (MinIO / R2)"]
        Worker -->|Process Images| Storage
    end

    subgraph Observability
        Alloy["Grafana Alloy"] -->|Logs| Loki["Loki"]
        Prometheus["Prometheus"] -->|Scrape /metrics| API1
        Prometheus -->|Scrape /metrics| API2
        Grafana["Grafana"] -->|Query| Prometheus
        Grafana -->|Query| Loki
    end

    API1 -->|Verify & Init| Chapa["Chapa API (External Payment)"]
    Chapa -->|Webhook POST| Nginx
```

## 2. Order Checkout & Inventory Reservation Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    participant API as Express API
    participant DB as MongoDB (rs0)
    participant Redis as Redis / BullMQ
    participant Chapa as Chapa Gateway

    Buyer->>API: POST /api/v1/orders (Idempotency-Key)
    API->>DB: Session Transaction: findOneAndUpdate({_id, stock: {$gte: qty}})<br/>stock: -qty, reserved: +qty
    alt Insufficient Stock
        DB-->>API: Document not matched
        API-->>Buyer: 409 Conflict ("Out of stock")
    else Stock Reserved
        DB-->>API: Updated Product Document
        API->>DB: Create Order (PENDING_PAYMENT, txRef)
        API->>DB: Create InventoryReservation (expiresAt: now + 15m)
        API->>Redis: Schedule BullMQ delayed job (15m expiration)
        API->>Chapa: POST /v1/transaction/initialize
        Chapa-->>API: checkout_url
        API-->>Buyer: 201 Created { order, checkout_url }
    end

    Buyer->>Chapa: Complete payment on Chapa hosted page
    Chapa->>API: POST /api/v1/payments/chapa/webhook (x-chapa-signature)
    API->>API: Constant-time HMAC-SHA256 verification
    API->>Chapa: GET /v1/transaction/verify/:txRef
    Chapa-->>API: Status: "success"
    API->>DB: Session Transaction: Order -> PAID, reserved: -qty (Sold)
    API->>Redis: Enqueue order confirmation email job
    API-->>Chapa: 200 OK
```

## 3. Order State Machine FSM

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Checkout Initialized
    PENDING_PAYMENT --> PAID : Webhook / Server Verified
    PENDING_PAYMENT --> EXPIRED : 15m Reservation Timeout
    PENDING_PAYMENT --> CANCELLED : Buyer / Admin Cancel
    
    PAID --> CONFIRMED_BY_SELLER : Seller Accepts
    PAID --> CANCELLED : Seller Out of Stock / Dispute
    CANCELLED --> REFUNDED : Payment Reversed
    
    CONFIRMED_BY_SELLER --> SHIPPED : Dispatch with Tracking
    SHIPPED --> DELIVERED : Customer Confirms Delivery Phone Call
    DELIVERED --> [*]
```

## 4. VPS Memory Budget Table (4 GB RAM Target)

The entire production stack is strictly budgeted to ensure stable operation below 85% of 4096 MB (3481 MB max):

| Service | Container | Soft Limit | Hard Limit | Justification |
|---|---|---|---|---|
| Reverse Proxy | `souq-nginx` | 64 MB | 128 MB | Caching, rate limiting, SSL termination |
| API Instance 1 | `souq-api-1` | 192 MB | 256 MB | Stateless Express server with V8 memory cap |
| API Instance 2 | `souq-api-2` | 192 MB | 256 MB | Stateless Express server with V8 memory cap |
| Worker Service | `souq-worker` | 192 MB | 384 MB | BullMQ queues, Sharp image processing |
| Database | `souq-mongo` | 768 MB | 1024 MB | WiredTiger cache sized to 512MB + connection memory |
| Cache & Queues | `souq-redis` | 128 MB | 256 MB | In-memory keys with maxmemory 192MB volatile-lru |
| Object Store (Dev) | `souq-minio` | 128 MB | 256 MB | Dev only; production uses Cloudflare R2 |
| Observability | `souq-alloy` | 64 MB | 128 MB | Log shipping agent |
| Observability | `souq-loki` | 128 MB | 256 MB | In-memory log buffer |
| Observability | `souq-prometheus`| 192 MB | 384 MB | 15s scrape interval, 15d retention |
| Observability | `souq-grafana` | 96 MB | 192 MB | Dashboard visualization |
| OS & Host Buffer | Ubuntu Host | 400 MB | 512 MB | Kernel, SSH, fail2ban, buffers |
| **TOTAL** | | **2544 MB (62%)**| **3344 MB (81%)**| **Target < 85% PASSED** |
