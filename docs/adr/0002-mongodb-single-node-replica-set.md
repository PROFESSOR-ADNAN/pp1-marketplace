# ADR 0002: MongoDB Single-Node Replica Set

## Status
Accepted

## Context
Multi-item inventory reservation and order payment reconciliation require ACID multi-document transactions. Standalone MongoDB instances do not support transactions; MongoDB requires replica set oplog capabilities.

## Decision
Configure MongoDB as a single-node replica set (`rs0`) in Docker Compose, automated via an initialization script/healthcheck that invokes `rs.initiate()`.

## Alternatives Considered
- **Standalone MongoDB:** Disallows session transactions, leading to partial stock reservation corruption on multi-item checkout failures.
- **Multi-Node Replica Set (3 nodes on one VPS):** Triples memory consumption without true multi-machine hardware redundancy.
- **MongoDB Atlas Cloud:** Free tier works well for development, but self-hosted single-node replica set within Docker eliminates network latency to the database.

## Consequences
- **Positive:** Enables full ACID session transactions (`session.withTransaction`) locally and in production.
- **Negative:** High availability failover is not present on a single host; disaster recovery relies on verified automated backups.
