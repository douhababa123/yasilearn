
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001; 

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
  if (isDbConnected) {
    try {
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
      let status = quality === 5 ? 'mastered' : (quality === 3 ? 'reviewing' : 'learning');
      
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
    let status = quality === 5 ? 'mastered' : (quality === 3 ? 'reviewing' : 'learning');
    
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
    } else if (quality === 3) {
      interval_minutes = Math.max(Math.floor(interval_minutes * 1.2), 30);
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

// Explicitly bind to 0.0.0.0 for external access
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend API running at http://0.0.0.0:${port}`);
  console.log(`Current Working Directory: ${process.cwd()}`);
});
