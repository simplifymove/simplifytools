const http = require('http');
const fs = require('fs');
const path = require('path');

async function testWithFile(filename, label) {
  try {
    const excelFile = path.join(__dirname, 'python', filename);
    
    if (!fs.existsSync(excelFile)) {
      console.log(`❌ ${label}: File not found`);
      return;
    }
    
    const fileContent = fs.readFileSync(excelFile);
    const fileSize = Math.round(fileContent.length / 1024);
    const boundary = '----TestBoundary';
    
    const body = [];
    body.push(`--${boundary}`);
    body.push('Content-Disposition: form-data; name="tool"');
    body.push('');
    body.push('excel-to-pdf');
    body.push(`--${boundary}`);
    body.push('Content-Disposition: form-data; name="options"');
    body.push('');
    body.push('{}');
    body.push(`--${boundary}`);
    body.push('Content-Disposition: form-data; name="file"; filename="test.xlsx"');
    body.push('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    body.push('');
    
    const postData = Buffer.concat([
      Buffer.from(body.join('\r\n') + '\r\n'),
      fileContent,
      Buffer.from(`\r\n--${boundary}--`)
    ]);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/data-convert',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length,
      },
    };
    
    console.log(`\n📋 ${label} (${fileSize} KB)`);
    
    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        console.log(`  Status: ${res.statusCode}`);
        
        let data = Buffer.alloc(0);
        res.on('data', chunk => {
          data = Buffer.concat([data, chunk]);
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`  ✅ SUCCESS (${Math.round(data.length / 1024)} KB response)`);
          } else {
            const text = data.toString('utf8').substring(0, 200);
            console.log(`  ❌ FAILED: ${text}`);
          }
          resolve();
        });
      });
      
      req.on('error', (err) => {
        console.log(`  ❌ Connection Error: ${err.message}`);
        resolve();
      });
      
      req.write(postData);
      req.end();
    });
  } catch (err) {
    console.log(`❌ ${label}: ${err.message}`);
  }
}

async function runTests() {
  console.log('🧪 Testing Excel to PDF with different files...');
  
  // Test both files sequentially
  await testWithFile('test_input.xlsx', '1️⃣ Small file (5 KB)');
  await new Promise(r => setTimeout(r, 1000));
  
  await testWithFile('test_large.xlsx', '2️⃣ Large file (1000 rows)');
  
  setTimeout(() => process.exit(0), 2000);
}

setTimeout(() => {
  console.log('\n❌ Timeout - tests did not complete');
  process.exit(1);
}, 75000);

runTests();
