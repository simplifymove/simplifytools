#!/bin/bash

# Quick start script for Cobalt

cd ~/cobalt

echo "Starting Cobalt container..."
docker compose up -d

echo ""
echo "Waiting for container to be healthy..."
sleep 5

echo ""
docker compose ps

echo ""
echo "Testing API endpoint..."
curl -s http://localhost:9000/api/json | head -c 200
echo ""
echo ""
echo "✓ Cobalt should be accessible at http://localhost:9000"
