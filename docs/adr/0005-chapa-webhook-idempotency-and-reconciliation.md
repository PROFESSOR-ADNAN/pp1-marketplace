# ADR 0005: Chapa Webhook Idempotency and Reconciliation

## Status
Accepted

## Context
Payment gateways can deliver webhooks multiple times, out of order, or fail to deliver due to network timeouts. Browser redirects can be forged by malicious users.

## Decision
1. Never trust the client return URL as confirmation of payment.
2. Webhooks require constant-time HMAC-SHA256 signature verification matching `process.env.CHAPA_WEBHOOK_SECRET` against the raw request body.
3. Upon receiving a valid webhook, the server queries Chapa's official verification endpoint (`GET /v1/transaction/verify/:tx_ref`) server-to-server.
4. Process reconciliation inside an idempotent transaction: check `order.payment.status`. If already `PAID`, return HTTP 200 immediately without repeated actions.
5. A scheduled reconciliation worker checks all `PENDING_PAYMENT` orders older than 10 minutes against Chapa to catch missed webhooks.

## Alternatives Considered
- **Trusting client redirect parameters:** Trivially bypassed by modifying query strings.
- **Trusting webhook payload directly without server-to-server re-verification:** Vulnerable if webhook secret is ever misconfigured.

## Consequences
- **Positive:** 100% resilient against duplicate delivery, forged requests, and dropped connections.
- **Negative:** Outbound network call to Chapa during verification adds ~300ms latency to webhook processing.
