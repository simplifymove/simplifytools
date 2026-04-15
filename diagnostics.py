import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

# Check git log
print("=== VPS Git Log ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && git log --oneline -5')
print(stdout.read().decode('utf-8'))

# Check build status
print("\n=== Build Status ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && test -d .next && echo "BUILD EXISTS" || echo "NO BUILD"')
print(stdout.read().decode('utf-8'))

# Check node_modules
print("\n=== node_modules ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && test -d node_modules && echo "node_modules EXISTS" || echo "NO node_modules"')
print(stdout.read().decode('utf-8'))

# Check package.json exists
print("\n=== package.json ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && test -f package.json && echo "YES" || echo "NO"')
print(stdout.read().decode('utf-8'))

client.close()
