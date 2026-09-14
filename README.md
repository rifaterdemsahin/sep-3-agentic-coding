# Task Decomposition · Course Module

Pre-production notes for the course module **"Task Decomposition"** —
opens from understand Task Decomposition and learn Multi-Step Reasoning
Strategies, builds toward use in real life in a meaningful manner.
Locked to a **3-minute hard cap**. Static HTML, no build step, no
framework — open a file in a browser and it works.

- **Repo:** https://github.com/rifaterdemsahin/sep-3-agentic-coding
- **video_id (shared DB row key):** `38080b26`
- **Live site (Cloudflare Workers — canonical):** https://sep-3-agentic-coding.polished-boat-17b2.workers.dev/html/index.html
  - The bare domain (`/`) redirects to `/html/index.html`.
  - Deployed via `wrangler deploy` (see `wrangler.toml`); redeploy after
    any change with `npx wrangler deploy`.
- **GitHub Pages:** still builds from this repo, but every page redirects
  (`location.replace`) to the matching Cloudflare Workers URL above.
- **Data:** ONE shared Supabase Postgres project is reused across every
  video in this channel (weekly-video and course-module alike) — never a
  new project per video. Every row in `content_blocks`, `assets`, `notes`,
  `item_notes`, `ratings`, `audio_clips`, `links`, `retros`, `patterns` is
  scoped by `video_id` (see `js/video-config.js` and `supabase/README.md`).
  `patterns` is the one table this repo's JS also *reads* across other
  videos (the cross-video Formula library) — it only ever *writes* rows
  carrying this video's `video_id`.
- **Run locally:** run a local static server (`python3 -m http.server 30080`)
  from the repo root and browse to `/html/unknowns.html` — pages use
  relative `../js/`, `../css/`, `../images/` paths, so `file://` won't
  resolve them.

## For viewers

- 🎁 **Audience deliverable:** no repo/prompt/checklist/template had been
  named yet when this was scaffolded, so per the brief it defaults to
  **this repo itself** — the scaffold is the demo. Run it in under five
  minutes: clone → `npm install` → `node supabase/seed.js` →
  `node supabase/seed-content.js` → serve on `:30080`.
  https://github.com/rifaterdemsahin/sep-3-agentic-coding
- 🎬 **How this video was made:** the full pre-production trail — what I
  believed going in, research, arguments, script, design, shot board,
  decisions, and the post-publish retro — is public at
  https://sep-3-agentic-coding.polished-boat-17b2.workers.dev/html/unknowns.html

## The learning loop

The channel is a teach-to-learn flywheel:
`Real/Unknown → Imagined → Journal → Formula → Symbols → Semblance → Testing`.
Pre-production is modelled as ten linked stages, each feeding the next —
`js/pipeline.js` renders the Stage 0→9 stepper on every page:

| Stage | Page | What it holds |
|---|------|----------------|
| 0 ❓ | [Unknowns](html/unknowns.html) | Prior beliefs, open questions, falsification conditions — snapshotted before Research begins |
| 1 🔍 | [Research](html/index.html) | Source links, counter-arguments, footage leads |
| 2 🧩 | [Arguments](html/arguments.html) | Premise, arguments, conclusion |
| 3 📝 | [Script](html/script.html) | Voiceover beats, ~450 words / 3:00 hard cap |
| 4 🎨 | [Design](html/design.html) | Palette, typography, pacing, motion specs |
| 5 🎞️ | [Previsualisation](html/previsualisation.html) | 9-panel shot board |
| 6 🗂️ | [Assets](html/assets.html) | B-roll catalog + the audience deliverable card |
| 7 ✅ | [Production Plan](html/todo.html) | Kanban board through to publish |
| 8 📓 | [Journal](html/journal.html) | Decision log (every `item_notes` row marked "this is a decision") + this video's Formula |
| 9 🔁 | [Retro](html/retro.html) | Hypothesis verdict, retention, what to change — closes the loop back to Stage 0 |

Stage 0's three questions are locked (`js/unknowns.js` — prior belief and
falsifier become read-only) once you click "Lock snapshot"; only status
and answer stay editable after that. Saving a Retro verdict shows a
colored banner on both Unknowns and Journal, so the answer to Stage 0 is
visible from Stage 0.

## Folder structure

```
html/    the 10 pipeline pages, plus about/plain-english/sanity-check/task-report (secondary analysis views)
js/      shared JS modules loaded by every page (incl. video-config.js, unknowns.js, journal.js, retro.js, patterns.js)
css/     shared.css — theme variables, base body reset, top nav
images/  storyboard panel placeholders (previsualisation) — reused from the template, swap before real production
supabase/  schema + seed scripts
index.html   root redirect stub → html/index.html
```

## How content loads

1. `js/video-config.js` sets `window.VIDEO_ID` — every other data module
   reads it.
2. `js/supabase-client.js` creates one shared `window.sb` client per page
   (points at the one shared Supabase project).
3. `js/content-db.js` fetches all rows from `content_blocks` filtered to
   `video_id = VIDEO_ID`, exposing `.ready` plus `getBlocks(page, section)`.
4. Each page's own inline script waits on `ContentDB.ready` before
   building any HTML.
5. `supabase/seed-content.js` is the source of truth for placeholder
   content — every field is `TODO:`-prefixed; replace with real content
   and re-run (upserts by id, safe to re-run, scoped to this `video_id`).

## Other files

| File | Purpose |
|------|---------|
| `js/pipeline.js` | Renders the Stage 0→9 stepper |
| `js/nav.js` | Top navigation bar — Remember / Understand / Loop / Analysis / Evaluate / Create menus |
| `js/unknowns.js` | Stage 0 question-cards + Snapshot lock |
| `js/journal.js` | Stage 8 decision log + Formula editor |
| `js/patterns.js` | Reads/writes this video's row in the shared `patterns` table (cross-video Formula library) |
| `js/retro.js` | Stage 9 retro form, bound to this video's `retros` row |
| `js/links.js` | Cross-stage linking, including Research → Unknowns |
| `js/notes.js` | Bottom notes bar + per-item notes, including the "this is a decision" checkbox |
| `js/theme.js` | 7-mode theme switcher |
| `js/ratings.js` | Star-rating + re-sort |
| `js/audio-clips.js` | Manifest of Kokoro voice-over clips already saved to Azure Blob Storage |
| `transcripts/` | Raw transcripts backing Research |

## Workflow

See `CLAUDE.md` for the standard change → preview → commit → push →
review-on-GitHub sequence used on this repo.
