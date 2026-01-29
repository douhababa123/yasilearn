const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres@47.116.177.188:5433/ielts_db',
  ssl: { rejectUnauthorized: false }
});

async function dropIndex() {
  try {
    // First check if index exists
    console.log('Checking for index...');
    const checkResult = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'ielts_reading'
      AND indexname = 'idx_ielts_reading_test_passage'
    `);
    console.log('Found indexes:', checkResult.rows);

    if (checkResult.rows.length > 0) {
      console.log('Dropping index...');
      await pool.query('DROP INDEX IF EXISTS idx_ielts_reading_test_passage');
      console.log('Index dropped successfully');
    } else {
      console.log('Index does not exist, nothing to drop');
    }
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

dropIndex();
