"""Test PDF to Text conversion via API"""
import requests
import os

# Test file and output
pdf_path = "test.pdf"
output_dir = "test_results"

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# API endpoint
api_url = "http://localhost:3000/api/convert"

# Prepare files and data
files = {
    'image': ('test.pdf', open(pdf_path, 'rb'), 'application/pdf'),
    'config': (None, '''{
        "from_format": "pdf",
        "to_format": "txt",
        "options": {
            "language": "eng"
        }
    }''', 'application/json')
}

print("Testing PDF → TXT conversion via API...")
print(f"File: {pdf_path}")

try:
    response = requests.post(api_url, files=files, timeout=60)
    print(f"✓ Response Status: {response.status_code}")
    print(f"✓ Content Type: {response.headers.get('Content-Type', 'N/A')}")
    
    if response.status_code == 200:
        output_path = os.path.join(output_dir, "output.txt")
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Output saved: {output_path}")
        print(f"✓ Output size: {len(response.content)} bytes")
        
        # Show preview
        text_content = response.content.decode('utf-8', errors='ignore')
        preview = text_content[:300] if text_content else "[Empty output]"
        print("\nOutput preview:")
        print(preview)
    else:
        print(f"✗ Error: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
except Exception as e:
    print(f"✗ Error: {str(e)}")
