const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function testPdfExtraction() {
  const pdfPath = path.join(__dirname, 'uploads/pdfs/1769518022573_剑桥雅思9真题.pdf');
  // Or try the encoded filename version
  const altPath = path.join(__dirname, 'uploads/pdfs/1769518022573_½£ÇÅÑÅË¼9ÕæÌâ.pdf');

  const targetPath = fs.existsSync(pdfPath) ? pdfPath : (fs.existsSync(altPath) ? altPath : null);

  if (!targetPath) {
    console.log('PDF file not found!');
    console.log('Checking uploads/pdfs directory:');
    const files = fs.readdirSync(path.join(__dirname, 'uploads/pdfs'));
    console.log(files);
    return;
  }

  console.log(`Using file: ${targetPath}`);
  console.log(`File size: ${fs.statSync(targetPath).size} bytes`);

  try {
    const pdfBuffer = fs.readFileSync(targetPath);
    console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true
    });

    const pages = pdfDoc.getPages();
    console.log(`Page count: ${pages.length}`);

    // Extract text from first 5 pages
    let fullText = '';
    for (let i = 0; i < Math.min(5, pages.length); i++) {
      const page = pages[i];
      const { items } = page.getTextContent();
      console.log(`Page ${i + 1} text items: ${items.length}`);

      if (items.length > 0) {
        // Sort by position
        const sortedItems = items.sort((a, b) => {
          const aY = a.transform[5] || 0;
          const bY = b.transform[5] || 0;
          const aX = a.transform[4] || 0;
          const bX = b.transform[4] || 0;

          if (Math.abs(aY - bY) < 5) {
            return aX - bX;
          }
          return bY - aY;
        });

        let currentY = null;
        let currentLine = '';

        for (const item of sortedItems) {
          const text = item.str || '';
          const y = item.transform[5] || 0;

          if (currentY !== null && Math.abs(y - currentY) > 5) {
            if (currentLine.trim()) {
              fullText += currentLine.trim() + '\n';
            }
            currentLine = text;
          } else {
            if (currentLine && text) {
              const lastChar = currentLine.slice(-1);
              if (!' \t\n\r'.includes(lastChar) && !text.startsWith(' ') && !text.startsWith('\t')) {
                currentLine += ' ';
              }
            }
            currentLine += text;
          }
          currentY = y;
        }

        if (currentLine.trim()) {
          fullText += currentLine.trim() + '\n';
        }
      }
      fullText += '\n';
    }

    console.log(`\nTotal text extracted (first 5 pages): ${fullText.length} characters`);
    console.log('\n--- First 2000 characters ---');
    console.log(fullText.substring(0, 2000));
    console.log('\n--- Looking for IELTS content ---');
    console.log('Contains "Listening":', fullText.toLowerCase().includes('listening'));
    console.log('Contains "Reading":', fullText.toLowerCase().includes('reading'));
    console.log('Contains "Writing":', fullText.toLowerCase().includes('writing'));
    console.log('Contains "Speaking":', fullText.toLowerCase().includes('speaking'));
    console.log('Contains "Test":', fullText.toLowerCase().includes('test'));

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
}

testPdfExtraction();
