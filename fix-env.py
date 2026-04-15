import paramiko
import subprocess

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

# Create a random secret for NextAuth
import secrets
nextauth_secret = secrets.token_urlsafe(32)

# Update or create .env file
env_content = f"""NODE_ENV=production
NEXTAUTH_SECRET={nextauth_secret}
NEXTAUTH_URL=https://www.simplifyconvert.com
"""

stdin, stdout, stderr = client.exec_command(f'cat > /var/www/simplifytools/.env.local << "ENVEOF"\n{env_content}\nENVEOF')
stdout.read()

print("✓ Created .env.local with NEXTAUTH_SECRET")

# Check if Python 3 is installed
stdin, stdout, stderr = client.exec_command('which python3')
python_path = stdout.read().decode('utf-8').strip()
if python_path:
    print(f"✓ Python3 found at: {python_path}")
else:
    print("✗ Python3 not found - installing...")
    stdin, stdout, stderr = client.exec_command('apt-get update && apt-get install -y python3 python3-pip')
    stdout.read()
    print("✓ Python3 installed")

# Restart PM2
print("\nRestarting PM2 app...")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && pm2 restart simplifytools')
stdout.read()

import time
time.sleep(3)

# Check status
stdin, stdout, stderr = client.exec_command('pm2 status')
print("\n=== PM2 Status ===")
print(stdout.read().decode('utf-8'))

client.close()
