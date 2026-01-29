const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function testPdfLib() {
  const pdfPath = path.join(__dirname, 'uploads/pdfs/1769517926653_ai_agents_handbook.pdf');

  console.log('Testing pdf-lib with small PDF...');
  console.log('File exists:', fs.existsSync(pdfPath));
  console.log('File size:', fs.statSync(pdfPath).size);

  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('Buffer size:', pdfBuffer.length);

    console.log('Loading PDF with pdf-lib...');
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
      updateMetadata: false
    });
    console.log('PDF loaded successfully!');

    const pages = pdfDoc.getPages();
    console.log('Page count:', pages.length);

    // Extract text from first 5 pages
    let fullText = '';
    const maxPages = Math.min(5, pages.length);
    for (let i = 0; i < maxPages; i++) {
      const page = pages[i];
      const { items } = page.getTextContent();
      console.log(`Page ${i + 1} items:`, items.length);

      if (items.length > 0) {
        for (const item of items) {
          if (item.str) {
            fullText += item.str + ' ';
          }
        }
      }
      fullText += '\n';
    }

    console.log('Total text extracted:', fullText.length, 'characters');
    console.log('First 500 chars:', fullText.substring(0, 500));
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
}

testPdfLib();
