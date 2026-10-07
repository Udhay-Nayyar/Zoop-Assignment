#!/usr/bin/env bash
set -euo pipefail

# Install Docker Engine from Docker's official Ubuntu repository.
if [[ "$( . /etc/os-release && echo "$ID" )" != "ubuntu" ]]; then
  echo "This setup script supports Ubuntu 22.04 and 24.04." >&2
  exit 1
fi

sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

source /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-$VERSION_CODENAME} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
echo "Docker is installed. Log out and back in for the docker group membership to take effect."

# Optional: pass --with-swap to provision a persistent 1 GB swapfile.
if [[ "${1:-}" == "--with-swap" ]]; then
  if [[ ! -f /swapfile ]]; then
    sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=1024 status=progress
  fi
  sudo chmod 600 /swapfile
  if ! grep -qE '^[^#].*[[:space:]]/swapfile[[:space:]]' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  fi
  if ! grep -qE '^[^[:space:]]+[[:space:]]+/swapfile[[:space:]]' /proc/swaps; then
    sudo mkswap /swapfile
    sudo swapon /swapfile
  fi
fi

echo "EC2 Docker setup complete."
