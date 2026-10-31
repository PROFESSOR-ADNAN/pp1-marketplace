# Server & Network Hardening Guide

## 1. Firewall (UFW)
- Drop all incoming traffic by default:
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 80/tcp comment 'HTTP'
  sudo ufw allow 443/tcp comment 'HTTPS'
  sudo ufw allow in on tailscale0 to any port 22 comment 'SSH via Tailscale VPN only'
  sudo ufw enable
  ```

## 2. SSH Hardening
- Key-based authentication only; root login disabled (`/etc/ssh/sshd_config`):
  ```
  PermitRootLogin no
  PasswordAuthentication no
  PubkeyAuthentication yes
  MaxAuthTries 3
  ```

## 3. Kernel Sysctl Hardening (`/etc/sysctl.d/99-security.conf`)
```
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
fs.file-max = 2097152
```

## 4. Fail2ban Protection
- Automatic IP jail for repeated 401/429 brute-force attempts on Nginx reverse proxy.
