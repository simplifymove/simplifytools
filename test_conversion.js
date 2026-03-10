const http = require('http');
const fs = require('fs');
const path = require('path');

async function testAPI() {
  try {
    const testFile = path.join(__dirname, 'python', 'test_input.csv');
    
    if (!fs.existsSync(testFile)) {
      console.log('Test file not found');
      process.exit(1);
    }
    
    const boundary = '----TestBoundary';
    const fileContent = fs.readFileSync(testFile, 'utf8');
    
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
    body.push(fileContent);
    body.push(`--${boundary}--`);
    
    const postData = body.join('\r\n');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/data-convert',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    console.log('Testing API...');
    
    const req = http.request(options, (res) => {
      console.log(`✓ Response Status: ${res.statusCode}`);
      
      let data = Buffer.alloc(0);
      res.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS! Conversion API works');
          console.log(`  - Response size: ${Math.round(data.length / 1024)} KB`);
          console.log(`  - Content-Type: ${res.headers['content-type']}`);
        } else {
          console.log('❌ FAILED');
          const text = data.toString('utf8').substring(0, 500);
          console.log(`  Error: ${text}`);
        }
        process.exit(0);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Connection Error: ${err.message}`);
      process.exit(1);
    });
    
    req.write(postData);
    req.end();
    
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

setTimeout(() => {
  console.log('❌ Timeout - API did not respond');
  process.exit(1);
}, 15000);

testAPI();
