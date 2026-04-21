#!/bin/bash
# Fix CFFI version mismatch on VPS

echo "=== Fixing CFFI Version Mismatch ==="

# Navigate to venv if it exists
VENV_PATH="/var/www/simplifytools/venv"

if [ -d "$VENV_PATH" ]; then
    echo "Activating virtual environment..."
    source $VENV_PATH/bin/activate
else
    echo "Virtual environment not found at $VENV_PATH"
    exit 1
fi

# Uninstall conflicting packages
echo "Removing conflicting packages..."
pip uninstall cffi pycryptodome PyPDF2 pycryptodomex -y

# Clean pip cache
pip cache purge

# Reinstall with compatible versions (matching system cffi 1.16.0)
echo "Installing compatible versions..."
pip install --upgrade setuptools wheel
pip install cffi==1.16.0 pycryptodome==3.19.0 PyPDF2==3.0.1 --no-cache-dir

# Verify installation
echo ""
echo "=== Verification ==="
python -c "import cffi; print(f'cffi version: {cffi.__version__}')"
python -c "import Crypto; print('pycryptodome: OK')"
python -c "import PyPDF2; print(f'PyPDF2: OK')"

echo ""
echo "✓ CFFI mismatch fixed!"
