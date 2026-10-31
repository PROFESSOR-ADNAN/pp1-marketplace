# ADR 0008: S3-Compatible Storage with Local MinIO Dev

## Status
Accepted

## Context
Product listings require multiple images. Saving images directly to the VPS local disk breaks portability and complicates backups and multi-container setups.

## Decision
Use AWS S3 SDK with S3-compatible object storage:
- In local development: Run a lightweight MinIO (or SeaweedFS) container.
- In production: Use Cloudflare R2 or an S3-compatible object store with free tier (0 egress fee).
- Image uploads are re-encoded and resized with `sharp` into WebP formats before uploading.

## Alternatives Considered
- **Local filesystem uploads in Node container:** Fills container storage, lost on container redeploy unless volume mounted.
- **Base64 in MongoDB:** Bloats document size and consumes high BSON memory.

## Consequences
- **Positive:** Production-ready S3 API, zero egress fees with Cloudflare R2, optimized WebP images.
- **Negative:** Requires S3 credentials and bucket initialization.
