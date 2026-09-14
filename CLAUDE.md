# Project workflow

This is a static HTML site (10 pipeline pages under `html/` — Unknowns,
Research (`index.html`), Arguments, Script, Design, Previsualisation,
Assets, Production Plan (`todo.html`), Journal, Retro — plus a few
secondary analysis pages; JS in `js/`, shared CSS in `css/shared.css`)
for pre-production notes on the **"Task Decomposition"** course module
(3-minute hard cap). No build step. Root `index.html` is just a redirect
stub into `html/unknowns.html`/`html/index.html`.

Per-page content (source links, arguments, script beats, design specs,
shot panels, Stage 0 questions) is stored in Supabase's `content_blocks`
table and rendered client-side — see `supabase/seed-content.js` to edit
it, not the HTML. This Supabase project is **shared across every video on
the channel**; every row here carries `video_id = '38080b26'`
(`js/video-config.js`) — never touch rows for another `video_id`.

## Before opening any local page

Run a local static server on port `30080` from the repo root
(`python3 -m http.server 30080`) before opening any page. Check whether
something is already listening on 30080 first (`lsof -i :30080`) — if a
different project already owns that port, do not kill it; use a scratch
port for this repo instead and say so, rather than silently serving from
the wrong directory.

## Single-branch rule

This repo only ever has one branch: `main`. Never create, push to, or check
out any other branch — commit and push directly to `main`.

## After making changes

Always finish a change with this sequence:

1. Run a local static server for the project directory and open the
   changed page in Google Chrome to visually confirm the change (per
   global preference, use `open -a "Google Chrome" <url>`, not the
   default browser).
2. Commit and push to `main` (only when the user has asked for the change
   to be committed).
3. Open the GitHub commit page for the commit just pushed (i.e.
   `https://github.com/rifaterdemsahin/sep-3-agentic-coding/commit/<sha>`)
   in Chrome so the diff can be reviewed on GitHub.

Repo: https://github.com/rifaterdemsahin/sep-3-agentic-coding
