# Supabase backend

This project's page content and browser-side data — the source links,
arguments, script beats, design specs and shot panels on each stage page,
plus saved assets, notes, ratings, and cross-stage links — is stored in a
Supabase Postgres database instead of hardcoded HTML / `localStorage` /
cookies, so it's shared across devices/browsers and editable without
touching markup.

- **Project:** `mdsykpdkdprtmkccukle` (https://mdsykpdkdprtmkccukle.supabase.co)
- **Schema:** [`schema.sql`](./schema.sql)
- **Client:** [`../js/supabase-client.js`](../js/supabase-client.js) creates a
  single `window.sb` Supabase JS client, loaded on every page before
  `nav.js`/`content-db.js`/`theme.js`/`notes.js`/`assets.js`/`ratings.js`/`links.js`.

## Tables

| Table | Replaces | Columns |
|---|---|---|
| `videos` | Project catalog for multi-video pipelines | `id, title, description, slug, status, created_at, updated_at` |
| `content_blocks` | Hand-authored HTML per stage page | `id, page, section, position, type, data (jsonb), updated_at` |
| `assets` | `assets.js` localStorage (`jobApocalypse_assets_v1`) | `id, type, title, description, source, url, comment, added_at` |
| `notes` | `notes.js` cookie (`jobApocalypse_notes_v1`) + Azure blob sync | `id (uuid), page, text, created_at` |
| `item_notes` | `notes.js` cookie (`jobApocalypse_itemNotes_v1`) + Azure blob sync | `id, text, updated_at` |
| `ratings` | `ratings.js` cookie (`jobApocalypse_ratings_v1`) | `id, stars, updated_at` |
| `links` | `links.js` localStorage (`jobApocalypse_links_v1`) | `key, linked_ids (text[]), updated_at` |
| `audio_clips` | No prior manifest — only Azure Blob + browser IndexedDB | `id, page, card_id, voice, speed, blob_path, updated_at` |

All tables have Row Level Security enabled with a permissive "anon full
access" policy — this is a single-user pre-production tool with no login,
so the anon public API key can read/write everything.

### `content_blocks`

One row per card/row/panel that used to be hardcoded HTML — `id` matches
the item id previously used on the `add-asset-btn`/`data-id` attribute
(so existing `ratings`/`item_notes`/`assets` rows keyed by that id still
match). `data` is a JSON blob shaped per `type`
(`link-card`, `video-row`, `argument-card`, `beat-section`, `shot-panel`,
etc.) — each page's own inline script knows how to render its types.
Edit content by editing [`seed-content.js`](./seed-content.js) and
re-running it (upserts by id, safe to re-run):

```bash
node supabase/seed-content.js
```

`js/content-db.js` is the read side: it fetches the whole table once per
page load and exposes `ContentDB.getBlocks(page, section)`.

## Applying the schema

```bash
npm install pg --no-save   # if not already installed
node supabase/apply-schema.js
```

Reads `SUPABASE_DB_URL` from `.env` (git-ignored) and runs `schema.sql`
against the live database. Safe to re-run — every statement is
`create table if not exists` / `drop policy if exists`.

## Credentials

- `SUPABASE_DB_URL` (direct Postgres connection, used only by
  `apply-schema.js`) and `SUPABASE_ANON_KEY` (used by the browser client)
  live in `.env`, which is git-ignored.
- The anon key is safe to ship in client-side JS by design — Supabase
  scopes its access via RLS policies, not secrecy.
- A copy of both is also stored in the `dp-kv-deliverypilot` Azure Key
  Vault as `sep1-supabase-db-url`, `sep1-supabase-url`, and
  `sep1-supabase-anon-key`.
