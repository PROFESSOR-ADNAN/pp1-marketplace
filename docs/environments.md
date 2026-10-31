# SOUQ Environments Matrix

| Property | Local Dev | Staging | Production |
|---|---|---|---|
| Infrastructure | Host Docker Compose | Single VPS (cx31, 8GB) | Single VPS (cx31, 8GB) |
| Reverse Proxy | Vite HMR / Direct Port | Nginx + Staging SSL | Nginx + Cloudflare WAF |
| Database | Mongo 7.0 Replica Set `rs0` | Mongo 7.0 Replica Set `rs0` | Mongo 7.0 Replica Set `rs0` |
| Cache & Queues | Redis 7 Alpine | Redis 7 Alpine | Redis 7 Alpine |
| Payments | Chapa Test / Mock Mode | Chapa Test Mode (`CHASECK_TEST`) | Chapa Live Mode (`CHASECK_LIVE`) |
| Currency | ETB (Integer Santim) | ETB (Integer Santim) | ETB (Integer Santim) |
| Email Delivery | Mailpit (Web UI 8025) | Mailpit / Test SMTP | Transactional SMTP |
| Object Storage | MinIO container | S3 / Cloudflare R2 Staging | Cloudflare R2 Production |
| Telemetry | Local Prometheus & Alloy | Prometheus, Alloy, Loki | Prometheus, Alloy, Loki, Alertmanager |
