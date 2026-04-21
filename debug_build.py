#!/usr/bin/env python3
"""
Debug the actual build failure
"""

import paramiko

def run_ssh(client, cmd, timeout=60):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

print("="*80)
print("DEBUGGING BUILD FAILURE")
print("="*80)

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=10)
    
    # Check Node version
    print("\n[1] Node.js version:")
    out, err = run_ssh(client, 'node --version && npm --version', timeout=5)
    print(out)
    
    # Check next.config.ts
    print("\n[2] Next.js config:")
    out, err = run_ssh(client, 'cat /var/www/simplifytools/next.config.ts', timeout=5)
    print(out[:500])
    
    # Try building with verbose output
    print("\n[3] Running build with full output (this may take 2-3 minutes)...")
    print("   (Building...)")
    out, err = run_ssh(client, 'cd /var/www/simplifytools && npm run build 2>&1', timeout=240)
    
    print("\n[BUILD OUTPUT]:")
    print(out[-2000:])  # Last 2000 chars
    
    if err:
        print("\n[BUILD STDERR]:")
        print(err[-1000:])
    
    # Check what's in .next
    print("\n[4] Contents of .next directory:")
    out, err = run_ssh(client, 'ls -la /var/www/simplifytools/.next/ 2>&1', timeout=5)
    print(out)
    
    # Check if .next exists at all
    print("\n[5] .next directory exist check:")
    out, err = run_ssh(client, 'test -d /var/www/simplifytools/.next && echo "EXISTS" || echo "DOES_NOT_EXIST"', timeout=5)
    print(out)
    
    # Check package.json build script
    print("\n[6] Build script in package.json:")
    out, err = run_ssh(client, 'grep -A1 "\"build\"" /var/www/simplifytools/package.json', timeout=5)
    print(out)
    
    client.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
