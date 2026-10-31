terraform {
  required_version = ">= 1.8.0"
}

variable "zone_id" { type = string }
variable "domain" { type = string }
variable "origin_ip" { type = string }

# Cloudflare DNS & WAF configurations
