# ADR 0006: Redis and BullMQ for Queues and Rate Limits

## Status
Accepted

## Context
The platform requires fast in-memory rate limiting, idempotency key caching, and background job processing (emails, image thumbnails, reservation expiry, ledger reconciliation) without blocking Express HTTP threads.

## Decision
Use Redis 7 (Alpine) paired with BullMQ. Redis will serve as:
1. Distributed rate limiter (sliding window for auth, checkout, and global endpoints).
2. Idempotency key storage (24-hour TTL).
3. BullMQ queue backend with retries, exponential backoff, and dead-letter queues.

## Alternatives Considered
- **RabbitMQ / Kafka:** Excessive memory and management overhead for a single VPS budget.
- **Database polling (Mongoose jobs):** Inefficient table scans and database lock contention.

## Consequences
- **Positive:** Microsecond latency, reliable delayed jobs for reservation expiry, built-in dead-letter queues.
- **Negative:** Redis memory must be budgeted and monitored (capped at 256MB with `volatile-lru`).
