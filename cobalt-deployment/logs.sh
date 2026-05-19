#!/bin/bash

# View Cobalt logs

cd ~/cobalt

echo "Cobalt container logs (last 50 lines):"
echo "======================================="
docker compose logs -n 50 cobalt

echo ""
echo "Press Ctrl+C to exit real-time logs (if enabled)"
echo "To see real-time logs, use: docker compose logs -f"
