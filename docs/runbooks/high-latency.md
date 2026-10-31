# Runbook: High Latency

## Symptoms
- p95 latency exceeds 300ms.
- High CPU utilization on API containers.

## Remediation
1. Inspect top processes and Docker stats:
   ```bash
   docker stats --no-stream
   ```
2. Check MongoDB slow queries:
   ```bash
   docker compose -f docker/compose.prod.yaml exec mongo mongosh --eval "db.currentOp()"
   ```
