#!/bin/bash

# Update system
sudo apt update -y

# Install Docker
sudo apt install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# ✅ Fix SonarQube memory requirement (IMPORTANT)
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Pull and run SonarQube container
sudo docker run -d \
  --name sonarqube \
  --restart=always \
  -p 9000:9000 \
  sonarqube:lts

# Wait for SonarQube to initialize
sleep 30

# Log completion
echo "SonarQube installation completed" > /home/ubuntu/setup.log