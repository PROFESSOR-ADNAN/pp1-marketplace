# Runbook: Memory Leak

## Symptoms
- Container memory usage continuously rises without plateauing.

## Remediation
1. Identify high memory container:
   ```bash
   docker stats
   ```
2. Gracefully restart affected API replica to recycle V8 heap:
   ```bash
   docker compose -f docker/compose.prod.yaml restart api-1
   ```
