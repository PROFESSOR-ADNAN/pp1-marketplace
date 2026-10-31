# STRIDE Threat Model

## 1. System Scope & Assets
Critical Assets: Customer PII (phone, address), Merchant Payout Balances, Chapa API Secrets, JWT Signing Keys, Product Inventory Counts.

## 2. Threat Analysis & Mitigations

### Spoofing (S)
- **Threat:** Attacker impersonates Chapa webhook delivery to mark an order `PAID` without sending funds.
- **Mitigation:** Constant-time HMAC-SHA256 signature verification matching `CHAPA_WEBHOOK_SECRET` on raw body, followed by mandatory server-to-server query against Chapa's verify endpoint.

### Tampering (T)
- **Threat:** Buyer modifies product unit price or order total in the HTTP request payload during checkout.
- **Mitigation:** All prices, discounts, and order totals are strictly re-queried and computed server-side directly from the database in integer santim. Client prices are ignored.

### Repudiation (R)
- **Threat:** Seller or Buyer denies initiating an order state transition or delivery confirmation.
- **Mitigation:** Comprehensive immutable `AuditLog` collection records user ID, IP address, user agent, timestamps, and previous/next states for every order mutation.

### Information Disclosure (I)
- **Threat:** Attacker enumerates registered user emails via brute-force login feedback.
- **Mitigation:** Uniform error messages and constant-time dummy bcrypt hashing for both non-existent users and incorrect passwords.

### Denial of Service (D)
- **Threat:** Flash-sale bot storms exhaust inventory or lock down database connections.
- **Mitigation:** Sliding window rate limiters (Nginx + Redis), atomic reservation query filters, and 15-minute BullMQ expiration sweeps.

### Elevation of Privilege (E)
- **Threat:** Buyer crafts payload with `role: "admin"` during registration or edits someone else's product.
- **Mitigation:** Self-registration strictly restricts role selection to `buyer` or `seller` (admin role can only be granted directly in DB); object-level ownership checks prevent cross-seller mutations.
