#!/usr/bin/env node
// Seeds this video's row into the SHARED public.videos table.
// Usage: node supabase/seed.js

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const VIDEO_ID = '38080b26';

function loadEnv(envPath) {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
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
    console.error('SUPABASE_DB_URL not found in .env');
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    console.log('--- Seeding videos row (id=' + VIDEO_ID + ') ---');
    await client.query(`
      INSERT INTO public.videos (id, title, description, slug, status, video_type, viewer_takeaway, audience_deliverable, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        slug = EXCLUDED.slug,
        status = EXCLUDED.status,
        video_type = EXCLUDED.video_type,
        viewer_takeaway = EXCLUDED.viewer_takeaway,
        audience_deliverable = EXCLUDED.audience_deliverable,
        updated_at = NOW()
    `, [
      VIDEO_ID,
      'Task Decomposition',
      'Task Decomposition and learn Multi-Step Reasoning Strategies',
      'sep-3-agentic-coding',
      'draft',
      'course-module',
      'understand the use of ai in better way',
      JSON.stringify({
        title: 'Task Decomposition pre-production pipeline (this repo)',
        url: 'https://github.com/rifaterdemsahin/sep-3-agentic-coding',
        run_time_minutes: 5
      })
    ]);
    console.log('Seeded videos row: ' + VIDEO_ID + ' (sep-3-agentic-coding)');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
