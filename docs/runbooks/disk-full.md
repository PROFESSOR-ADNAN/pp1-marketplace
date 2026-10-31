# Runbook: Disk Full

## Symptoms
- Disk usage alert > 80% on VPS.
- Database write stalls or log writes fail.

## Remediation
1. Check disk utilization:
   ```bash
   df -h
   ```
2. Clean stale Docker build caches and images:
   ```bash
   docker system prune -af --volumes
   ```
3. Rotate and truncate older log archives.
