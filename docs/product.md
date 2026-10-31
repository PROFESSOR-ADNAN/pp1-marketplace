# SOUQ Product Requirements Document (PRD)

## 1. Executive Summary
"Souq" is a multi-vendor marketplace platform purpose-built for the Ethiopian e-commerce ecosystem. It connects local merchants (shifting from Telegram channels and Facebook groups) with buyers across Addis Ababa and regional cities, settling all transactions in Ethiopian Birr (ETB) with support for Telebirr, CBE Birr, and card payments via Chapa.

## 2. User Personas
- **Buyer (Abebe):** Browses on low-speed 3G/4G mobile networks, shops in English or Amharic, pays with Telebirr/CBE Birr, specifies landmark-based Ethiopian delivery addresses, and expects a verification phone call prior to dispatch.
- **Seller (Tigist):** Small to medium merchant selling electronics or fashion. Manages product listings, tracks pending orders, receives order dispatch notifications, and audits payout earnings.
- **Platform Admin (Dawit):** Reviews seller KYC/onboarding applications, monitors system health, audits transactions, manages disputes, and exports platform fee commission ledgers.

## 3. MVP vs Later Features

### MVP (In Scope)
- Role-based accounts (`buyer`, `seller`, `admin`) with admin approval for sellers.
- Product catalog CRUD, multi-image upload with WebP conversion, stock management.
- Category navigation, search, filters (price, category, condition), cursor pagination.
- Shopping cart with live price re-computation and inventory verification.
- Two-phase inventory reservation with automatic 15-minute expiration release.
- Chapa payment integration (Telebirr, CBE Birr, cards) with webhook signature verification and server-to-server reconciliation.
- Strict Order State Machine (`PENDING_PAYMENT` -> `PAID` -> `CONFIRMED_BY_SELLER` -> `SHIPPED` -> `DELIVERED`).
- Ethiopian localized address schema (Region, City, Sub-city, Woreda, Landmark, Phone).
- Asynchronous BullMQ email and notification queue.
- Verified reviews (only for buyers of delivered products).
- Seller and Admin dashboards with financial ledger.
- English and Amharic UI with Ethiopic font support.

### Out of Scope (Later)
- Buyer-to-seller live chat.
- Automated instant split payouts (manual admin CSV payout export in MVP).
- Promotional voucher and discount coupon engine.
- Wishlist functionality.
- Native iOS / Android mobile applications.

## 4. User Stories & Acceptance Criteria (Traceability)

| ID | User Story | Acceptance Criteria | Automated Test Mapping |
|---|---|---|---|
| US-01 | As a buyer, I cannot buy more units than in stock. | Under 500 concurrent buy attempts for 50 items, exactly 50 succeed, 450 receive out-of-stock error, and final stock is exactly 0. | `tests/integration/inventory-concurrency.test.ts` |
| US-02 | As a system, an unpaid order releases reserved stock. | If checkout is not paid within 15 minutes, BullMQ releases reserved stock back to active inventory and marks order `EXPIRED`. | `tests/integration/order-state-machine.test.ts` |
| US-03 | As a seller, I can only see and manage my own listings. | Querying `/api/v1/products/mine` or updating product returns only items matching seller ID; cross-seller mutation returns 403. | `tests/integration/auth.test.ts` |
| US-04 | As a buyer, I can register with email and password. | Password must be >= 8 chars, hashed with bcrypt (cost 12), user defaults to `buyer` role. | `tests/unit/token.test.ts`, `tests/integration/auth.test.ts` |
| US-05 | As an attacker, I cannot enumerate registered emails. | Login endpoint returns generic "Invalid email or password" for both non-existent users and incorrect passwords. | `tests/integration/auth.test.ts` |
| US-06 | As an attacker, brute force login attempts are throttled. | 5 consecutive failed login attempts trigger a 15-minute account lockout in Redis. | `tests/integration/auth.test.ts` |
| US-07 | As a user, my session uses rotating refresh tokens. | Access token expires in 15m; refresh token rotates on use; replay of an old refresh token revokes token family. | `tests/integration/auth.test.ts` |
| US-08 | As an admin, I require MFA to access admin routes. | Admin login requires valid TOTP token or setup flow. | `tests/integration/auth.test.ts` |
| US-09 | As a seller, I must be approved before publishing. | Seller profile created in `pending_approval`; cannot publish active products until admin approves. | `tests/integration/auth.test.ts` |
| US-10 | As a buyer, prices are stored in integer santim. | Order items and product prices store integer values (e.g., 25000 santim = 250.00 ETB); floats are prohibited. | `tests/unit/orderStateMachine.test.ts` |
| US-11 | As a buyer, my cart snapshots price only at checkout. | Cart lines reflect live product prices; checkout snapshots price into immutable order items. | `tests/integration/order-state-machine.test.ts` |
| US-12 | As a buyer, I pay using Chapa hosted checkout. | Server initializes transaction with amount, currency ETB, and returns Chapa `checkout_url`. | `tests/integration/webhook-idempotency.test.ts` |
| US-13 | As a merchant, webhooks must be verified by HMAC. | Webhook endpoint rejects requests lacking valid `x-chapa-signature` matching HMAC-SHA256 of raw body. | `tests/integration/webhook-idempotency.test.ts` |
| US-14 | As a system, duplicate webhooks are idempotent. | Replaying the same Chapa webhook event produces identical 200 response without duplicate stock decrements. | `tests/integration/webhook-idempotency.test.ts` |
| US-15 | As a buyer, browser redirects never prove payment. | Order transitions to `PAID` only when webhook or server verify confirms payment status with Chapa API. | `tests/integration/webhook-idempotency.test.ts` |
| US-16 | As a system, illegal order transitions are blocked. | Attempting to move an order from `PENDING_PAYMENT` to `SHIPPED` throws FSM transition error. | `tests/unit/orderStateMachine.test.ts` |
| US-17 | As a seller, I can confirm and ship paid orders. | Sellers can transition orders from `PAID` to `CONFIRMED_BY_SELLER` and then `SHIPPED`. | `tests/unit/orderStateMachine.test.ts` |
| US-18 | As a buyer, I provide Ethiopian delivery addresses. | Address validation requires Region, City, SubCity, Landmark, and phone in format +2519... | `tests/unit/sanitize.test.ts` |
| US-19 | As a buyer, I receive an email when my order is paid. | BullMQ queue processes email sending via background worker without delaying HTTP responses. | `tests/integration/order-state-machine.test.ts` |
| US-20 | As a buyer, I can only review delivered products. | Review creation verifies buyer has an order for the product with status `DELIVERED`. | `tests/integration/order-state-machine.test.ts` |
| US-21 | As a user, I can toggle between English and Amharic. | UI re-renders with Amharic translations and Noto Sans Ethiopic font. | `tests/e2e/checkout-flow.spec.ts` |
| US-22 | As an admin, I can view platform commission ledger. | Payout ledger records 5% platform fee on every confirmed paid order. | `tests/unit/orderStateMachine.test.ts` |
| US-23 | As a user, I can export my personal data. | GDPR/Ethiopian Proclamation compliant endpoint exports user profile, addresses, and orders in JSON. | `tests/integration/auth.test.ts` |
| US-24 | As a user, I can request account deletion. | Deleting account anonymizes personal data while preserving immutable financial audit orders. | `tests/integration/auth.test.ts` |
| US-25 | As a client, pagination uses cursor pagination. | Products and orders support cursor-based pagination with max limit 50 to prevent offset scan overhead. | `tests/integration/inventory-concurrency.test.ts` |
