const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

async function testConversion() {
  const testFile = path.join(__dirname, 'python', 'test_input.csv');
  
  if (!fs.existsSync(testFile)) {
    console.log('Test file not found');
    return;
  }
  
  const form = new FormData();
  form.append('tool', 'csv-to-excel');
  form.append('options', '{}');
  form.append('file', fs.createReadStream(testFile), 'test.csv');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/data-convert',
    method: 'POST',
    headers: form.getHeaders(),
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✓ API call succeeded!');
        console.log(`Response size: ${data.length} bytes`);
      } else {
        console.log('✗ API call failed');
        console.log('Response:', data.substring(0, 500));
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`✗ Error: ${err.message}`);
  });
  
  form.pipe(req);
}

testConversion();
