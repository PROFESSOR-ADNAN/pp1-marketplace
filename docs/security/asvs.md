# OWASP ASVS Level 2 Security Verification Checklist

| Chapter | Requirement | Status | Architecture / Implementation Proof |
|---|---|---|---|
| V1: Architecture | Threat model documented and updated | DONE | Documented in `docs/security/threat-model.md` |
| V2: Authentication | Passwords hashed with bcrypt cost 12 or Argon2id | DONE | Implemented in `api/src/models/User.ts` (bcrypt salt 12) |
| V2: Authentication | Generic error message for failed login | DONE | Identical "Invalid email or password" returned in `auth.service.ts` |
| V2: Authentication | Brute-force throttling & account lockout | DONE | 5 attempts window enforced via Redis / `rateLimiter.ts` |
| V2: Authentication | Multi-Factor Authentication (TOTP) for Admins | DONE | Implemented via `otplib` and enforced in `admin.routes.ts` |
| V3: Session Mgmt | Refresh token rotation and reuse detection | DONE | Cryptographic SHA-256 tokens rotated on use; reuse revokes family |
| V3: Session Mgmt | Cookies use `httpOnly`, `Secure`, `SameSite=Strict` | DONE | Enforced in `auth.controller.ts` cookie options |
| V4: Access Control | Principle of least privilege / RBAC | DONE | Buyer, Seller, Admin roles enforced in `middleware/auth.ts` |
| V4: Access Control | Horizontal IDOR protection on Seller resources | DONE | `assertOwnership` checks verify seller ID matches authenticated user |
| V5: Input Validation | Schema validation on all inbound HTTP requests | DONE | Strict Zod validation via `middleware/validate.ts` |
| V5: Input Validation | MongoDB operator injection sanitization | DONE | `utils/sanitize.ts` strips keys starting with `$` |
| V8: Data Protection | Sensitive data redacted in application logs | DONE | Pino log redaction for passwords, tokens, phones, emails |
| V8: Data Protection | Ethiopian Personal Data Protection Compliance | DONE | Proclamation No. 1321/2024 export and deletion endpoints live |
| V9: Communications | TLS 1.2 / 1.3 only with modern ciphers | DONE | Configured in `nginx/snippets/ssl.conf` |
| V10: Malicious Files| Safe upload processing with Sharp re-encoding | DONE | Images re-encoded to WebP format, stripped of EXIF data |
| V11: Business Logic | Concurrency protection on finite inventory | DONE | Atomic Two-Phase stock reservation via MongoDB session transactions |
| V11: Business Logic | Server-side financial recomputation in santim | DONE | Cart and orders recompute prices server-side in integer santim |
