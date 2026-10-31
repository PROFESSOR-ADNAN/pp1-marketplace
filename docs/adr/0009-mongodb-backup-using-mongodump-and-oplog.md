# ADR 0009: MongoDB Backup Using mongodump and Oplog

## Status
Accepted

## Context
Disaster recovery requires an RPO ≤ 24 hours (target ≤ 4 hours) and RTO ≤ 2 hours within the $25/month budget.

## Decision
1. Automated daily backup script using `mongodump --archive --gzip --oplog`.
2. Encrypted with `restic` or OpenSSL and pushed to off-site cloud storage (Backblaze B2 / Cloudflare R2).
3. 3-2-1 retention: 7 daily, 4 weekly, 3 monthly.
4. Monthly automated restore test script that spins up a test container, restores the dump, and validates document count integrity.

## Alternatives Considered
- **Percona Backup for MongoDB (PBM):** Requires Percona Server for MongoDB; standard MongoDB community image does not include PBM agent natively.
- **Filesystem volume snapshots:** Requires stopping the database container or risk snapshot corruption.

## Consequences
- **Positive:** Lightweight, standard tooling, low memory footprint, point-in-time recovery via oplog.
- **Negative:** Large collections take longer to dump; sufficient for MVP scale (<50GB).
