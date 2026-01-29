const pdf2json = require('pdf2json');
const fs = require('fs');

const pdfPath = 'uploads/pdfs/1769518022573_剑桥雅思9真题.pdf';

const pdfParser = new pdf2json('test');
pdfParser.on('pdfParser_dataError', (err) => {
  console.log('Parse Error:', err);
});
pdfParser.on('pdfParser_dataReady', (data) => {
  const text = extractTextFromPdfJson(data);
  console.log('Text length:', text.length);
  console.log('Pages:', data.Pages ? data.Pages.length : 0);
  console.log('First 1000 chars:', text.substring(0, 1000));
  process.exit(0);
});

if (fs.existsSync(pdfPath)) {
  console.log('File exists, size:', fs.statSync(pdfPath).size);
  pdfParser.parseBuffer(fs.readFileSync(pdfPath));
} else {
  console.log('File not found:', pdfPath);
  // Try the encoded filename
  const altPath = 'uploads/pdfs/1769518022573_½£ÇÅÑÅË¼9ÕæÌâ.pdf';
  if (fs.existsSync(altPath)) {
    console.log('Found with encoded name, size:', fs.statSync(altPath).size);
    pdfParser.parseBuffer(fs.readFileSync(altPath));
  }
}

function extractTextFromPdfJson(pdfJson) {
  if (!pdfJson || !pdfJson.Pages) return '';
  let text = '';
  const pages = pdfJson.Pages;
  for (const page of pages) {
    if (page.Texts) {
      for (const textItem of page.Texts) {
        if (textItem.R) {
          for (const run of textItem.R) {
            if (run.T) {
              try {
                text += decodeURIComponent(run.T) + ' ';
              } catch (e) {
                text += run.T + ' ';
              }
            }
          }
        }
      }
    }
    text += '\n';
  }
  return text;
}

setTimeout(() => { console.log('Timeout'); process.exit(1); }, 60000);
