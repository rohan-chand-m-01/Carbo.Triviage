const { Client } = require('pg');
require('dotenv').config();

async function enableVector() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Extension "vector" enabled successfully');
  } catch (err) {
    console.error('Error enabling vector extension:', err);
  } finally {
    await client.end();
  }
}

enableVector();
