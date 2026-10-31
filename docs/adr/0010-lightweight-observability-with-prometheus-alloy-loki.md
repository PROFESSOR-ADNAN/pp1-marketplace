# ADR 0010: Lightweight Observability with Prometheus, Alloy, and Loki

## Status
Accepted

## Context
Observability must include structured logs, metrics, alerting, and dashboards, but must stay within ~500MB total RAM on a 4GB/8GB VPS. Promtail is retired and deprecated.

## Decision
Deploy a minimal modern telemetry stack:
1. **Metrics:** Prometheus collecting from Node Exporter, Redis Exporter, MongoDB Exporter, Nginx, and custom Express `/metrics` (using `prom-client`).
2. **Logs:** Express and BullMQ emit structured JSON with `reqId`. Grafana Alloy (modern, active replacement for Promtail) tails Docker container logs and ships to Loki.
3. **Dashboards & Alerts:** Grafana with Alertmanager routing to Slack/Email.
4. **Tracing:** OpenTelemetry SDK initialized inside Node; traces logged with traceId; Tempo omitted initially to stay within the memory budget.

## Alternatives Considered
- **Promtail:** Retired by Grafana Labs in favor of Grafana Alloy.
- **Full ELK stack (Elasticsearch/Logstash/Kibana):** Exceeds 2GB RAM just for Elasticsearch.
- **Datadog / SaaS APM:** High recurring costs violate the $25/month budget constraint.

## Consequences
- **Positive:** Modern, fully supported stack with total memory footprint under 500MB.
- **Negative:** Traces rely on correlated log trace IDs rather than full distributed visualization.
