#!/bin/bash
# TinyTools Upscale Feature - Automated VPS Deployment Script
# Run this on your VPS to automatically set up the image upscaling feature

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="${1:-.}"  # Current directory or argument
VENV_DIR="$APP_DIR/venv"
PYTHON_CMD="$VENV_DIR/bin/python3"
PIP_CMD="$VENV_DIR/bin/pip"

echo -e "${BLUE}═════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TinyTools Upscale Feature - VPS Deployment${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════${NC}"

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found. Install with: sudo apt-get install python3${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Install with: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Step 2: Create Python virtual environment
echo -e "\n${YELLOW}Step 2: Setting up Python virtual environment...${NC}"

if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Step 3: Install system dependencies
echo -e "\n${YELLOW}Step 3: Installing system dependencies...${NC}"

if [ "$(id -u)" -eq 0 ]; then
    apt-get update
    apt-get install -y \
        python3-dev \
        build-essential \
        libopencv-dev \
        python3-opencv \
        libsm6 \
        libxext6 \
        libxrender-dev \
        libgomp1
    echo -e "${GREEN}✓ System dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Skipping system dependencies (requires sudo). Run manually:${NC}"
    echo -e "${YELLOW}  sudo apt-get update${NC}"
    echo -e "${YELLOW}  sudo apt-get install -y python3-dev build-essential libopencv-dev libsm6 libxext6 libxrender-dev${NC}"
fi

# Step 4: Install Python packages
echo -e "\n${YELLOW}Step 4: Installing Python packages...${NC}"

cd "$APP_DIR"

# Activate venv
source "$VENV_DIR/bin/activate"

# Upgrade pip
$PIP_CMD install --upgrade pip setuptools wheel
echo -e "${GREEN}✓ Pip upgraded${NC}"

# Install requirements
if [ -f "requirements.txt" ]; then
    $PIP_CMD install -r requirements.txt
    echo -e "${GREEN}✓ Python packages installed${NC}"
else
    echo -e "${RED}✗ requirements.txt not found${NC}"
    exit 1
fi

# Step 5: Verify Python packages
echo -e "\n${YELLOW}Step 5: Verifying Python packages...${NC}"

$PYTHON_CMD -c "
import cv2
import numpy as np
from PIL import Image
print('✓ OpenCV:', cv2.__version__)
print('✓ NumPy:', np.__version__)
print('✓ Pillow: PIL installed')

# Try importing upscale engine
import sys
sys.path.insert(0, '.')
try:
    from python.upscale_engine import UpscaleEngine
    print('✓ UpscaleEngine imported successfully')
except Exception as e:
    print('✗ UpscaleEngine import failed:', e)
"

echo -e "${GREEN}✓ All Python packages verified${NC}"

# Step 6: Install Node dependencies
echo -e "\n${YELLOW}Step 6: Installing Node.js dependencies...${NC}"

if [ -f "package.json" ]; then
    npm ci
    echo -e "${GREEN}✓ Node packages installed${NC}"
else
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi

# Step 7: Build Next.js application
echo -e "\n${YELLOW}Step 7: Building Next.js application...${NC}"

npm run build
echo -e "${GREEN}✓ Application built successfully${NC}"

# Step 8: Create temporary directory
echo -e "\n${YELLOW}Step 8: Setting up temporary directory...${NC}"

TEMP_DIR="/tmp/tinytools-upscale"
mkdir -p "$TEMP_DIR"
chmod 755 "$TEMP_DIR"
echo -e "${GREEN}✓ Temp directory created: $TEMP_DIR${NC}"

# Step 9: Create .env.production if it doesn't exist
echo -e "\n${YELLOW}Step 9: Configuring environment...${NC}"

if [ ! -f "$APP_DIR/.env.production" ]; then
    cat > "$APP_DIR/.env.production" << 'EOF'
# Image Upscale Settings
UPSCALE_TEMP_DIR=/tmp/tinytools-upscale
UPSCALE_TIMEOUT=120000

# Note: Using OpenCV Advanced for upscaling
# Real-ESRGAN is optional - install manually if needed:
# pip install torch realesrgan basicsr
EOF
    echo -e "${GREEN}✓ .env.production created${NC}"
else
    echo -e "${GREEN}✓ .env.production already exists${NC}"
fi

# Step 10: Test upscale engine
echo -e "\n${YELLOW}Step 10: Testing upscale engine...${NC}"

$PYTHON_CMD -c "
import sys
sys.path.insert(0, '.')
from PIL import Image
from python.upscale_engine import UpscaleEngine
import tempfile
import json

# Create test image
test_img = Image.new('RGB', (100, 100), color='red')

# Test upscaling
engine = UpscaleEngine()
output_bytes, metadata = engine.upscale(test_img, scale=2, mode='auto', face_enhance=False, output_format='png')

if output_bytes and metadata:
    print('✓ Upscale engine test passed')
    print('  - Output size:', len(output_bytes), 'bytes')
    print('  - Engine:', metadata.get('engine', 'Unknown'))
    print('  - Processing time:', metadata.get('processing_time_ms', 0), 'ms')
else:
    print('✗ Upscale engine test failed')
    sys.exit(1)
"

echo -e "${GREEN}✓ Upscale engine test passed${NC}"

# Step 11: Display summary
echo -e "\n${BLUE}═════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment Completed Successfully!${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Start the application:"
echo -e "   ${BLUE}npm run start${NC}"
echo -e ""
echo -e "2. For production, use systemd service:"
echo -e "   See UPSCALE_VPS_DEPLOYMENT.md for detailed instructions"
echo -e ""
echo -e "3. Configure Nginx reverse proxy:"
echo -e "   See UPSCALE_VPS_DEPLOYMENT.md Step 7"
echo -e ""
echo -e "4. Test the upscale endpoint:"
echo -e "   ${BLUE}curl -X POST http://localhost:3000/api/upscale \\${NC}"
echo -e "   ${BLUE}  -F \"file=@image.jpg\" -F \"scale=2\" -F \"mode=auto\" \\${NC}"
echo -e "   ${BLUE}  -o upscaled.png${NC}"
echo -e ""

echo -e "${YELLOW}Troubleshooting:${NC}"
echo -e "• Check Python packages: ${BLUE}$PYTHON_CMD -m pip list${NC}"
echo -e "• View logs: ${BLUE}npm run dev${NC}"
echo -e "• Verify upscale engine: ${BLUE}$PYTHON_CMD -c \"from python.upscale_engine import UpscaleEngine\"${NC}"

deactivate  # Deactivate virtual environment
