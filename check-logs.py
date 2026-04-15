import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

# Get full PM2 logs
print("=== PM2 Logs (Last 100 lines) ===")
stdin, stdout, stderr = client.exec_command('pm2 logs simplifytools --lines 100 --nostream')
logs = stdout.read().decode('utf-8')
print(logs[-2000:] if len(logs) > 2000 else logs)

# Check if there are build errors
print("\n\n=== Checking for TypeScript/Build Errors ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npm run build 2>&1 | tail -50')
output = stdout.read().decode('utf-8')
print(output)

client.close()
