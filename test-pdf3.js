const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function testPdf() {
  const pdfPath = 'uploads/pdfs/1769518022573_½£ÇÅÑÅË¼9ÕæÌâ.pdf';

  try {
    const fileBuffer = fs.readFileSync(pdfPath);
    console.log('File size:', fileBuffer.length);

    const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    console.log('PDF loaded successfully');
    console.log('Page count:', pdfDoc.getPageCount());

    // Try to extract text from first few pages
    const pages = pdfDoc.getPages();
    let fullText = '';

    for (let i = 0; i < Math.min(5, pages.length); i++) {
      const page = pages[i];
      const { text } = page.getTextContent();
      if (text) {
        const pageText = text.map(item => item.str).join(' ');
        console.log(`Page ${i + 1} text length:`, pageText.length);
        console.log(`Page ${i + 1} preview:`, pageText.substring(0, 200));
        fullText += pageText + '\n\n';
      }
    }

    console.log('Total extracted text length:', fullText.length);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPdf();
