#!/bin/bash

# Update Cobalt to latest version

cd ~/cobalt

echo "Pulling latest Cobalt image..."
docker compose pull

echo ""
echo "Recreating container with latest image..."
docker compose up -d --force-recreate

echo ""
echo "Waiting for container to be healthy..."
sleep 5

echo ""
docker compose ps

echo ""
echo "Testing API..."
curl -s http://localhost:9000/api/json | head -c 200
echo ""
echo ""
echo "✓ Cobalt updated"
