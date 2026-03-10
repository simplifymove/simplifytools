const fs = require('fs');
const path = require('path');
const https = require('https');

async function testAPI() {
  try {
    const testFile = path.join(__dirname, 'python', 'test_input.csv');
    
    if (!fs.existsSync(testFile)) {
      console.log('Test file not found at:', testFile);
      return;
    }
    
    const fileStream = fs.createReadStream(testFile);
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    
    const body = [];
    body.push(`--${boundary}`);
    body.push('Content-Disposition: form-data; name="tool"');
    body.push('');
    body.push('csv-to-excel');
    body.push(`--${boundary}`);
    body.push('Content-Disposition: form-data; name="options"');
    body.push('');
    body.push('{}');
    body.push(`--${boundary}`);
    body.push('Content-Disposition: form-data; name="file"; filename="test.csv"');
    body.push('Content-Type: text/csv');
    body.push('');
    
    const fileContent = fs.readFileSync(testFile, 'utf8');
    const postData = body.join('\r\n') + '\r\n' + fileContent + '\r\n' + `--${boundary}--`;
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/data-convert',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = require('http').request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      let data = Buffer.alloc(0);
      res.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✓ SUCCESS! API returned 200');
          console.log(`Response size: ${data.length} bytes (Excel file)`);
        } else {
          console.log('✗ FAILED with status:', res.statusCode);
          try {
            const text = data.toString('utf8', 0, Math.min(500, data.length));
            console.log('Response:', text);
          } catch (e) {
            console.log('Binary response');
          }
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('Error:', err.message);
      console.log('Code:', err.code);
    });
    
    req.write(postData);
    req.end();
    
  } catch (err) {
    console.log('Exception:', err.message);
  }
}

testAPI();
setTimeout(() => process.exit(0), 10000);
