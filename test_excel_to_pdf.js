const http = require('http');
const fs = require('fs');
const path = require('path');

async function testExcelToPDF() {
  try {
    const excelFile = path.join(__dirname, 'python', 'test_input.xlsx');
    
    if (!fs.existsSync(excelFile)) {
      console.log('Excel file not found at:', excelFile);
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync(excelFile);
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
    
    console.log('Testing Excel to PDF conversion...');
    console.log('File size:', Math.round(fileContent.length / 1024), 'KB');
    
    const req = http.request(options, (res) => {
      console.log(`Response Status: ${res.statusCode}`);
      
      let data = Buffer.alloc(0);
      res.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
        process.stdout.write('.');
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('\n✅ SUCCESS! PDF generated');
          console.log(`Response size: ${Math.round(data.length / 1024)} KB`);
        } else {
          console.log('\n❌ FAILED');
          const text = data.toString('utf8').substring(0, 500);
          console.log('Error:', text);
        }
        process.exit(0);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Connection Error:', err.message);
      process.exit(1);
    });
    
    req.write(postData);
    req.end();
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    process.exit(1);
  }
}

setTimeout(() => {
  console.log('\n❌ Timeout - conversion did not complete');
  process.exit(1);
}, 65000);

testExcelToPDF();
