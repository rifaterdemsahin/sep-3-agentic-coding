# 🎬 Video Production Project Template Specification

A standardized specification for scaffolding new video pre-production and production pipeline repositories based on [rifaterdemsahin/sep-3-agentic-coding](https://github.com/rifaterdemsahin/sep-3-agentic-coding/tree/main).

---

## 🏗️ 1. Architecture Overview

Each video project follows a 7-stage static HTML + Supabase Postgres architecture that runs with zero build step, deploys via Cloudflare Workers / GitHub Pages, and uses Kokoro TTS + Azure Blob Storage for audio generation.

```
📁 Project Directory
├── index.html                   # Root redirect stub to html/index.html
├── html/                        # 7-Stage Pre-Production Web Application
│   ├── index.html               # Stage 1: Research & Counter-Sources
│   ├── arguments.html           # Stage 2: Core Arguments & Sanity Checks
│   ├── script.html              # Stage 3: Voiceover Script & Audio Player
│   ├── design.html              # Stage 4: Visual & Color Palette Specs
│   ├── previsualisation.html    # Stage 5: 9-Panel Shot Board
│   ├── assets.html              # Stage 6: Asset Catalog & B-Roll Queries
│   └── todo.html                # Stage 7: Interactive Kanban Production Board
├── css/
│   └── shared.css               # Design tokens, themes & layout styles
├── js/
│   ├── supabase-client.js       # Shared Supabase Postgres JS client
│   ├── content-db.js            # Content blocks fetcher & cache
│   ├── nav.js                   # Top navigation bar
│   ├── pipeline.js              # Pipeline stage indicator
│   ├── notes.js                 # Item notes & collaborative notes
│   ├── ratings.js               # Star ratings system
│   ├── assets.js                # Add-to-assets engine & Azure upload
│   └── audio-clips.js           # Azure / Kokoro audio playback engine
├── supabase/
│   ├── schema.sql               # Relational schema (videos, blocks, assets, etc.)
│   ├── seed.js                  # Master seed script (Node.js + pg)
│   ├── seed-content.js          # Authoritative stage cards & VO script data
│   └── apply-schema.js          # Schema executor
└── .env                         # Connection credentials (git-ignored)
```

---

## 🗄️ 2. Database Schema Specification

### Tables

1. **`videos`**:
   - `id (text primary key)`: e.g., `sep-3-agentic-coding`
   - `title (text)`: Video title
   - `description (text)`: Video description & core hypothesis
   - `slug (text)`: URL slug
   - `status (text)`: `draft` | `production` | `review` | `published`
   - `created_at / updated_at (timestamptz)`

2. **`content_blocks`**:
   - `id (text primary key)`
   - `page (text)`: e.g., `script.html`
   - `section (text)`: e.g., `beats`
   - `position (int)`
   - `type (text)`: `link-card` | `argument-card` | `beat` | `shot-panel`
   - `data (jsonb)`: Custom payload per block type

3. **`assets`**:
   - `id (text primary key)`
   - `type, title, description, source, url, comment, added_at`

4. **`notes` & `item_notes`**:
   - Freeform production notes and per-card annotations.

5. **`ratings`**:
   - Star ratings (1-5) per item.

6. **`audio_clips`**:
   - Manifest of generated Kokoro TTS audio clips backed up in Azure Blob Storage.

---

## 🚀 3. Scaffolding a New Video Project

To spin up a new video project:

1. **Clone/Template the Repository**:
   ```bash
   git clone https://github.com/rifaterdemsahin/sep-3-agentic-coding.git my-new-video
   cd my-new-video
   ```

2. **Configure Environment (`.env`)**:
   ```env
   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=[ANON-KEY]
   ```

3. **Initialize Schema & Video Row**:
   ```bash
   node supabase/apply-schema.js
   node supabase/seed.js
   ```

4. **Author Content**:
   - Edit `supabase/seed-content.js` with research sources, arguments, script beats, design specs, and storyboard shots.
   - Run `node supabase/seed-content.js`.

5. **Start Local Preview Server (Port > 30,000)**:
   ```bash
   python3 -m http.server 30080
   open -a "Google Chrome" http://localhost:30080/html/index.html
   ```
