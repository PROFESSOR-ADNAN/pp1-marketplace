# ADR 0007: JWT and Rotating Refresh Tokens in httpOnly Cookies

## Status
Accepted

## Context
Session management must be secure against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) while supporting stateless verification on the API.

## Decision
Implement a dual-token strategy:
1. **Access Token:** Short-lived JWT (15 minutes), containing user ID, role, and email. Stored in memory / auth state.
2. **Refresh Token:** Cryptographically random 64-byte string, stored hashed in the `RefreshTokens` collection, transmitted strictly via `httpOnly`, `Secure`, `SameSite=Strict` cookie with path `/api/v1/auth`.
3. **Rotation & Reuse Detection:** Each refresh generates a new refresh token and invalidates the previous one. If an invalidated refresh token is ever presented, the entire token family is immediately revoked (indicating token theft).

## Alternatives Considered
- **JWT in localStorage:** Vulnerable to XSS token exfiltration.
- **Stateful sessions in Redis only:** Increased Redis coupling for every single API request.

## Consequences
- **Positive:** High security against XSS; immediate mitigation against stolen refresh tokens.
- **Negative:** Requires cookie configuration and CSRF protection headers for cross-origin setups.
