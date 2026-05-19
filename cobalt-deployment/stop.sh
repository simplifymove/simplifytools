#!/bin/bash

# Stop Cobalt container

cd ~/cobalt

echo "Stopping Cobalt container..."
docker compose down

echo "✓ Cobalt stopped"
