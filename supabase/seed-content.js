#!/usr/bin/env node
// Seeds public.content_blocks with placeholder production content for this
// video (VIDEO_ID below). One example block per type per page, so every
// page renders non-empty — real research/arguments/script/shots are the
// creator's job, not this script's (every text field below is TODO-prefixed).
// Every row carries video_id = VIDEO_ID and is safe to re-run (upsert by id).
// Usage: node supabase/seed-content.js

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

// ---------------------------------------------------------------------
// unknowns.html — Stage 0 (three required question-cards)
// ---------------------------------------------------------------------
const unknownsBlocks = [
  { id: 'unknowns-questions-1', question: 'TODO: what I currently believe about task decomposition', prior_belief: 'TODO: prior belief', falsifier: 'TODO: how this could be wrong', status: 'open', answer: '', snapshot_locked: false },
  { id: 'unknowns-questions-2', question: 'TODO: what I\'m unsure of about multi-step reasoning strategies', prior_belief: 'TODO: prior belief', falsifier: 'TODO: how this could be wrong', status: 'open', answer: '', snapshot_locked: false },
  { id: 'unknowns-questions-3', question: 'TODO: how the hypothesis could be wrong', prior_belief: 'TODO: prior belief', falsifier: 'TODO: how this could be wrong', status: 'open', answer: '', snapshot_locked: false }
].map((d, i) => ({ id: d.id, page: 'unknowns.html', section: 'questions', position: i, type: 'question-card', data: d }));

// ---------------------------------------------------------------------
// index.html — Stage 1 Research
// ---------------------------------------------------------------------
const indexBlocks = [
  ...[
    { id: 'index-source-links-1', tag: '🎯 Reverse-engineer source', title: 'TODO: source video/article this reverse-engineers', url: 'https://example.com/TODO', urlDisplay: 'example.com/TODO', desc: 'TODO: n/a for course-module (left blank per brief — this repo is a course-module, not a weekly-video)' }
  ].map((d, i) => ({ id: d.id, page: 'index.html', section: 'source-links', position: i, type: 'link-card', data: d })),

  ...[
    { id: 'index-pro-con-videos-1', title: 'TODO: pro/con reference video title', href: 'https://example.com/TODO', sub: 'TODO', angle: 'TODO: which side of the argument', pro: 'TODO: what makes this useful', con: 'TODO: what to watch out for' }
  ].map((d, i) => ({ id: d.id, page: 'index.html', section: 'pro-con-videos', position: i, type: 'video-row', data: d })),

  ...[
    { id: 'index-perspective-comparison-1', emojiLabel: 'TODO: perspective name', sub: 'TODO', argument: 'TODO: core argument', pros: 'TODO: pros', cons: 'TODO: cons' }
  ].map((d, i) => ({ id: d.id, page: 'index.html', section: 'perspective-comparison', position: i, type: 'perspective-row', data: d })),

  ...[
    { id: 'index-footage-shot-list-1', sec: 'TODO section', title: 'B-roll category', desc: 'TODO: what this footage shows', items: 'TODO: <b>search terms</b> — see assets.html for the mapped shot list', warm: false }
  ].map((d, i) => ({ id: d.id, page: 'index.html', section: 'footage-shot-list', position: i, type: 'shot-row', data: d }))
];

// ---------------------------------------------------------------------
// arguments.html — Stage 2 Arguments
// ---------------------------------------------------------------------
const argumentsBlocks = [
  { id: 'arguments-core-message-1', page: 'arguments.html', section: 'core-message', position: 0, type: 'argument-card',
    data: { tag: 'Core Message', title: 'TODO: core message', desc: 'TODO', body: 'TODO: the one-sentence claim this video makes.', footer: 'TODO: why this matters to the viewer' } },
  { id: 'arguments-premise-1', page: 'arguments.html', section: 'premise', position: 0, type: 'argument-card',
    data: { tag: 'Premise', title: 'TODO: premise', desc: 'TODO', body: 'TODO: the starting premise the arguments build from.' } },
  { id: 'arguments-audience-transformation-1', page: 'arguments.html', section: 'audience-transformation', position: 0, type: 'argument-card',
    data: { tag: 'Before / After', title: 'TODO: viewer transformation', desc: 'TODO', beforeTitle: 'Before', beforeItems: ['TODO: before item 1'], afterTitle: 'After', afterItems: ['TODO: after item 1 — matches VIEWER_TAKEAWAY'], summary: 'TODO: one-line summary of the transformation' } },
  { id: 'arguments-arguments-1', page: 'arguments.html', section: 'arguments', position: 0, type: 'argument-card',
    data: { cardId: 'arg-todo-1', num: 'Argument 1', fullTitle: 'TODO: argument 1 full title', title: 'TODO: argument 1', desc: 'TODO', body: 'TODO: argument 1 body.', linkHref: '#', linkLabel: 'TODO: source link' } },
  { id: 'arguments-conclusion-1', page: 'arguments.html', section: 'conclusion', position: 0, type: 'argument-card',
    data: { tag: 'Conclusion', title: 'TODO: conclusion', desc: 'TODO', body: 'TODO: conclusion body.', body2: 'TODO: conclusion continued.' } },
  { id: 'arguments-sanity-check-1', page: 'arguments.html', section: 'sanity-check', position: 0, type: 'sanity-card',
    data: { cardId: 'sanity-todo-1', checkboxId: 'sanity-cb-todo-1', title: 'TODO: sanity check', desc: 'TODO: what this check verifies', verdict: 'TODO: verdict', label: 'Sanity 1' } }
];

// ---------------------------------------------------------------------
// script.html — Stage 3 Script (course-module: ~450 words @150wpm, 3:00 hard cap)
// ---------------------------------------------------------------------
const scriptBlocks = [
  { id: 'script-beats-hook', sectionId: 'beat-hook', title: 'Hook — Opens from: understand Task Decomposition and learn Multi-Step Reasoning Strategies', tc: '0:00–0:20', warm: false,
    visualDesc: 'TODO: visual direction for the hook.', vo: ['TODO: hook voiceover line — must open by stating the module understands Task Decomposition and learn Multi-Step Reasoning Strategies.'],
    addTitle: 'TODO: hook beat', addDesc: 'TODO' },
  { id: 'script-beats-core', sectionId: 'beat-core', title: 'Core Explanation', tc: '0:20–2:10', warm: false,
    visualDesc: 'TODO: visual direction for the core explanation.', vo: ['TODO: core voiceover — the multi-step reasoning strategy explained.'],
    addTitle: 'TODO: core beat', addDesc: 'TODO' },
  { id: 'script-beats-outro', sectionId: 'beat-outro', title: 'Close — use in real life in a meaningful manner', tc: '2:10–3:00', warm: true,
    visualDesc: 'TODO: visual direction for the close.', vo: ['TODO: close voiceover — points the viewer at the audience deliverable so they can use this in real life in a meaningful manner.'],
    addTitle: 'TODO: outro beat', addDesc: 'TODO' }
].map((d, i) => ({ id: d.id, page: 'script.html', section: 'beats', position: i, type: 'beat', data: d }));

// ---------------------------------------------------------------------
// design.html — Stage 4 Design
// ---------------------------------------------------------------------
const designBlocks = [
  ...[
    { cls: 'cold', eyebrow: 'Act 1', title: 'Setup', tc: '0:00–0:20', items: ['TODO: act 1 beat'], linkHref: 'script.html#beat-hook', linkLabel: 'View in Script →' },
    { cls: '', eyebrow: 'Act 2', title: 'Confrontation', tc: '0:20–2:10', items: ['TODO: act 2 beat'], linkHref: 'script.html#beat-core', linkLabel: 'View in Script →' },
    { cls: 'warm', eyebrow: 'Act 3', title: 'Resolution', tc: '2:10–3:00', items: ['TODO: act 3 beat'], linkHref: 'script.html#beat-outro', linkLabel: 'View in Script →' }
  ].map((d, i) => ({ id: 'design-three-act-structure-' + (i + 1), page: 'design.html', section: 'three-act-structure', position: i, type: 'act-card', data: d })),

  { id: 'design-editing-rule-1', page: 'design.html', section: 'editing-rule', position: 0, type: 'editing-rule-pair',
    data: { cold: { title: 'TODO: cold mood', items: ['TODO: cold visual rule'] }, warm: { title: 'TODO: warm mood', items: ['TODO: warm visual rule'] } } },

  { id: 'design-typography-1', page: 'design.html', section: 'typography', position: 0, type: 'typography-samples',
    data: { title: { label: 'Title', sample: 'TODO Sample Title', sub: 'TODO subtitle' }, lower: { label: 'Lower third', sample: 'TODO lower third' } } },

  ...[
    { graphic: 'TODO: motion graphic', style: 'TODO: style', section: 'Hook', addTitle: 'TODO', addDesc: 'TODO' }
  ].map((d, i) => ({ id: 'design-motion-specs-' + (i + 1), page: 'design.html', section: 'motion-specs', position: i, type: 'spec-row', data: d })),

  { id: 'design-pacing-1', page: 'design.html', section: 'pacing', position: 0, type: 'pacing-bar',
    data: { act1Flex: 20, act2Flex: 55, act3Flex: 25 } }
];

// ---------------------------------------------------------------------
// previsualisation.html — Stage 5 Previsualisation (9-panel shot board)
// ---------------------------------------------------------------------
const previsBlocks = [
  { id: 'previs-intro-1', page: 'previsualisation.html', section: 'intro', position: 0, type: 'layman-intro',
    data: { title: 'TODO: previs intro title', body: 'TODO: in plain English, what this shot board sets up — builds toward "use in real life in a meaningful manner" via the assets.html deliverable.' } },

  ...Array.from({ length: 9 }, (_, i) => i + 1).map((n, i) => ({
    id: 'previs-shot-board-' + n,
    page: 'previsualisation.html',
    section: 'shot-board',
    position: i,
    type: 'shot-panel',
    data: {
      n: n, mood: n <= 3 ? 'cold' : (n <= 6 ? '' : 'warm'),
      img: '../images/panel_' + n + '.jpg', tc: 'TODO:00', tag: 'TODO tag',
      section: n <= 3 ? 'Hook' : (n <= 6 ? 'Core' : 'Close'),
      title: 'TODO: panel ' + n + ' title', desc: 'TODO: panel ' + n + ' shot description.',
      vo: 'TODO: panel ' + n + ' voiceover line.', layman: 'TODO: plain-English gloss for panel ' + n + '.',
      prompt: 'TODO: image-gen prompt for panel ' + n, downloadName: 'panel_' + n + '.jpg'
    }
  }))
];

// ---------------------------------------------------------------------
// assets: audience deliverable + real-life-application placeholder,
// inserted directly into public.assets (assets.html renders AssetDB.getAssets(),
// it does not read content_blocks).
// ---------------------------------------------------------------------
const assetItems = [
  {
    id: 'assets-audience-deliverable-1', type: 'audience-deliverable',
    title: 'Task Decomposition pre-production pipeline (this repo)',
    description: 'No named deliverable was supplied for this module, so per the brief it defaults to this repo itself — the scaffold is the demo. Run it in under 5 minutes: clone, npm install, node supabase/seed.js, node supabase/seed-content.js, serve on :30080.',
    source: 'assets.html', url: 'https://github.com/rifaterdemsahin/sep-3-agentic-coding',
    comment: 'TODO: once a real deliverable (repo/prompt/checklist/template) exists, replace this row.'
  },
  {
    id: 'assets-real-life-application-1', type: 'real-life-application',
    title: 'TODO: use in real life in a meaningful manner',
    description: 'TODO: concrete way the viewer applies task decomposition / multi-step reasoning after watching.',
    source: 'assets.html', url: '', comment: ''
  }
];

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
    const allBlocks = [
      ...unknownsBlocks, ...indexBlocks, ...argumentsBlocks,
      ...scriptBlocks, ...designBlocks, ...previsBlocks
    ];

    console.log('--- Seeding content_blocks (video_id=' + VIDEO_ID + ') ---');
    for (const b of allBlocks) {
      await client.query(`
        INSERT INTO public.content_blocks (id, page, section, position, type, data, video_id, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          page = EXCLUDED.page, section = EXCLUDED.section, position = EXCLUDED.position,
          type = EXCLUDED.type, data = EXCLUDED.data, video_id = EXCLUDED.video_id, updated_at = NOW()
      `, [b.id, b.page, b.section, b.position, b.type, JSON.stringify(b.data), VIDEO_ID]);
    }
    console.log(`Seeded ${allBlocks.length} content blocks.`);

    console.log('--- Seeding assets (audience deliverable + real-life application) ---');
    for (const item of assetItems) {
      await client.query(`
        INSERT INTO public.assets (id, type, title, description, source, url, comment, added_at, video_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type, title = EXCLUDED.title, description = EXCLUDED.description,
          source = EXCLUDED.source, url = EXCLUDED.url, comment = EXCLUDED.comment, video_id = EXCLUDED.video_id
      `, [item.id, item.type, item.title, item.description, item.source, item.url, item.comment, VIDEO_ID]);
    }
    console.log(`Seeded ${assetItems.length} asset items.`);

    console.log('--- Seeding placeholder Formula (patterns) ---');
    const existing = await client.query('select id from public.patterns where video_id = $1 limit 1', [VIDEO_ID]);
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO public.patterns (video_id, formula, symbol, evidence)
        VALUES ($1, $2, $3, $4)
      `, [VIDEO_ID, 'TODO: reusable rule', 'TODO: symbol', '']);
      console.log('Seeded 1 placeholder pattern row.');
    } else {
      console.log('Pattern row already exists for this video, left untouched.');
    }

    console.log('\n✅ Content seeded successfully!');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
