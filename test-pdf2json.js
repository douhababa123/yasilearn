const pdf2json = require('pdf2json');
const fs = require('fs');
const path = require('path');

async function testWithPdf2json(pdfPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Testing with pdf2json: ${path.basename(pdfPath)} ===`);
    console.log(`File size: ${fs.statSync(pdfPath).size} bytes`);

    const pdfParser = new pdf2json('test-pdf');

    pdfParser.on('pdfParser_dataError', (err) => {
      console.error('Parse Error:', err.parserError);
      reject(err);
    });

    pdfParser.on('pdfParser_dataReady', (data) => {
      console.log('PDF parsed successfully!');
      console.log('Pages:', data.Pages ? data.Pages.length : 0);

      // Extract text
      let fullText = '';
      if (data.Pages) {
        for (const page of data.Pages) {
          if (page.Texts) {
            for (const textItem of page.Texts) {
              if (textItem.R) {
                for (const run of textItem.R) {
                  if (run.T) {
                    try {
                      fullText += decodeURIComponent(run.T) + ' ';
                    } catch (e) {
                      fullText += run.T + ' ';
                    }
                  }
                }
              }
            }
          }
          fullText += '\n';
        }
      }

      console.log(`Extracted text length: ${fullText.length} characters`);
      console.log('\n--- First 3000 characters ---');
      console.log(fullText.substring(0, 3000));
      console.log('\n--- Content check ---');
      console.log('Contains "Listening":', fullText.toLowerCase().includes('listening'));
      console.log('Contains "Reading":', fullText.toLowerCase().includes('reading'));
      console.log('Contains "IELTS":', fullText.toLowerCase().includes('ielts'));

      resolve({ data, text: fullText });
    });

    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log(`Parsing buffer of ${pdfBuffer.length} bytes...`);
    pdfParser.parseBuffer(pdfBuffer);
  });
}

async function main() {
  const pdfDir = path.join(__dirname, 'uploads/pdfs');

  // Test with smaller PDF first
  const smallPdf = path.join(pdfDir, '1769517926653_ai_agents_handbook.pdf');
  if (fs.existsSync(smallPdf)) {
    try {
      await testWithPdf2json(smallPdf);
    } catch (e) {
      console.error('Small PDF failed:', e.message);
    }
  }

  // Test with Cambridge IELTS PDF
  const ieltPdf = path.join(pdfDir, '1769518022573_½£ÇÅÑÅË¼9ÕæÌâ.pdf');
  if (fs.existsSync(ieltPdf)) {
    console.log('\n\n========================================');
    console.log('Testing with Cambridge IELTS 9 PDF...');
    console.log('========================================\n');

    // Set a longer timeout
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log('TIMEOUT: PDF parsing took too long (> 30 seconds)');
      }
    }, 30000);

    try {
      const result = await testWithPdf2json(ieltPdf);
      resolved = true;
      clearTimeout(timeout);

      // Check if we got meaningful content
      if (result.text.length < 1000) {
        console.log('\n⚠️ WARNING: Very little text extracted!');
        console.log('This PDF might be scanned/image-based.');
      }
    } catch (e) {
      resolved = true;
      clearTimeout(timeout);
      console.error('IELTS PDF failed:', e.message);
    }
  } else {
    console.log('IELTS PDF not found at:', ieltPdf);
  }
}

main();
