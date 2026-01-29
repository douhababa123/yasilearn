
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf2json = require('pdf2json');
const mammoth = require('mammoth');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3001;

// AI Configuration for PDF Parsing
const AI_CONFIG = {
  apiKey: process.env.DASHSCOPE_API_KEY || "",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  modelName: process.env.DASHSCOPE_MODEL || "qwen3-max",
};

const openai = new OpenAI({
  apiKey: AI_CONFIG.apiKey,
  baseURL: AI_CONFIG.baseURL,
});

// Helper: Clean Markdown from JSON response
const cleanJson = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// Helper: Extract text from PDF using pdf2json
const extractTextFromPdf = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new pdf2json('test');

    pdfParser.on('pdfParser_dataError', (err) => {
      reject(new Error('PDF parsing error: ' + err.parserError));
    });

    pdfParser.on('pdfParser_dataReady', (data) => {
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

      resolve({
        text: fullText,
        pageCount: data.Pages ? data.Pages.length : 0
      });
    });

    pdfParser.parseBuffer(pdfBuffer);
  });
};

// Helper: Extract text from Word (.docx) using mammoth
const extractTextFromDocx = async (docxPath) => {
  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    return {
      text: result.value,
      pageCount: 1 // mammoth doesn't provide page count, approximate as 1
    };
  } catch (error) {
    throw new Error('DOCX parsing error: ' + error.message);
  }
};

// Ensure upload directories exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PDF_DIR = path.join(UPLOAD_DIR, 'pdfs');
const DOCX_DIR = path.join(UPLOAD_DIR, 'docx');
const AUDIO_DIR = path.join(UPLOAD_DIR, 'audio');

[UPLOAD_DIR, PDF_DIR, DOCX_DIR, AUDIO_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, PDF_DIR);
    } else if (file.originalname.toLowerCase().endsWith('.docx')) {
      cb(null, DOCX_DIR);
    } else {
      cb(null, AUDIO_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Fix UTF-8 filename encoding issues
    let originalName = file.originalname;
    try {
      // Try to decode if it's double-encoded
      originalName = decodeURIComponent(escape(originalName));
    } catch (e) {
      // If decode fails, keep original
    }
    // Sanitize filename but keep Chinese characters
    const sanitizedName = originalName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\-_.]/g, '_');
    const uniqueName = `${Date.now()}_${sanitizedName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// Database Connection Configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:mysecretpassword@localhost:5432/ielts_db',
};

// --- In-Memory Fallback Store ---
let isDbConnected = false;
let mockVocab = [];
let mockIdCounter = 1;

// --- Database Initialization ---
const pool = new Pool(dbConfig);

const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Checking database tables...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS vocabulary (
        id SERIAL PRIMARY KEY,
        word TEXT UNIQUE NOT NULL,
        phonetic TEXT,
        definition TEXT,
        image_url TEXT,
        difficulty INTEGER,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS examples (
        id SERIAL PRIMARY KEY,
        vocab_id INTEGER REFERENCES vocabulary(id) ON DELETE CASCADE,
        en_sentence TEXT,
        cn_sentence TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS study_progress (
        vocab_id INTEGER PRIMARY KEY REFERENCES vocabulary(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'new',
        interval_minutes INTEGER DEFAULT 0,
        ease_factor FLOAT DEFAULT 2.5,
        review_count INTEGER DEFAULT 0,
        last_reviewed_at TIMESTAMP,
        next_review_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Study Plan tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER DEFAULT 1,
        current_score FLOAT NOT NULL,
        target_score FLOAT NOT NULL,
        exam_date DATE NOT NULL,
        daily_hours INTEGER DEFAULT 2,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS study_tasks (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES study_plans(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER DEFAULT 30,
        status TEXT DEFAULT 'pending',
        completed_at TIMESTAMP
      );
    `);

    // IELTS Tests tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS ielts_tests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        pdf_path TEXT,
        audio_path TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ielts_listening (
        id SERIAL PRIMARY KEY,
        test_id INTEGER REFERENCES ielts_tests(id) ON DELETE CASCADE,
        section INTEGER,
        questions JSONB,
        audio_path TEXT,
        UNIQUE(test_id, section)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ielts_reading (
        id SERIAL PRIMARY KEY,
        test_id INTEGER REFERENCES ielts_tests(id) ON DELETE CASCADE,
        passage TEXT,
        questions JSONB,
        UNIQUE(test_id, passage)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ielts_writing (
        id SERIAL PRIMARY KEY,
        test_id INTEGER REFERENCES ielts_tests(id) ON DELETE CASCADE,
        task1_prompt TEXT,
        task2_prompt TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ielts_speaking (
        id SERIAL PRIMARY KEY,
        test_id INTEGER REFERENCES ielts_tests(id) ON DELETE CASCADE,
        cue_card TEXT,
        follow_up JSONB
      );
    `);

    console.log("Database tables initialized successfully.");
    isDbConnected = true;
    client.release();
  } catch (err) {
    console.warn("----------------------------------------------------------------");
    console.warn("⚠️  WARNING: Could not connect to PostgreSQL database.");
    console.warn(`   Error: ${err.message}`);
    console.warn("🚀 Switching to IN-MEMORY MODE. Data will be lost on restart.");
    console.warn("----------------------------------------------------------------");
    isDbConnected = false;
  }
};

initDB();

// --- API Endpoints ---

// 1. Get Vocabulary List
app.get('/api/vocab', async (req, res) => {
  console.log('isDbConnected:', isDbConnected);
  if (isDbConnected) {
    try {
      const testQuery = await pool.query('SELECT COUNT(*) FROM vocabulary');
      console.log('Vocabulary count:', testQuery.rows[0].count);
      const query = `
        SELECT 
          v.*, 
          COALESCE(sp.status, 'new') as status, 
          sp.next_review_at,
          (
            SELECT json_agg(json_build_object('en', e.en_sentence, 'cn', e.cn_sentence))
            FROM examples e 
            WHERE e.vocab_id = v.id
          ) as examples
        FROM vocabulary v
        LEFT JOIN study_progress sp ON v.id = sp.vocab_id
        ORDER BY 
          CASE 
            WHEN sp.next_review_at IS NULL THEN 0 
            WHEN sp.next_review_at <= NOW() THEN 0 
            ELSE 1 
          END ASC,
          sp.next_review_at ASC,
          v.id DESC
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    const now = new Date();
    const sorted = [...mockVocab].sort((a, b) => {
       const aTime = new Date(a.next_review_at || 0).getTime();
       const bTime = new Date(b.next_review_at || 0).getTime();
       const aDue = aTime <= now.getTime();
       const bDue = bTime <= now.getTime();
       
       if (aDue && !bDue) return -1;
       if (!aDue && bDue) return 1;
       return aTime - bTime;
    });
    res.json(sorted);
  }
});

// 2. Submit Review
app.post('/api/vocab/:id/review', async (req, res) => {
  const vocabId = parseInt(req.params.id);
  const { quality } = req.body; 

  if (isDbConnected) {
    try {
      let progressRes = await pool.query('SELECT * FROM study_progress WHERE vocab_id = $1', [vocabId]);
      let progress = progressRes.rows[0];

      if (!progress) {
        await pool.query("INSERT INTO study_progress (vocab_id) VALUES ($1)", [vocabId]);
        progress = { interval_minutes: 0, review_count: 0, ease_factor: 2.5, status: 'new' };
      }

      let { interval_minutes, review_count } = calculateProgress(progress, quality);
      let status = quality === 5 ? 'mastered' : (quality >= 3 ? 'reviewing' : 'learning');
      
      let nextReview = new Date();
      nextReview.setMinutes(nextReview.getMinutes() + interval_minutes);

      await pool.query(`
        UPDATE study_progress 
        SET 
          status = $1,
          interval_minutes = $2,
          next_review_at = $3,
          review_count = $4,
          last_reviewed_at = NOW()
        WHERE vocab_id = $5
      `, [status, interval_minutes, nextReview.toISOString(), review_count, vocabId]);

      res.json({ success: true, nextReview, interval_minutes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update review' });
    }
  } else {
    const item = mockVocab.find(v => v.id === vocabId);
    if (!item) return res.status(404).json({ error: 'Not found' });

    let progress = {
        interval_minutes: item.interval_minutes || 0,
        review_count: item.review_count || 0,
        ease_factor: 2.5
    };

    let { interval_minutes, review_count } = calculateProgress(progress, quality);
    let status = quality === 5 ? 'mastered' : (quality >= 3 ? 'reviewing' : 'learning');
    
    let nextReview = new Date();
    nextReview.setMinutes(nextReview.getMinutes() + interval_minutes);

    item.status = status;
    item.interval_minutes = interval_minutes;
    item.review_count = review_count;
    item.next_review_at = nextReview.toISOString();
    item.last_reviewed_at = new Date().toISOString();

    res.json({ success: true, nextReview, interval_minutes });
  }
});

function calculateProgress(current, quality) {
    let { interval_minutes, review_count } = current;
    if (quality === 1) { 
      interval_minutes = 10;
      review_count = 0;
    } else if (quality === 2) {
      interval_minutes = Math.max(Math.floor(interval_minutes * 1.1), 60);
    } else if (quality === 3) {
      interval_minutes = Math.max(Math.floor(interval_minutes * 1.6), 360);
    } else if (quality === 5) {
      if (review_count === 0) interval_minutes = 1440; 
      else if (review_count === 1) interval_minutes = 4320; 
      else interval_minutes = Math.floor(interval_minutes * 2.5);
      review_count++;
    }
    return { interval_minutes, review_count };
}

// 3. Bulk Import
app.post('/api/vocab/import', async (req, res) => {
  const vocabList = req.body;
  if (!Array.isArray(vocabList)) {
    return res.status(400).json({ error: 'Input must be an array' });
  }

  if (isDbConnected) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let insertedCount = 0;

      for (const item of vocabList) {
        const wordRes = await client.query(`
          INSERT INTO vocabulary (word, phonetic, definition, image_url, difficulty, tags)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (word) DO UPDATE SET 
            definition = EXCLUDED.definition,
            image_url = EXCLUDED.image_url
          RETURNING id;
        `, [item.word, item.phonetic, item.definition, item.imageUrl || null, item.difficulty, item.tags]);

        let vocabId;
        if (wordRes.rows.length > 0) {
          vocabId = wordRes.rows[0].id;
          insertedCount++;
        } else {
          const fetchId = await client.query('SELECT id FROM vocabulary WHERE word = $1', [item.word]);
          vocabId = fetchId.rows[0].id;
        }

        await client.query('DELETE FROM examples WHERE vocab_id = $1', [vocabId]);
        for (const ex of item.examples) {
          await client.query(
            'INSERT INTO examples (vocab_id, en_sentence, cn_sentence) VALUES ($1, $2, $3)',
            [vocabId, ex.en, ex.cn]
          );
        }

        await client.query(`
          INSERT INTO study_progress (vocab_id, status, next_review_at)
          VALUES ($1, 'new', NOW())
          ON CONFLICT (vocab_id) DO NOTHING
        `, [vocabId]);
      }

      await client.query('COMMIT');
      res.json({ success: true, count: insertedCount });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Import Error:', e);
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  } else {
    let count = 0;
    for (const item of vocabList) {
        const existingIdx = mockVocab.findIndex(v => v.word.toLowerCase() === item.word.toLowerCase());
        const newItem = {
            ...item,
            id: existingIdx >= 0 ? mockVocab[existingIdx].id : mockIdCounter++,
            status: existingIdx >= 0 ? mockVocab[existingIdx].status : 'new',
            next_review_at: existingIdx >= 0 ? mockVocab[existingIdx].next_review_at : new Date().toISOString(),
            examples: item.examples
        };
        if (existingIdx >= 0) {
            mockVocab[existingIdx] = newItem;
        } else {
            mockVocab.push(newItem);
            count++;
        }
    }
    res.json({ success: true, count });
  }
});

// --- File Upload Endpoints ---

// Upload PDF
app.post('/api/upload/pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = `/uploads/pdfs/${req.file.filename}`;
  // Fix UTF-8 filename encoding
  let originalName = req.file.originalname;
  try {
    originalName = decodeURIComponent(escape(originalName));
  } catch (e) {}
  originalName = originalName.replace('.pdf', '');

  try {
    // Create test record in database
    if (isDbConnected) {
      await pool.query(
        `INSERT INTO ielts_tests (name, pdf_path, created_at)
         VALUES ($1, $2, NOW())
         RETURNING id`,
        [originalName.replace('.pdf', ''), filePath]
      );
    }

    res.json({
      success: true,
      message: 'PDF uploaded successfully',
      filePath: filePath,
      originalName: originalName
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to save upload info' });
  }
});

// Upload Word Document
app.post('/api/upload/docx', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = `/uploads/docx/${req.file.filename}`;
  // Fix UTF-8 filename encoding
  let originalName = req.file.originalname;
  try {
    originalName = decodeURIComponent(escape(originalName));
  } catch (e) {}
  originalName = originalName.replace(/\.docx$/i, '');

  try {
    // Create test record in database
    if (isDbConnected) {
      await pool.query(
        `INSERT INTO ielts_tests (name, pdf_path, created_at)
         VALUES ($1, $2, NOW())
         RETURNING id`,
        [originalName, filePath]
      );
    }

    res.json({
      success: true,
      message: 'Word document uploaded successfully',
      filePath: filePath,
      originalName: originalName
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to save upload info' });
  }
});

// Upload Audio
app.post('/api/upload/audio', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = `/uploads/audio/${req.file.filename}`;
  const originalName = req.file.originalname;

  res.json({
    success: true,
    message: 'Audio uploaded successfully',
    filePath: filePath,
    originalName: originalName
  });
});

// Get list of uploaded tests
app.get('/api/tests', async (req, res) => {
  if (!isDbConnected) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT id, name, pdf_path, created_at FROM ielts_tests ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get Tests Error:', err);
    res.status(500).json({ error: 'Failed to get tests' });
  }
});

// Get single test by ID
app.get('/api/tests/:id', async (req, res) => {
  const testId = parseInt(req.params.id);
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, pdf_path, created_at FROM ielts_tests WHERE id = $1`,
      [testId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get Test Error:', err);
    res.status(500).json({ error: 'Failed to get test' });
  }
});

// Migration endpoint to add missing constraints
app.post('/api/migrate', async (req, res) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    // Add unique constraints to existing tables
    await pool.query(`DROP INDEX IF EXISTS idx_ielts_listening_test_section;`);
    await pool.query(`CREATE UNIQUE INDEX idx_ielts_listening_test_section ON ielts_listening(test_id, section);`);

    // Note: Removed index on passage column because large passage text exceeds PostgreSQL index size limits
    // await pool.query(`DROP INDEX IF EXISTS idx_ielts_reading_test_passage;`);
    // await pool.query(`CREATE UNIQUE INDEX idx_ielts_reading_test_passage ON ielts_reading(test_id, passage);`);

    res.json({ success: true, message: 'Migration completed' });
  } catch (err) {
    console.error('Migration Error:', err);
    res.status(500).json({ error: 'Migration failed: ' + err.message });
  }
});

// Parse PDF and extract IELTS questions using AI
app.post('/api/tests/:id/parse', async (req, res) => {
  const testId = parseInt(req.params.id);

  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  if (!AI_CONFIG.apiKey) {
    return res.status(500).json({ error: 'AI API key not configured' });
  }

  try {
    // 1. Get test info from database
    const testResult = await pool.query('SELECT * FROM ielts_tests WHERE id = $1', [testId]);
    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }
    const test = testResult.rows[0];

    // 2. Read file (PDF or DOCX)
    const filePath = path.join(process.cwd(), test.pdf_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine file type
    const isDocx = test.pdf_path.toLowerCase().endsWith('.docx') || test.pdf_path.toLowerCase().includes('/docx/');
    const isPdf = test.pdf_path.toLowerCase().endsWith('.pdf') || test.pdf_path.toLowerCase().includes('/pdfs/');

    let rawText;
    let pageCount = 0;
    let sourceType = isDocx ? 'DOCX' : 'PDF';

    if (isDocx) {
      // Extract text from Word document using mammoth
      console.log(`Extracting text from DOCX file...`);
      const result = await extractTextFromDocx(filePath);
      rawText = result.text;
      pageCount = result.pageCount;
      console.log(`Extracted text length: ${rawText.length} characters`);
    } else if (isPdf) {
      // Extract text from PDF using pdf2json
      const fileSizeMB = fs.statSync(filePath).size / (1024 * 1024);
      console.log(`PDF file size: ${fileSizeMB.toFixed(2)} MB`);

      if (fileSizeMB > 10) {
        console.warn('WARNING: PDF file is too large (>10MB), likely scanned/image-based');
        return res.status(400).json({
          error: 'scanned_pdf',
          message: '此 PDF 文件过大（超过 10MB），可能是扫描版图片。AI 无法直接解析扫描版 PDF，请使用文字版 PDF。',
          suggestion: 'Please upload a text-based PDF (not scanned images) for proper parsing. Scanned PDFs require OCR processing which is not currently supported.',
          fileSizeMB: fileSizeMB.toFixed(2)
        });
      }

      const pdfBuffer = fs.readFileSync(filePath);
      console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);

      const { text: pdfText, pageCount: pc } = await extractTextFromPdf(pdfBuffer);
      rawText = pdfText;
      pageCount = pc;
      console.log(`Extracted text length: ${rawText.length} characters`);
      console.log(`Page count: ${pageCount}`);

      // Check if PDF has enough text (scanned PDFs have very little text)
      if (rawText.length < 500) {
        console.warn('WARNING: Very little text extracted, likely a scanned/image-based PDF');
        return res.status(400).json({
          error: 'scanned_pdf',
          message: '此 PDF 几乎不包含可提取的文字，可能是扫描版图片。AI 无法直接解析扫描版 PDF，请使用文字版 PDF。',
          suggestion: 'Please upload a text-based PDF (not scanned images) for proper parsing. Scanned PDFs require OCR processing which is not currently supported.',
          extractedChars: rawText.length,
          pageCount: pageCount
        });
      }

      console.log(`First 500 chars: ${rawText.substring(0, 500)}`);
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Only PDF and DOCX files are supported.' });
    }

    // Clean up text (remove excessive spaces between letters)
    const cleanedText = rawText.replace(/\s+([a-zA-Z])\s+/g, '$1').replace(/\s+/g, ' ').trim();
    console.log(`Cleaned ${sourceType} text length: ${cleanedText.length} characters`);

    // 3. Call AI to parse
    // Use more text content for better parsing (25000 chars)
    const prompt = `
      You are an expert IELTS test parser. Extract ALL test content from the document text below.

      Test Name: "${test.name}"

      Document Content (first 50000 chars - CRITICAL: include ALL reading passage text):
      """
      ${cleanedText.substring(0, 50000)}
      """

      Extract ALL IELTS questions and return ONLY valid JSON:
      - Look for "LISTENING", "SECTION", "Questions", etc. for listening sections
      - Look for "READING", "PASSAGE", "Questions", etc. for reading passages
      - CRITICAL FOR READING: Extract the FULL passage text content, not just the title! The passage text should be complete and include all paragraphs.
      - Look for "WRITING", "Task 1", "Task 2", etc. for writing tasks
      - Look for "SPEAKING", "Cue Card", "Part 2", "Part 3", etc. for speaking questions

      CRITICAL: If you find ANY IELTS questions, include them in the JSON. Do NOT return empty arrays.
      Only return empty arrays if the section is genuinely missing from the PDF.
      {
        "listening": {
          "sections": [
            {
              "sectionNum": 1,
              "questions": [
                {
                  "id": 1,
                  "questionNum": "1-2",
                  "type": "multiple",
                  "question": "question text",
                  "options": ["A", "B", "C"]
                }
              ],
              "audioTiming": "Sections 1-2: 9 minutes"
            }
          ]
        },
        "reading": {
          "passages": [
            {
              "passageNum": 1,
              "title": "The kakapo",
              "content": "FULL PASSAGE TEXT HERE - This is the complete text of the reading passage with all paragraphs. Extract every word from the original PDF. For example: 'The kakapo is a large, flightless parrot... [entire article text]'",
              "questions": [
                {
                  "id": 1,
                  "questionNum": "1-4",
                  "type": "判断",
                  "question": "full question text"
                }
              ]
            }
          ]
        },
        "writing": {
          "task1": {
            "type": "Task1",
            "prompt": "full task prompt",
            "requirements": ["at least 150 words"],
            "wordCountTarget": 150
          },
          "task2": {
            "type": "Task2",
            "prompt": "full essay topic",
            "requirements": ["at least 250 words"],
            "wordCountTarget": 250
          }
        },
        "speaking": {
          "cueCards": [
            {
              "cueCard": "Describe a time when you...",
              "followUpQuestions": ["When?", "Why?"]
            }
          ]
        }
      }

      If a section is missing, return empty array/object.
      Use Chinese for question types (判断, 选择, 填空, 匹配, 摘要, multiple, 填空, 匹配, 地图, 表格).
    `;

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.modelName,
      messages: [
        { role: "system", content: "You are an IELTS test parser. Output valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");

    const parsedData = JSON.parse(cleanJson(content));

    // 4. Store parsed data in database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Store listening questions (use DELETE + INSERT pattern)
      if (parsedData.listening && parsedData.listening.sections) {
        // Delete existing listening data for this test
        await client.query('DELETE FROM ielts_listening WHERE test_id = $1', [testId]);
        for (const section of parsedData.listening.sections) {
          await client.query(`
            INSERT INTO ielts_listening (test_id, section, questions, audio_path)
            VALUES ($1, $2, $3, NULL)
          `, [testId, section.sectionNum, JSON.stringify(section.questions)]);
        }
      }

      // Store reading passages and questions (use DELETE + INSERT pattern)
      if (parsedData.reading && parsedData.reading.passages) {
        // Delete existing reading data for this test
        await client.query('DELETE FROM ielts_reading WHERE test_id = $1', [testId]);
        for (const passage of parsedData.reading.passages) {
          await client.query(`
            INSERT INTO ielts_reading (test_id, passage, questions)
            VALUES ($1, $2, $3)
          `, [testId, passage.content || passage.passage || passage.title || '', JSON.stringify(passage.questions)]);
        }
      }

      // Store writing tasks (use DELETE + INSERT pattern)
      if (parsedData.writing) {
        // Delete existing writing data for this test
        await client.query('DELETE FROM ielts_writing WHERE test_id = $1', [testId]);
        if (parsedData.writing.task1) {
          await client.query(`
            INSERT INTO ielts_writing (test_id, task1_prompt, task2_prompt)
            VALUES ($1, $2, NULL)
          `, [testId, JSON.stringify(parsedData.writing.task1)]);
        }
        if (parsedData.writing.task2) {
          // Get existing task1_prompt if it exists
          const existing = await client.query('SELECT task1_prompt FROM ielts_writing WHERE test_id = $1', [testId]);
          const task1Prompt = existing.rows[0]?.task1_prompt || null;
          await client.query(`
            INSERT INTO ielts_writing (test_id, task1_prompt, task2_prompt)
            VALUES ($1, $2, $3)
          `, [testId, task1Prompt, JSON.stringify(parsedData.writing.task2)]);
        }
      }

      // Store speaking cue cards (use DELETE + INSERT pattern)
      if (parsedData.speaking && parsedData.speaking.cueCards) {
        // Delete existing speaking data for this test
        await client.query('DELETE FROM ielts_speaking WHERE test_id = $1', [testId]);
        for (const card of parsedData.speaking.cueCards) {
          await client.query(`
            INSERT INTO ielts_speaking (test_id, cue_card, follow_up)
            VALUES ($1, $2, $3)
          `, [testId, card.cueCard, JSON.stringify(card.followUpQuestions)]);
        }
      }

      await client.query('COMMIT');
      console.log(`✅ Parsed and stored test ${testId}: ${test.name}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({
      success: true,
      message: 'PDF parsed successfully',
      testId,
      testName: test.name,
      parsedSections: {
        listening: parsedData.listening?.sections?.length || 0,
        reading: parsedData.reading?.passages?.length || 0,
        writing: {
          task1: !!parsedData.writing?.task1,
          task2: !!parsedData.writing?.task2
        },
        speaking: parsedData.speaking?.cueCards?.length || 0
      }
    });

  } catch (err) {
    console.error('PDF Parse Error:', err);

    // Handle AI content moderation errors
    const errMsg = err.message || '';
    if (errMsg.includes('inappropriate content') || errMsg.includes('400')) {
      return res.status(400).json({
        error: 'ai_content_filtered',
        message: 'AI 服务检测到 PDF 内容可能包含敏感信息，请尝试上传其他雅思练习材料。',
        suggestion: 'This PDF may contain content that triggered AI content filters. Please try uploading a different IELTS practice test PDF.'
      });
    }

    res.status(500).json({ error: 'Failed to parse PDF: ' + err.message });
  }
});

// Get listening questions for a test
app.get('/api/listening/:testId', async (req, res) => {
  const testId = parseInt(req.params.testId);
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM ielts_listening WHERE test_id = $1 ORDER BY section',
      [testId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No listening data found' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Get Listening Error:', err);
    res.status(500).json({ error: 'Failed to get listening data' });
  }
});

// Get reading passages for a test
app.get('/api/reading/:testId', async (req, res) => {
  const testId = parseInt(req.params.testId);
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM ielts_reading WHERE test_id = $1',
      [testId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No reading data found' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Get Reading Error:', err);
    res.status(500).json({ error: 'Failed to get reading data' });
  }
});

// Get writing tasks for a test
app.get('/api/writing/:testId', async (req, res) => {
  const testId = parseInt(req.params.testId);
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM ielts_writing WHERE test_id = $1',
      [testId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No writing data found' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Get Writing Error:', err);
    res.status(500).json({ error: 'Failed to get writing data' });
  }
});

// Get speaking cards for a test
app.get('/api/speaking/:testId', async (req, res) => {
  const testId = parseInt(req.params.testId);
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM ielts_speaking WHERE test_id = $1',
      [testId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No speaking data found' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Get Speaking Error:', err);
    res.status(500).json({ error: 'Failed to get speaking data' });
  }
});

// --- Study Plan API ---

// Get user's study plan
app.get('/api/study-plan', async (req, res) => {
  if (!isDbConnected) {
    // Return mock data for demo
    return res.json({
      plan: null,
      tasks: [],
      weeklyProgress: []
    });
  }

  try {
    // Get the most recent plan (for demo user_id = 1)
    const planResult = await pool.query(
      'SELECT * FROM study_plans WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (planResult.rows.length === 0) {
      return res.json({ plan: null, tasks: [] });
    }

    const plan = planResult.rows[0];

    // Get tasks for this plan
    const tasksResult = await pool.query(
      'SELECT * FROM study_tasks WHERE plan_id = $1 ORDER BY date, id',
      [plan.id]
    );

    res.json({
      plan,
      tasks: tasksResult.rows
    });
  } catch (err) {
    console.error('Get Study Plan Error:', err);
    res.status(500).json({ error: 'Failed to get study plan' });
  }
});

// Generate study plan with AI
app.post('/api/study-plan/generate', async (req, res) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  const { currentScore, targetScore, examDate, dailyHours } = req.body;

  if (!currentScore || !targetScore || !examDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = await pool.connect();
    await client.query('BEGIN');

    // Delete existing plan and tasks for this user
    await client.query('DELETE FROM study_tasks WHERE plan_id IN (SELECT id FROM study_plans WHERE user_id = 1)');
    await client.query('DELETE FROM study_plans WHERE user_id = 1');

    // Create new plan
    const planResult = await client.query(`
      INSERT INTO study_plans (user_id, current_score, target_score, exam_date, daily_hours)
      VALUES (1, $1, $2, $3, $4)
      RETURNING *
    `, [currentScore, targetScore, examDate, dailyHours]);

    const plan = planResult.rows[0];

    // Generate tasks based on score gap and days until exam
    const examDateObj = new Date(examDate);
    const today = new Date();
    const daysUntil = Math.ceil((examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const scoreGap = targetScore - currentScore;

    // Generate tasks for each day until exam
    const tasks = [];
    const taskTypes = ['listening', 'reading', 'writing', 'speaking', 'vocabulary'];
    const dailyMinutes = dailyHours * 60;

    for (let i = 0; i < Math.min(daysUntil, 90); i++) { // Max 90 days
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + i);
      const dateStr = taskDate.toISOString().split('T')[0];

      // Skip past dates
      if (taskDate < today) continue;

      // Generate 2-3 tasks per day based on available minutes
      const numTasks = dailyMinutes > 90 ? 3 : 2;
      const minutesPerTask = Math.floor(dailyMinutes / numTasks);

      for (let j = 0; j < numTasks; j++) {
        const taskType = taskTypes[(i + j) % taskTypes.length];
        const task = generateTaskForType(taskType, currentScore, targetScore, scoreGap);
        tasks.push({
          plan_id: plan.id,
          date: dateStr,
          type: taskType,
          title: task.title,
          description: task.description,
          duration_minutes: minutesPerTask,
          status: 'pending'
        });
      }
    }

    // Insert all tasks
    for (const task of tasks) {
      await client.query(`
        INSERT INTO study_tasks (plan_id, date, type, title, description, duration_minutes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [task.plan_id, task.date, task.type, task.title, task.description, task.duration_minutes, task.status]);
    }

    await client.query('COMMIT');
    client.release();

    res.json({
      success: true,
      plan,
      tasks
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Generate Plan Error:', err);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// Complete a study task
app.post('/api/study-plan/tasks/:taskId/complete', async (req, res) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  const taskId = parseInt(req.params.taskId);

  try {
    await pool.query(`
      UPDATE study_tasks
      SET status = 'completed', completed_at = NOW()
      WHERE id = $1
    `, [taskId]);

    res.json({ success: true });
  } catch (err) {
    console.error('Complete Task Error:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Helper function to generate task content based on type and scores
function generateTaskForType(type, currentScore, targetScore, scoreGap) {
  const tasks = {
    listening: {
      title: 'Listening Practice',
      description: scoreGap > 1 ? 'Focus on section 3 and 4 academic discussions. Practice note-taking techniques.' : 'Complete a full listening test and review your answers.'
    },
    reading: {
      title: 'Reading Practice',
      description: scoreGap > 1 ? 'Work on matching headings and True/False/Not Given questions.' : 'Timed practice with academic passages. Focus on skimming and scanning.'
    },
    writing: {
      title: 'Writing Practice',
      description: scoreGap > 1 ? 'Task 2 essay with clear argument structure. Practice 250+ words.' : 'Complete Task 1 and Task 2. Focus on grammar and vocabulary.'
    },
    speaking: {
      title: 'Speaking Practice',
      description: scoreGap > 1 ? 'Practice Part 3 discussion questions. Work on fluency and coherence.' : 'Full speaking mock test. Record and self-evaluate your responses.'
    },
    vocabulary: {
      title: 'Vocabulary Building',
      description: `Learn 20 new academic words. Focus on collocations and synonyms for Band ${Math.min(9, Math.ceil(targetScore))}.`
    }
  };

  return tasks[type] || { title: 'Study Session', description: 'Review and practice' };
}

// Explicitly bind to 0.0.0.0 for external access
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend API running at http://0.0.0.0:${port}`);
  console.log(`Current Working Directory: ${process.cwd()}`);
});
