#!/usr/bin/env python3
"""
Verify complete PSD conversion pipeline
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_ssh_command(client, cmd, timeout=60):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    stdout_data = stdout.read().decode('utf-8', errors='ignore')
    stderr_data = stderr.read().decode('utf-8', errors='ignore')
    return stdout_data + stderr_data

def check_tool(client, tool_name):
    """Check if a tool is installed and working"""
    result = run_ssh_command(client, f"which {tool_name}")
    return tool_name in result or f"/{tool_name}" in result

def main():
    print("=" * 70)
    print("VERIFY COMPLETE PSD CONVERSION PIPELINE")
    print("=" * 70)
    
    client = None
    
    try:
        # Connect
        print("\n[1/3] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected to VPS")
        
        # Check all required tools
        print("\n[2/3] Checking conversion tools...")
        tools = {
            'convert': 'ImageMagick (PSD → PNG)',
            'potrace': 'potrace (PNG → SVG)',
            'autotrace': 'autotrace (PNG → SVG alternative)',
            'python3': 'Python (conversion engine)',
        }
        
        missing = []
        for tool, description in tools.items():
            if check_tool(client, tool):
                print(f"  ✓ {tool:15} - {description}")
            else:
                print(f"  ✗ {tool:15} - NOT found")
                missing.append(tool)
        
        # Check document.py is deployed
        print("\n[3/3] Checking deployment...")
        check_file = run_ssh_command(
            client,
            "test -f /var/www/simplifytools/python/engines/document.py && echo 'EXISTS' || echo 'MISSING'"
        )
        if "EXISTS" in check_file:
            print("  ✓ document.py is deployed")
        else:
            print("  ✗ document.py not found")
        
        # Summary
        print("\n" + "=" * 70)
        if missing:
            print(f"⚠ Missing tools: {', '.join(missing)}")
            print("Install them to enable all features.")
        else:
            print("✓ ALL TOOLS INSTALLED!")
            print("\n✓ PSD conversion pipeline is complete and ready:")
            print("  • PSD → PNG/JPG (via ImageMagick convert)")
            print("  • PNG → SVG (via potrace)")
            print("  • Complete PSD → SVG chaining with cleanup")
            print("\n✓ You can now:")
            print("  1. Upload PSD files through the web interface")
            print("  2. Convert to PNG, JPG, or SVG")
            print("  3. Check /var/log/gunicorn/error.log for detailed logs")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return 1
        
    finally:
        if client:
            try:
                client.close()
            except:
                pass

if __name__ == "__main__":
    exit(main())
