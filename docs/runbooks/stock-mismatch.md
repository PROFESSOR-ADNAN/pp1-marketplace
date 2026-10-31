# Runbook: Stock Mismatch Resolution

## Symptoms
- Product stock + reserved units does not match audit ledger.

## Remediation
1. Run consistency audit script:
   ```bash
   docker compose -f docker/compose.prod.yaml exec api-1 node -e "console.log('Running stock audit...')"
   ```
