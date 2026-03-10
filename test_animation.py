"""Test GIF to MP4 conversion via API"""
from PIL import Image
import requests
import os

# Create a test GIF (2 frames)
frames = []
for i in range(2):
    img = Image.new('RGB', (100, 100), color=['red', 'blue'][i])
    frames.append(img)

frames[0].save('test_input.gif', save_all=True, append_images=[frames[1]], duration=100, loop=0)

# Test GIF → MP4 conversion
files = {
    'image': ('test_input.gif', open('test_input.gif', 'rb'), 'image/gif'),
    'config': (None, '''{"from_format":"gif","to_format":"mp4","options":{"fps":10,"quality":85}}''', 'application/json')
}

print("Testing GIF → MP4 conversion via API...")

try:
    response = requests.post('http://localhost:3000/api/convert', files=files, timeout=60)
    print(f'Status: {response.status_code}')
    
    if response.status_code == 200:
        with open('test_output.mp4', 'wb') as f:
            f.write(response.content)
        print(f'✓ GIF→MP4 conversion successful')
        print(f'✓ Output size: {len(response.content)} bytes')
    else:
        print(f'Error status: {response.status_code}')
        error_text = response.text[:400]
        if 'ffmpeg' in error_text.lower():
            print('Note: FFmpeg binary not found - need to install FFmpeg')
        else:
            print(f'Response: {error_text}')
except Exception as e:
    print(f'✗ Error: {e}')
