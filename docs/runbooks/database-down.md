# Runbook: Database Down

## Symptoms
- Prometheus alert `DatabaseDown` fires.
- API logs show `MongoServerSelectionError`.

## Diagnosis
```bash
docker compose -f docker/compose.prod.yaml ps mongo
docker compose -f docker/compose.prod.yaml logs --tail=100 mongo
```

## Remediation
1. Restart MongoDB container:
   ```bash
   docker compose -f docker/compose.prod.yaml restart mongo
   ```
2. If replica set fails to initiate, run:
   ```bash
   docker compose -f docker/compose.prod.yaml exec mongo mongosh --eval "rs.status()"
   ```
