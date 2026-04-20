#!/usr/bin/env python3
"""
Diagnose and fix missing image conversion tools on VPS
"""

import paramiko
import os

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_ssh_command(client, cmd, timeout=60):
    """Execute SSH command and return output"""
    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        stdout_data = stdout.read().decode('utf-8', errors='ignore')
        stderr_data = stderr.read().decode('utf-8', errors='ignore')
        return stdout_data + stderr_data
    except Exception as e:
        return f"Error: {e}"

def check_tool(client, tool_name):
    """Check if a tool is installed"""
    result = run_ssh_command(client, f"which {tool_name}")
    return tool_name in result or f"/{tool_name}" in result

def main():
    print("=" * 70)
    print("VPS IMAGE CONVERSION TOOLS DIAGNOSTIC")
    print("=" * 70)
    
    client = None
    
    try:
        # Connect to VPS
        print("\n[1/4] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected to VPS")
        
        # Check current tools
        print("\n[2/4] Checking for conversion tools...")
        tools = ['convert', 'magick', 'gm', 'identify']
        missing_tools = []
        
        for tool in tools:
            if check_tool(client, tool):
                print(f"  ✓ {tool} - found")
            else:
                print(f"  ✗ {tool} - NOT found")
                missing_tools.append(tool)
        
        # Check system
        print("\n[3/4] Checking system info...")
        os_info = run_ssh_command(client, "cat /etc/os-release | grep -E 'NAME|VERSION'")
        print(f"  System: {os_info[:100]}")
        
        # Install ImageMagick
        if missing_tools:
            print("\n[4/4] Installing ImageMagick...")
            
            # Update package manager
            print("  Updating package manager...")
            update_result = run_ssh_command(client, "apt-get update", timeout=120)
            if "Err:" in update_result:
                print(f"  Warning: {update_result[:200]}")
            
            # Install ImageMagick
            print("  Installing ImageMagick...")
            install_result = run_ssh_command(
                client, 
                "apt-get install -y imagemagick imagemagick-6-common imagemagick-6.q16",
                timeout=180
            )
            
            if "done" in install_result.lower() or "0 newly installed" in install_result:
                print("  ✓ ImageMagick installation completed")
            else:
                print(f"  Installation output: {install_result[:300]}")
            
            # Verify installation
            print("\n  Verifying installation...")
            verify = run_ssh_command(client, "convert --version | head -1")
            if "ImageMagick" in verify:
                print(f"  ✓ Verified: {verify.strip()}")
            else:
                print(f"  Result: {verify.strip()}")
        else:
            print("\n✓ All conversion tools are installed!")
        
        print("\n✓ Diagnostic complete!")
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
