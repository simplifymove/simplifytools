#!/usr/bin/env python3
import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=10)
    
    print("=" * 90)
    print("VPS PYTHON DEPENDENCIES CHECK (74 Packages)")
    print("=" * 90)
    
    # Check Python version
    stdin, stdout, stderr = ssh.exec_command('python3 --version')
    py_version = stdout.read().decode().strip()
    print(f"\n✓ Python Version: {py_version}")
    
    # All 74 packages to check
    packages = [
        # AI/ML Core
        ('torch', '2.11.0'),
        ('torchvision', '0.26.0'),
        ('onnxruntime', '≥1.16.0'),
        
        # Image Processing
        ('Pillow', '12.1.1'),
        ('pillow_heif', '1.3.0'),
        ('opencv-python', '4.13.0.92'),
        ('opencv-python-headless', '4.13.0.92'),
        ('scikit-image', '0.26.0'),
        ('tifffile', '2026.3.3'),
        ('imageio', '2.37.3'),
        
        # Background Removal
        ('rembg', '2.0.72'),  # VPS version
        ('PyMatting', '1.1.15'),
        ('easyocr', '1.7.2'),
        
        # PDF Processing
        ('pdfminer.six', '20251230'),
        ('pdfplumber', '0.11.9'),
        ('pikepdf', '10.5.1'),
        ('PyPDF2', '3.0.1'),
        ('pypdfium2', '5.6.0'),
        ('PyMuPDF', '1.27.2.2'),
        ('reportlab', '4.4.10'),
        
        # Document Formats
        ('python-docx', '1.2.0'),
        ('python-pptx', '1.0.2'),
        ('openpyxl', '3.1.5'),
        ('xlsxwriter', '3.2.9'),
        
        # Data Processing
        ('pandas', '3.0.1'),
        ('numpy', '2.4.3'),
        ('scipy', '1.17.1'),
        ('networkx', '3.6.1'),
        
        # Serialization
        ('protobuf', '6.33.6'),
        ('jsonschema', '4.26.0'),
        ('PyYAML', '6.0.3'),
        ('lxml', '6.0.2'),
        
        # Utilities
        ('requests', '2.33.0'),
        ('certifi', '2026.2.25'),
        ('charset-normalizer', '3.4.6'),
        ('idna', '3.11'),
        ('urllib3', '2.6.3'),
        ('tqdm', '4.67.3'),
        ('colorama', '0.4.6'),
        ('packaging', '26.0'),
        ('platformdirs', '4.9.6'),
        ('filelock', '3.25.2'),
        
        # Math/Science
        ('mpmath', '1.3.0'),
        ('sympy', '1.14.0'),
        
        # Video
        ('yt-dlp', '2026.3.17'),
        
        # Language Support
        ('pytesseract', '0.3.13'),
        ('html2text', '2025.4.15'),
        ('python-bidi', '0.6.7'),
        
        # Cloud & Auth
        ('google-auth', '2.49.1'),
        ('google-cloud-translate', '3.24.0'),
        ('google-api-core', '2.30.0'),
        ('grpcio', '1.78.0'),
        
        # Cryptography
        ('cryptography', '46.0.6'),
        ('pyasn1', '0.6.3'),
        
        # Math/Numerical
        ('llvmlite', '0.47.0'),
        ('numba', '0.65.0'),
        ('lazy-loader', '0.5'),
        
        # Development
        ('pip', '26.0.1'),
        ('setuptools', '81.0.0'),
        
        # XML/Data
        ('et_xmlfile', '2.0.0'),
        
        # System
        ('wrapt', '2.1.2'),
        ('typing_extensions', '4.15.0'),
        ('six', '1.17.0'),
        ('attrs', '26.1.0'),
        ('referencing', '0.37.0'),
        ('rpds-py', '0.30.0'),
        ('tzdata', '2025.3'),
        ('MarkupSafe', '3.0.3'),
        ('Jinja2', '3.1.6'),
        ('pycparser', '3.0'),
        ('cffi', '2.0.0'),
        
        # Optional
        ('ghostscript', '0.8.1'),
        ('shapely', '2.1.2'),
        ('pyclipper', '1.4.0'),
        ('Deprecated', '1.3.1'),
        ('pooch', '1.9.0'),
        ('proto-plus', '1.27.1'),
        ('grpc-google-iam-v1', '0.14.3'),
        ('grpcio-status', '1.78.0'),
        ('pyasn1-modules', '0.4.2'),
        ('google-cloud-core', '2.5.0'),
        ('googleapis-common-protos', '1.73.0'),
        ('python-dateutil', '2.9.0.post0'),
        ('pymupdf-fonts', '1.0.5'),
        ('ninja', '1.13.0'),
    ]
    
    print("\n" + "=" * 90)
    print("PACKAGE INSTALLATION STATUS")
    print("=" * 90)
    
    installed = []
    missing = []
    
    for pkg_name, version in packages:
        cmd = f"python3 -c \"import {pkg_name.replace('-', '_').replace('.', '_')}\" 2>/dev/null && echo 'OK' || echo 'MISSING'"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        result = stdout.read().decode().strip()
        
        if result == 'OK':
            installed.append(pkg_name)
            print(f"✅ {pkg_name:<35} {version:<20} INSTALLED")
        else:
            missing.append(pkg_name)
            print(f"❌ {pkg_name:<35} {version:<20} MISSING")
    
    print("\n" + "=" * 90)
    print("SUMMARY")
    print("=" * 90)
    print(f"✅ Installed: {len(installed)}/{len(packages)}")
    print(f"❌ Missing:   {len(missing)}/{len(packages)}")
    
    if missing:
        print(f"\n⚠️  Missing packages ({len(missing)}):")
        for pkg in missing:
            print(f"  - {pkg}")
    else:
        print("\n🎉 ALL PYTHON PACKAGES INSTALLED!")
    
    # Check pip freeze
    print("\n" + "=" * 90)
    print("INSTALLED PACKAGES LIST")
    print("=" * 90)
    stdin, stdout, stderr = ssh.exec_command('python3 -m pip list --format=json 2>/dev/null | wc -l')
    count = stdout.read().decode().strip()
    print(f"Total packages installed: {count}")
    
    # Check Python site-packages
    stdin, stdout, stderr = ssh.exec_command('python3 -c "import site; print(site.getsitepackages()[0])"')
    site_pkg = stdout.read().decode().strip()
    print(f"Site packages location: {site_pkg}")
    
    # Check site-packages size
    stdin, stdout, stderr = ssh.exec_command(f'du -sh "{site_pkg}"')
    size_info = stdout.read().decode().strip()
    print(f"Site packages size: {size_info}")
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
