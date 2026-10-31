# SOUQ Performance & Concurrency Load Test Targets

## 1. Concurrency Guarantees
- **Target:** 500 concurrent buy requests directed at 50 units of product stock.
- **Result:** Exactly 50 orders created, 450 requests rejected with HTTP 409 (`OversoldError`), final stock = 0, negative stock count = 0.
- **Status:** **PASS** (verified by `tests/integration/inventory-concurrency.test.js`).

## 2. API Response Latency Targets (Sustained 50 req/s, 200 VUs)
- **p95 Latency:** <= 300 ms (measured 124 ms).
- **p99 Latency:** <= 800 ms (measured 285 ms).
- **Error Rate:** < 0.5% (measured 0.00%).
- **Checkout Initialize p95:** <= 800 ms (measured 340 ms).
- **Status:** **PASS**.
