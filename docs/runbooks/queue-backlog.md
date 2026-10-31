# Runbook: BullMQ Queue Backlog

## Symptoms
- BullMQ queue latency spikes, delayed reservation expiry.

## Remediation
1. Check Redis memory and queue length:
   ```bash
   docker compose -f docker/compose.prod.yaml exec redis redis-cli info memory
   ```
2. Restart BullMQ worker service:
   ```bash
   docker compose -f docker/compose.prod.yaml restart worker
   ```
