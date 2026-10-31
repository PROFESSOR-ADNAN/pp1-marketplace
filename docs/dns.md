# SOUQ DNS Configuration Specification

| Record Type | Name | Target / Value | Purpose |
|---|---|---|---|
| A | `@` | Cloudflare Proxy IPv4 (or Origin IP) | Apex Domain Resolution |
| AAAA | `@` | Cloudflare Proxy IPv6 | IPv6 Support |
| CNAME | `www` | `example.com` | Redirect to Apex Domain |
| CNAME | `api` | `example.com` | Dedicated API Hostname |
| TXT | `@` | `v=spf1 include:_spf.mailprovider.com ~all` | Sender Policy Framework (SPF) |
| TXT | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:dmarc@example.com` | Email DMARC Policy |
| CAA | `@` | `0 issue "letsencrypt.org"` | Certificate Authority Authorization |
