#!/usr/bin/env node
// Applies supabase/schema.sql to the Supabase Postgres database.
// Reads SUPABASE_DB_URL from ../.env (never hardcode credentials here).
//
// Usage: node supabase/apply-schema.js

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv(envPath) {
  const out = {};
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) out[m[1]] = m[2];
  });
  return out;
}

async function main() {
  const env = loadEnv(path.join(__dirname, '..', '.env'));
  const connectionString = env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error('SUPABASE_DB_URL not set in .env');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  await client.connect();
  try {
    await client.query(sql);
    console.log('Schema applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Failed to apply schema:', err.message);
  process.exit(1);
});
