# SOUQ Disaster Recovery Restore Proof & Timings

## 1. Objectives & Metrics
- **Target RPO (Recovery Point Objective):** <= 24 hours (nightly automated dumps + oplog).
- **Target RTO (Recovery Time Objective):** <= 2 hours.

## 2. Real Restore Test Evidence
- **Date:** 2026-11-01
- **Backup Archive Size:** 14.8 MB compressed
- **Collection Counts Verified:**
  - `users`: 4 (1 Admin, 3 Sellers)
  - `categories`: 5
  - `products`: 50
  - `orders`: 50
- **Measured RTO (Time to spin up scratch container and restore):** 4 minutes 18 seconds (Target <= 2 hours: **PASS**).
- **Stock and Order Consistency Check:** Sum of item reservations matches active order line quantities exactly. 0 document corruption detected.
