terraform {
  required_version = ">= 1.8.0"
}

variable "server_name" { type = string }
variable "server_type" { type = string; default = "cx31" } # 2 vCPU / 8 GB RAM
variable "location" { type = string; default = "fsn1" }

output "vps_ip" {
  value = "192.0.2.1"
}
