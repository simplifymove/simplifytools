#!/usr/bin/env python3
"""
Install 48 missing Python packages to VPS one by one with careful error handling
For supporting 300+ tools: image-to-text, PDF processing, data conversion, etc.
"""

import paramiko
import time
import sys
from datetime import datetime

# VPS Details
VPS_HOST = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "Raghava@12345"

# All 48 missing packages identified from local .venv audit
PACKAGES = [
    # PDF Processing
    ("pdfminer.six", "6.0.1"),
    ("pdfplumber", "0.10.3"),
    ("pikepdf", "8.14.0"),
    ("pypdf", "4.0.1"),
    ("fitz", "0.0.1.dev2"),
    
    # OCR & Document Recognition
    ("pytesseract", "0.3.10"),
    ("easyocr", "1.7.1"),
    ("paddleocr", "2.7.0.3"),
    
    # Image Processing
    ("scikit-image", "0.22.0"),
    ("pillow-heif", "0.16.0"),
    ("opencv-python", "4.8.1.78"),
    ("imageio", "2.33.1"),
    ("imageio-ffmpeg", "1.4.1"),
    
    # Data Processing
    ("pandas", "2.1.4"),
    ("openpyxl", "3.1.2"),
    ("xlrd", "2.0.1"),
    ("python-docx", "0.8.11"),
    ("python-pptx", "0.6.23"),
    ("polars", "0.19.19"),
    
    # Document & Format Conversion
    ("markdown", "3.5.1"),
    ("pyyaml", "6.0.1"),
    ("toml", "0.10.2"),
    ("lxml", "4.9.3"),
    ("beautifulsoup4", "4.12.2"),
    ("html2text", "2020.1.16"),
    
    # Machine Learning & AI
    ("torch", "2.1.1"),
    ("torchvision", "0.16.1"),
    ("tensorflow", "2.14.0"),
    ("keras", "2.14.0"),
    
    # Google Cloud & APIs
    ("google-cloud-translate", "3.14.1"),
    ("google-cloud-vision", "3.6.0"),
    ("google-auth", "2.26.2"),
    ("google-auth-httplib2", "0.2.0"),
    
    # Media & Social
    ("youtube-dl", "2021.12.17"),
    ("yt-dlp", "2024.1.1"),
    ("instagrapi", "2.0.0"),
    ("tweepy", "4.14.0"),
    
    # Data Formats
    ("protobuf", "4.25.1"),
    ("msgpack", "1.0.7"),
    ("avro", "1.12.0"),
    
    # Utilities
    ("python-magic", "0.4.27"),
    ("chardet", "5.2.0"),
    ("pathvalidate", "3.1.0"),
]

class VPSPackageInstaller:
    def __init__(self, host, user, password):
        self.host = host
        self.user = user
        self.password = password
        self.ssh = None
        self.results = {
            "success": [],
            "failed": [],
            "skipped": [],
            "conflict": []
        }
    
    def connect(self):
        """Connect to VPS via SSH"""
        try:
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh.connect(self.host, username=self.user, password=self.password)
            print(f"✅ Connected to {self.host}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect: {e}")
            return False
    
    def run_command(self, cmd, timeout=300):
        """Execute command on VPS"""
        try:
            stdin, stdout, stderr = self.ssh.exec_command(cmd, timeout=timeout)
            out = stdout.read().decode('utf-8')
            err = stderr.read().decode('utf-8')
            return {
                "success": stdout.channel.recv_exit_status() == 0,
                "stdout": out,
                "stderr": err
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": str(e)
            }
    
    def check_python_version(self):
        """Verify Python version on VPS"""
        result = self.run_command("python3 --version")
        if result["success"]:
            print(f"✅ {result['stdout'].strip()}")
            return True
        return False
    
    def install_package(self, package_name, version):
        """Install single package with careful error checking"""
        pkg_spec = f"{package_name}=={version}" if version else package_name
        cmd = f"python3 -m pip install --upgrade '{pkg_spec}' 2>&1"
        
        print(f"\n⏳ Installing: {pkg_spec}...")
        result = self.run_command(cmd)
        
        # Check for success
        if result["success"]:
            print(f"  ✅ SUCCESS: {pkg_spec}")
            self.results["success"].append(pkg_spec)
            return True
        
        # Check for specific error types
        stderr = result["stderr"].lower() + result["stdout"].lower()
        
        if "conflict" in stderr or "unable to resolve" in stderr:
            print(f"  ⚠️  CONFLICT: {package_name}")
            print(f"     {stderr.split('error:')[1][:100] if 'error:' in stderr else 'Dependency conflict'}")
            self.results["conflict"].append(pkg_spec)
            return False
        
        if "externally managed" in stderr:
            print(f"  ❌ PEP 668 BLOCKED: {package_name}")
            print(f"     Use: pip install --break-system-packages --ignore-installed '{pkg_spec}'")
            self.results["failed"].append(pkg_spec)
            return False
        
        if "not found" in stderr or "no such" in stderr:
            print(f"  ❌ NOT FOUND: {package_name}")
            print(f"     Package may not exist in PyPI")
            self.results["failed"].append(pkg_spec)
            return False
        
        if "requirement already satisfied" in stderr:
            print(f"  ℹ️  ALREADY INSTALLED: {package_name}")
            self.results["skipped"].append(pkg_spec)
            return True
        
        # Other errors
        print(f"  ❌ FAILED: {package_name}")
        print(f"     Error: {stderr[:150]}")
        self.results["failed"].append(pkg_spec)
        return False
    
    def install_all_packages(self):
        """Install all packages one by one"""
        print(f"\n{'='*70}")
        print(f"STARTING PACKAGE INSTALLATION ON VPS: {self.host}")
        print(f"Total packages: {len(PACKAGES)}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")
        
        for i, (pkg_name, version) in enumerate(PACKAGES, 1):
            print(f"[{i}/{len(PACKAGES)}] ", end="")
            self.install_package(pkg_name, version)
            time.sleep(2)  # Pause between installs to avoid overwhelming VPS
        
        self.print_summary()
    
    def print_summary(self):
        """Print installation summary"""
        print(f"\n{'='*70}")
        print("INSTALLATION SUMMARY")
        print(f"{'='*70}")
        
        total_success = len(self.results["success"])
        total_failed = len(self.results["failed"])
        total_conflict = len(self.results["conflict"])
        total_skipped = len(self.results["skipped"])
        
        print(f"\n✅ SUCCESS ({total_success}):")
        for pkg in self.results["success"][:10]:
            print(f"   • {pkg}")
        if total_success > 10:
            print(f"   ... and {total_success - 10} more")
        
        if self.results["skipped"]:
            print(f"\nℹ️  ALREADY INSTALLED ({total_skipped}):")
            for pkg in self.results["skipped"][:5]:
                print(f"   • {pkg}")
            if total_skipped > 5:
                print(f"   ... and {total_skipped - 5} more")
        
        if self.results["conflict"]:
            print(f"\n⚠️  CONFLICTS ({total_conflict}):")
            for pkg in self.results["conflict"]:
                print(f"   • {pkg}")
        
        if self.results["failed"]:
            print(f"\n❌ FAILED ({total_failed}):")
            for pkg in self.results["failed"]:
                print(f"   • {pkg}")
        
        print(f"\n{'='*70}")
        print(f"Total: {total_success} success, {total_failed} failed, {total_conflict} conflicts, {total_skipped} skipped")
        print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")
        
        # Return status
        if total_failed > 0 or total_conflict > 0:
            print("⚠️  Some packages failed or have conflicts. Review above for details.")
            return False
        return True
    
    def disconnect(self):
        """Close SSH connection"""
        if self.ssh:
            self.ssh.close()
            print("🔌 Disconnected from VPS")

def main():
    installer = VPSPackageInstaller(VPS_HOST, VPS_USER, VPS_PASSWORD)
    
    try:
        if not installer.connect():
            print("❌ Cannot connect to VPS. Exiting.")
            return 1
        
        if not installer.check_python_version():
            print("❌ Python check failed. Exiting.")
            return 1
        
        installer.install_all_packages()
        success = installer.print_summary()
        
        return 0 if success else 1
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Installation interrupted by user")
        installer.print_summary()
        return 2
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1
    
    finally:
        installer.disconnect()

if __name__ == "__main__":
    sys.exit(main())
