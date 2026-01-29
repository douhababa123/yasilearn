const textract = require('textract');
const fs = require('fs');

const pdfPath = 'uploads/pdfs/1769518022573_½£ÇÅÑÅË¼9ÕæÌâ.pdf';

console.log('Starting text extraction...');
console.log('File exists:', fs.existsSync(pdfPath));
console.log('File size:', fs.statSync(pdfPath).size);

textract.fromFileWithPath(pdfPath, (err, text) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Extracted text length:', text ? text.length : 0);
    if (text) {
      console.log('First 1000 chars:', text.substring(0, 1000));
    }
  }
  process.exit(0);
});

setTimeout(() => {
  console.log('Timeout - PDF might be scanned or protected');
  process.exit(1);
}, 120000);
