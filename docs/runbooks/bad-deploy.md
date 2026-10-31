# Runbook: Bad Deployment Rollback

## Symptoms
- 5xx error rate spikes > 0.5% after deployment.
- Healthcheck `/healthz` fails or containers exit with code 1.

## Diagnosis
```bash
docker compose -f docker/compose.prod.yaml ps
docker compose -f docker/compose.prod.yaml logs --tail=100 api-1 api-2
```

## Remediation
1. Execute immediate rollback script:
   ```bash
   bash scripts/rollback.sh
   ```
2. Verify system health returns to green:
   ```bash
   bash scripts/smoke-test.sh
   ```
