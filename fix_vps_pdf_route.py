#!/usr/bin/env python3
import paramiko
import sys

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    # Read full file
    stdin, stdout, stderr = client.exec_command('cat /var/www/simplifytools/app/api/pdf/route.ts')
    content = stdout.read().decode()
    
    # Replace the problematic section
    old_section = """    // Use full path to venv Python executable
    const pythonExe = process.platform === 'win32' 
      ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
      : path.join(process.cwd(), '.venv', 'bin', 'python');"""
    
    new_section = """    // Use system Python executable (no venv)
    const pythonExe = process.platform === 'win32' 
      ? 'python'
      : 'python3';"""
    
    if old_section not in content:
        print("[!] ERROR: Could not find the section to replace!")
        print("Looking for:")
        print(repr(old_section[:50]))
        sys.exit(1)
    
    new_content = content.replace(old_section, new_section)
    
    if new_content == content:
        print("[!] ERROR: Replacement did not change the content!")
        sys.exit(1)
    
    # Write back via echo with proper escaping
    # Use heredoc for safety
    cmd = f'''cat > /var/www/simplifytools/app/api/pdf/route.ts << 'EOF_PDF_ROUTE'
{new_content}
EOF_PDF_ROUTE'''
    
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    
    if err:
        print(f"[!] Error writing file: {err}")
        sys.exit(1)
    
    # Verify
    stdin, stdout, stderr = client.exec_command('sed -n "78,88p" /var/www/simplifytools/app/api/pdf/route.ts')
    verify = stdout.read().decode()
    
    if 'python3' in verify and '.venv' not in verify:
        print("[✓] File updated successfully on VPS!")
        print("\nUpdated content:")
        print(verify)
    else:
        print("[!] Verification failed!")
        print(verify)
        sys.exit(1)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
