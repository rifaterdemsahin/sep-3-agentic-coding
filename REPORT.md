# Migration Report — Supabase backend + Cloudflare Workers deployment

**Date:** 2026-09-09
**Repo:** https://github.com/rifaterdemsahin/sep-3-agentic-coding
**Commits:** [`b9918b4`](https://github.com/rifaterdemsahin/sep-3-agentic-coding/commit/b9918b460768fc60aad0f3ab295b8a6483853042), [`c772df0`](https://github.com/rifaterdemsahin/sep-3-agentic-coding/commit/c772df087094ce9d6bf125768b87256ab6fe2790)

## 1. Summary

Two changes, requested in the same session:

1. Moved the site's four client-side data structures (assets, notes,
   ratings, cross-stage links) off `localStorage`/cookies/Azure blob and
   onto a shared Supabase Postgres database.
2. Deployed the static site to Cloudflare Workers and made GitHub Pages
   redirect to it, so there's one canonical live host.

## 2. Supabase migration

### 2.1 What was moved

| Data | Old storage | New storage | File |
|---|---|---|---|
| Saved assets ("Add to Assets" items) | `localStorage` (`taskDecomposition_assets_v1`) | `assets` table | `assets.js` |
| Free-form production notes | Cookie + Azure Blob sync | `notes` table | `notes.js` |
| Per-item notes | Cookie + Azure Blob sync | `item_notes` table | `notes.js` |
| 1–5 star ratings | Cookie (`taskDecomposition_ratings_v1`) | `ratings` table | `ratings.js` |
| Cross-stage item links | `localStorage` (`taskDecomposition_links_v1`) | `links` table | `links.js` |

### 2.2 Schema

`supabase/schema.sql` — five tables (`assets`, `notes`, `item_notes`,
`ratings`, `links`), each with Row Level Security enabled and a
permissive `for all using (true) with check (true)` anon policy. This is
a single-user pre-production tool with no login system, so the anon
public API key is intentionally allowed full read/write — access control
here is "only people with the URL", not per-user auth.

Applied with `node supabase/apply-schema.js`, a small Node script (uses
the `pg` package) that reads `SUPABASE_DB_URL` from `.env` and runs the
SQL directly against the live database. Idempotent — every statement is
`create table if not exists` / `drop policy if exists ... create policy`.

### 2.3 Client wiring

- `supabase-client.js` (new) — creates a single `window.sb` Supabase JS
  client from the project URL + anon key. Loaded via CDN
  (`@supabase/supabase-js@2` UMD build from jsDelivr) before any other
  script on every page.
- `assets.js`, `notes.js`, `ratings.js`, `links.js` were rewritten to:
  - Keep an in-memory cache per module, populated by an async fetch that
    kicks off as soon as the script loads.
  - Expose a `.ready` promise (or, for `notes.js`/`links.js`, wrap their
    own `DOMContentLoaded`/init logic) so UI code that used to read the
    cache synchronously now waits for the initial load before building
    widgets — e.g. `index.html`'s `Ratings.makeSortable(...)` calls are
    now wrapped in `Ratings.ready.then(function(){ ... })`.
  - Apply writes optimistically (update the local cache immediately for
    a responsive UI) and push to Supabase in the background, logging to
    `console.error` on failure rather than blocking the UI.
- All 6 HTML pages (`index.html`, `arguments.html`, `assets.html`,
  `design.html`, `previsualisation.html`, `script.html`) got two new
  `<script>` tags (Supabase CDN + `supabase-client.js`) inserted before
  their first script that depends on `window.sb`.

### 2.4 Verification

Loaded `index.html` against a local static server in Chrome via
browser automation, clicked a star rating, and confirmed via a direct
`psql`-equivalent query (Node + `pg`) that the row appeared in the
`ratings` table in Supabase — then deleted that test row. No console
errors on load.

### 2.5 Credentials

- `SUPABASE_DB_URL` (direct Postgres connection string, used only by
  `supabase/apply-schema.js`) and `SUPABASE_ANON_KEY` (used by the
  browser client) were added to `.env`, which is git-ignored and was
  never committed.
- The anon key is intentionally also hardcoded into `supabase-client.js`
  and shipped to the browser — this is safe by Supabase's design (access
  is enforced by RLS policies, not by keeping the anon key secret).
- Both were also written to the Azure Key Vault `dp-kv-deliverypilot` as
  `sep1-supabase-db-url`, `sep1-supabase-url`, and
  `sep1-supabase-anon-key`, at the user's request.
- **Not done:** the DB password was shared in plaintext in the chat
  session. The user was offered a rotation (`ALTER ROLE ... PASSWORD`)
  and declined for now — **this is still outstanding** and worth doing
  from the Supabase dashboard when convenient.

## 3. Cloudflare Workers deployment

### 3.1 What was done

- Added `wrangler.toml` configuring Workers Static Assets
  (`[assets] directory = "."`), so the whole repo serves as-is with no
  build step, matching the project's "static HTML, no build" model.
- Authenticated `wrangler` non-interactively using a Cloudflare API
  token and account ID pulled from the same Azure Key Vault
  (`cloudflare-api-token`, `cloudflare-account-id` — both pre-existing
  secrets from an earlier project, reused via `az keyvault secret show`).
- Deployed with `npx wrangler deploy`. Live at:
  **https://sep-3-agentic-coding.polished-boat-17b2.workers.dev**

### 3.2 Issue found and fixed during deployment

The first deploy uploaded **518 files** from the project directory,
including the entire `.git/` directory (objects, refs, hooks) and
`node_modules/` (installed just for `apply-schema.js`). That meant the
repository's git history and installed packages would have been
publicly fetchable over HTTP from the Workers URL — a classic
`.git`-exposure issue, just via a CDN instead of a misconfigured web
server.

This was caught immediately by inspecting the deploy log's asset list
(rather than assuming a clean deploy). Fixed by:

1. Adding `.assetsignore` (the file Workers Static Assets actually
   reads — an earlier `.wranglerignore` alone did **not** exclude
   these paths) listing `node_modules`, `.git`, `.env`, `supabase`,
   `transcripts`, and the wrangler config files themselves.
2. Redeploying and confirming via `curl`:
   - `/.git/config` → 404
   - `/node_modules/pg/package.json` → 404
   - `/.env` → 404
   - `/supabase/apply-schema.js` → 404
   - `/index.html` and `/` → 200, correct content

Checked whether `.env` had ever been committed to git history
(`git log --all --diff-filter=A --name-only | grep -x '\.env'`) — it had
not, so no credentials were exposed at any point, only non-secret
repository metadata and open-source package files, and only for the
few minutes between the first and second deploy.

### 3.3 GitHub Pages → Cloudflare Workers redirect

Rather than removing GitHub Pages hosting, each of the 6 HTML pages got
a small inline script right after the viewport `<meta>` tag:

```html
<script>
  if(location.hostname.endsWith('github.io')){
    location.replace('https://sep-3-agentic-coding.polished-boat-17b2.workers.dev' + location.pathname + location.search + location.hash);
  }
</script>
```

This is a no-op on every other host (Cloudflare Workers itself, a local
static server, `file://`), so it doesn't interfere with local
development or the canonical deployment — it only forwards visitors who
land on the old `github.io` URL.

### 3.4 README.md

Updated to list the Cloudflare Workers URLs as the canonical live links,
note that GitHub Pages now redirects there, and mention that both hosts
share the same Supabase-backed data.

## 4. Files changed

**Commit `b9918b4`** — Supabase migration:
`assets.js`, `notes.js`, `ratings.js`, `links.js` (rewritten),
`supabase-client.js` (new), `supabase/schema.sql`,
`supabase/apply-schema.js`, `supabase/README.md` (new),
`index.html`, `arguments.html`, `assets.html`, `design.html`,
`previsualisation.html`, `script.html` (script tags + a couple of
`.ready`/async call-site adjustments), `.gitignore` (added
`node_modules/`), `README.md` (unrelated pre-existing typo fix carried
along).

**Commit `c772df0`** — Cloudflare Workers deployment:
`wrangler.toml`, `.assetsignore`, `.wranglerignore` (new),
`index.html`, `arguments.html`, `assets.html`, `design.html`,
`previsualisation.html`, `script.html` (redirect script added),
`README.md` (live links updated).

## 5. Outstanding / follow-ups

- **Rotate the Supabase DB password** — it was pasted in plaintext in
  chat; the user declined rotation for now.
- The Cloudflare Workers URL (`sep-3-agentic-coding.polished-boat-17b2.workers.dev`)
  is the auto-generated `workers.dev` subdomain. A custom domain can be
  attached later via the Cloudflare dashboard/`wrangler` if wanted.
- GitHub Pages itself is still building and serving the full site under
  the hood (the redirect is client-side JS) — if the intent is to
  actually decommission GitHub Pages, that's a separate step in the
  repo's Pages settings.
