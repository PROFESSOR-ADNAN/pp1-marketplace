# Runbook: Chapa Outage or Webhook Failure

## Symptoms
- Orders remain stuck in `PENDING_PAYMENT` despite customer confirmation.
- Webhook signature failures or timeouts in application logs.

## Diagnosis
```bash
docker compose -f docker/compose.prod.yaml logs --tail=100 api-1 | grep -i chapa
```

## Remediation
1. Trigger the background reconciliation sweep:
   ```bash
   docker compose -f docker/compose.prod.yaml exec api-1 node -e "import('./dist/services/chapa.service.js')"
   ```
2. Verify Chapa gateway status at `https://status.chapa.co`.
