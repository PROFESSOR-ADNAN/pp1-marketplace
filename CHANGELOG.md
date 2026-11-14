# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-11-14)


### Features

* complete product card navigation, multi-image management, seller/buyer verification, product hiding, and courier delivery portal ([33c4989](https://github.com/PROFESSOR-ADNAN/souq/commit/33c4989094116c50705dfb8936fee4c503cde81c))
* complete Seller product management, Admin operations dashboard, rich Product details, and checkout error fix ([92db3de](https://github.com/PROFESSOR-ADNAN/souq/commit/92db3debf31072aa8e1d7af9886f422852cb3596))
* complete SOUQ production-grade multi-vendor marketplace platform ([94fe1ad](https://github.com/PROFESSOR-ADNAN/souq/commit/94fe1ad59ededd69d449c16b5d059c042a245ff8))
* **deploy:** add render.yaml blueprint and dual API+Worker start command for Render ([1b78268](https://github.com/PROFESSOR-ADNAN/souq/commit/1b78268fc517a0f28858fe84cbb0cff79aa56f72))
* **deploy:** configure api/vercel.json with dist output and export default app for souq-backend ([470ec5c](https://github.com/PROFESSOR-ADNAN/souq/commit/470ec5c0f8016f4e5c79b7b7bf987d056d34aee4))
* **deploy:** configure Vercel serverless API routing, connectDB caching, and updated admin seed ([4b91aeb](https://github.com/PROFESSOR-ADNAN/souq/commit/4b91aeb473add30e147fd0f284a6ed1187a90d61))
* **deploy:** generate full-stack server entrypoints for Vercel in web/dist and root ([f095814](https://github.com/PROFESSOR-ADNAN/souq/commit/f0958148e2f8930f73368ecfcffed5b169488e39))
* **marketplace:** portfolio flagship upgrades - demo switcher, vat tax invoices, live delivery tracking, live search, wishlist, promo codes, and seller dashboard ([61f6a79](https://github.com/PROFESSOR-ADNAN/souq/commit/61f6a794171dec8caaabbdf358e272aeee1d5ab6))
* **notifications:** integrate AfroMessage SMS and Gmail transactional email services ([9b28db2](https://github.com/PROFESSOR-ADNAN/souq/commit/9b28db21c4b2b63bd50f4e78df75b328f7c07032))
* **web:** add rich authentic Ethiopian sample products and full catalog pages ([509ffae](https://github.com/PROFESSOR-ADNAN/souq/commit/509ffaef5bee76af92d82caa38409e69028be8a5))
* **web:** persist user session in localStorage and display live user badge in navbar ([bfa733e](https://github.com/PROFESSOR-ADNAN/souq/commit/bfa733e6a82336b56a11fb539393f8e48adf333d))
* **web:** support dynamic VITE_API_URL environment variable ([783fa72](https://github.com/PROFESSOR-ADNAN/souq/commit/783fa72fac5331f78028151f5c4821dd82d48568))


### Bug Fixes

* **api:** resolve helmet TypeScript call signature incompatibility for Vercel build ([af56e9b](https://github.com/PROFESSOR-ADNAN/souq/commit/af56e9bbadacd0689ac17c0a5b66964ec7e3c653))
* **build:** precompile @souq/shared dist and order root build sequence for Vercel ([3cd7437](https://github.com/PROFESSOR-ADNAN/souq/commit/3cd74378c82998d12fd6500b5db2acb6af59cbad))
* **chapa:** dynamic return/callback URLs, instant order reconciliation endpoint, and robust webhook verification ([59f1c9a](https://github.com/PROFESSOR-ADNAN/souq/commit/59f1c9a33d8eaad64823205fa4428e87e0ff2766))
* **config:** ensure api/.env is loaded across workspace commands ([50638a8](https://github.com/PROFESSOR-ADNAN/souq/commit/50638a8131a65b7eff05b46b5de9f95b0cf1d325))
* **deploy:** ensure [@types](https://github.com/types) dependencies are preserved in production build on Render ([e1b3d99](https://github.com/PROFESSOR-ADNAN/souq/commit/e1b3d999c906b21b0210fc4858437413b653a2a8))
* **payment:** resolve chapa return url duplication, add robust order confirmation and routes ([c3278eb](https://github.com/PROFESSOR-ADNAN/souq/commit/c3278eb83cc96919b0fc0e4d55485c13e7cff31b))
* **web:** fallback production API URL to live Render backend to eliminate Failed to fetch ([42d99a6](https://github.com/PROFESSOR-ADNAN/souq/commit/42d99a6c11bdf01f2a9b11a42744589b54ffa8da))
* **web:** resolve TypeScript strict build errors and add vite-env types for Vercel deployment ([9c51475](https://github.com/PROFESSOR-ADNAN/souq/commit/9c51475460431db85ec981d680dca5d9d9be91d8))
* **web:** support flexible token and user payload parsing in AuthContext ([c56bc2e](https://github.com/PROFESSOR-ADNAN/souq/commit/c56bc2e9330bd2c2fd573b1488a725954d4a0f26))

## [0.1.0] - 2026-11-01
### Added
- Complete architecture specification and 11 Architectural Decision Records (ADRs).
- Strict integer santim financial handling across domain entities.
- Two-phase inventory reservation algorithm and BullMQ delay queue.
- Chapa payment integration with server-side HMAC verification and idempotency keys.
- Order finite state machine with audit trails.
- Local dev Docker Compose setup with MongoDB single-node replica set, Redis, MinIO, and Mailpit.
- React 18 / Vite / Tailwind SPA with English and Amharic i18n support.
