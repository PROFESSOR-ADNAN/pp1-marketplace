# ADR 0001: Single VPS Docker Compose Over Kubernetes

## Status
Accepted

## Context
The platform target is an early-stage multi-vendor marketplace targeting up to 500 concurrent users and 50 req/s sustained traffic with an operational infrastructure budget strictly capped at $25/month. High complexity clustering adds cognitive overhead and cost.

## Decision
Deploy the entire production stack using Docker Compose on a single Ubuntu VPS (2–4 vCPU, 4–8 GB RAM) behind Cloudflare and an Nginx reverse proxy. Zero-downtime deployments will be handled via Nginx blue/green upstream switching.

## Alternatives Considered
- **Kubernetes (k3s / EKS / GKE):** Minimum multi-node control planes exceed the $25/month budget and create high operational overhead for a solo developer.
- **Serverless / PaaS (e.g. Heroku, Render):** Higher recurring costs for database, Redis, worker, and network egress limits control over transactions and low-latency internal networking.

## Consequences
- **Positive:** Fits comfortably under $25/month (e.g., Hetzner / DigitalOcean), single-command reproducible dev/prod parity, ultra-low internal network latency on Docker bridge.
- **Negative:** Horizontal scaling across multiple machines is not automatic; requires vertical scaling or managed DB migration when exceeding 100 req/s.
