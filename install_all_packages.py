#!/usr/bin/env python3
import paramiko
import time

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    # List of all required packages
    packages = [
        'pymupdf',
        'pillow', 
        'reportlab',
        'pdf2docx',
        'opencv-python',
        'imageio',
        'imageio-ffmpeg',
        'numpy',
        'scipy',
        'scikit-image',
        'requests',
        'python-dotenv',
        'rembg',
        'torch',
        'torchvision',
        'easyocr',
        'pytesseract',
        'librosa',
        'pydub',
        'yt-dlp',
        'instagrapi',
        'cryptography',
        'fpdf2',
        'pdfrw',
        'PyPDF2',
        'python-pptx',
        'openpyxl',
        'XlsxWriter',
        'beautifulsoup4',
        'lxml',
        'aiohttp',
    ]
    
    print(f"[*] Installing {len(packages)} packages to virtual environment...")
    
    # Install all at once
    package_list = ' '.join(packages)
    stdin, stdout, stderr = client.exec_command(
        f'cd /var/www/simplifytools && .venv/bin/pip install -q {package_list}',
        timeout=600
    )
    
    # Show progress
    for line in iter(lambda: stdout.readline(1024), b''):
        if line:
            print(line.decode(), end='')
    
    stdout.read()
    stderr_output = stderr.read().decode()
    
    if stderr_output and 'error' in stderr_output.lower():
        print(f"\nWarnings/Errors:\n{stderr_output[:500]}")
    
    print("\n[*] Installation complete!")
    
    # Test import
    print("\n[*] Testing critical imports...")
    test_imports = [
        'pymupdf',
        'imageio',
        'PIL',
        'cv2',
        'numpy',
        'requests',
    ]
    
    for imp in test_imports:
        stdin, stdout, stderr = client.exec_command(
            f'.venv/bin/python -c "import {imp}; print(\'✓ {imp}\')"'
        )
        result = stdout.read().decode().strip()
        print(f"  {result if result else f'✗ {imp}'}")
    
    # Restart app
    print("\n[*] Restarting app...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node')
    stdout.read()
    time.sleep(2)
    
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run start &'
    )
    time.sleep(3)
    
    print("✅ DONE - Try PDF now")
    
    client.close()
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
