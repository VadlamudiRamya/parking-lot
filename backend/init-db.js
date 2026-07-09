/**
 * init-db.js — Runs on `npm postinstall` to create the tickets table
 * if it doesn't already exist. Uses DATABASE_URL when available.
 */
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.log('⏭️  No DATABASE_URL found — skipping DB init (local dev mode).');
  process.exit(0);
}

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅  Database schema initialized successfully.');
  } catch (err) {
    console.error('❌  Failed to initialize database schema:', err.message);
    // Don't fail the build — the table may already exist
  } finally {
    await pool.end();
  }
})();
