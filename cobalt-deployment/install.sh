#!/bin/bash

# Cobalt Self-Hosted Setup Script
# Installs Docker, Docker Compose, and deploys Cobalt
# For Ubuntu/Debian VPS

set -e

echo "================================"
echo "Cobalt Self-Hosted Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check/Install Docker
echo ""
echo -e "${YELLOW}[STEP 1] Checking Docker installation...${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is already installed${NC}"
    docker --version
else
    echo -e "${YELLOW}Installing Docker...${NC}"
    
    # Update package manager
    sudo apt-get update
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    echo -e "${GREEN}✓ Docker installed successfully${NC}"
    docker --version
fi

# Step 2: Install Docker Compose (if not already installed via plugin)
echo ""
echo -e "${YELLOW}[STEP 2] Checking Docker Compose...${NC}"

if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
    docker compose version
else
    echo -e "${YELLOW}Installing Docker Compose plugin...${NC}"
    sudo apt-get install -y docker-compose-plugin
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
fi

# Step 3: Verify Docker installation
echo ""
echo -e "${YELLOW}[STEP 3] Verifying Docker installation...${NC}"

if sudo docker run hello-world &> /dev/null; then
    echo -e "${GREEN}✓ Docker is working correctly${NC}"
else
    echo -e "${RED}✗ Docker verification failed${NC}"
    exit 1
fi

# Step 4: Create Cobalt directory structure
echo ""
echo -e "${YELLOW}[STEP 4] Creating Cobalt directory structure...${NC}"

COBALT_HOME="${HOME}/cobalt"
mkdir -p "$COBALT_HOME/logs"
mkdir -p "$COBALT_HOME/data"

echo -e "${GREEN}✓ Created directory: $COBALT_HOME${NC}"

# Step 5: Copy docker-compose.yml
echo ""
echo -e "${YELLOW}[STEP 5] Setting up docker-compose configuration...${NC}"

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "$COBALT_HOME/"
    echo -e "${GREEN}✓ Copied docker-compose.yml to $COBALT_HOME${NC}"
else
    echo -e "${RED}✗ docker-compose.yml not found in current directory${NC}"
    echo "Make sure you run this script from the cobalt-deployment directory"
    exit 1
fi

# Step 6: Create .env file
echo ""
echo -e "${YELLOW}[STEP 6] Creating environment configuration...${NC}"

cat > "$COBALT_HOME/.env" << 'EOF'
# Cobalt Configuration
PORT=9000
LOG_LEVEL=info
EOF

echo -e "${GREEN}✓ Created .env file${NC}"

# Step 7: Display summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Navigate to Cobalt directory:"
echo "   cd $COBALT_HOME"
echo ""
echo "2. Start Cobalt:"
echo "   docker compose up -d"
echo ""
echo "3. Check status:"
echo "   docker compose ps"
echo ""
echo "4. View logs:"
echo "   docker compose logs -f"
echo ""
echo "5. Test API:"
echo "   curl http://localhost:9000/api/json"
echo ""
echo -e "${YELLOW}Note:${NC} The API is bound to localhost (127.0.0.1) for security"
echo ""
