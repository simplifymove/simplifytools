#!/usr/bin/env python3
import paramiko
import json
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=10)
    
    print("=" * 80)
    print("VPS NODE.JS DEPENDENCIES CHECK")
    print("=" * 80)
    
    # Check npm version and node_modules
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/simplifytools && npm -v && node -v')
    version_info = stdout.read().decode().strip()
    print(f"\n✓ NPM & Node Status:\n{version_info}")
    
    # Check if node_modules exists and count packages
    stdin, stdout, stderr = ssh.exec_command('ls -lh /var/www/simplifytools/node_modules 2>/dev/null | wc -l')
    module_count = stdout.read().decode().strip()
    print(f"\n✓ Node modules directory: {module_count} items")
    
    # Check each core dependency
    core_deps = [
        '@mediapipe/selfie_segmentation',
        '@tensorflow-models/body-pix',
        '@tensorflow/tfjs',
        'clean-css',
        'docx',
        'enhanced-resolve',
        'framer-motion',
        'html-minifier-terser',
        'html2canvas',
        'jspdf',
        'lucide-react',
        'next',
        'next-auth',
        'nodemailer',
        'pdf-lib',
        'pdfjs-dist',
        'react',
        'react-dom',
        'sharp',
        'signature_pad',
        'tesseract.js',
        'uuid',
        'prettier'
    ]
    
    print("\n" + "=" * 80)
    print("CORE DEPENDENCIES STATUS")
    print("=" * 80)
    
    installed = []
    missing = []
    
    for dep in core_deps:
        cmd = f"test -d '/var/www/simplifytools/node_modules/{dep}' && echo 'EXISTS' || echo 'MISSING'"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        result = stdout.read().decode().strip()
        
        if result == 'EXISTS':
            installed.append(dep)
            print(f"✅ {dep:<45} INSTALLED")
        else:
            missing.append(dep)
            print(f"❌ {dep:<45} MISSING")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✅ Installed: {len(installed)}/{len(core_deps)}")
    print(f"❌ Missing:   {len(missing)}/{len(core_deps)}")
    
    if missing:
        print(f"\nMissing packages:")
        for pkg in missing:
            print(f"  - {pkg}")
    
    # Check package.json
    print("\n" + "=" * 80)
    print("PACKAGE.JSON CHECK")
    print("=" * 80)
    stdin, stdout, stderr = ssh.exec_command('cat /var/www/simplifytools/package.json')
    pkg_json = stdout.read().decode()
    try:
        pkg_data = json.loads(pkg_json)
        print(f"✓ Total dependencies: {len(pkg_data.get('dependencies', {}))}")
        print(f"✓ Total devDependencies: {len(pkg_data.get('devDependencies', {}))}")
    except:
        print("⚠ Could not parse package.json")
    
    # Check node_modules size
    stdin, stdout, stderr = ssh.exec_command('du -sh /var/www/simplifytools/node_modules')
    size_info = stdout.read().decode().strip()
    print(f"\n✓ Node modules size: {size_info}")
    
    ssh.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
