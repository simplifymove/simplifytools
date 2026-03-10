"""Test PNG to JPG conversion via API"""
from PIL import Image
import requests
import os

# Create a test image
img = Image.new('RGB', (100, 100), color='blue')
img.save('test_input.png')

# Test PNG → JPG conversion
files = {
    'image': ('test_input.png', open('test_input.png', 'rb'), 'image/png'),
    'config': (None, '''{"from_format":"png","to_format":"jpg","options":{"quality":90}}''', 'application/json')
}

print("Testing PNG → JPG conversion via API...")

try:
    response = requests.post('http://localhost:3000/api/convert', files=files, timeout=60)
    print(f'Status: {response.status_code}')
    
    if response.status_code == 200:
        with open('test_output.jpg', 'wb') as f:
            f.write(response.content)
        print(f'✓ PNG→JPG conversion successful')
        print(f'✓ Output size: {len(response.content)} bytes')
    else:
        print(f'✗ Error: {response.status_code}')
        print(response.text[:200])
except Exception as e:
    print(f'✗ Error: {e}')
