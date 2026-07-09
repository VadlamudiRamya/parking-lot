const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Helper to match mysql2's [rows] return style so route code stays clean
const originalQuery = pool.query.bind(pool);
pool.query = async (...args) => {
  const result = await originalQuery(...args);
  return [result.rows, result];
};

module.exports = pool;
