# Project workflow

## Project specs

Goal: To do preproduction for video production to have the confidence to
move into the video production to generate assets.

- **Title:** "Task Decomposition" — a course module (not a weekly channel
  video), built on the same repo template as the channel's regular videos.
- **Premise:** opens from *understand Task Decomposition* and *learn
  Multi-Step Reasoning Strategies*, builds toward "use in real life in a
  meaningful manner." (The core message/argument cards themselves are
  authored in Supabase, not this repo — see `supabase/seed-content.js`.)
- **Format cap:** 3-minute hard cap, ≈450 words of voiceover script.
- **Repo:** https://github.com/rifaterdemsahin/sep-3-agentic-coding
- **`video_id` (shared DB row key):** `38080b26`
- **Live site (canonical, Cloudflare Workers):**
  https://sep-3-agentic-coding.polished-boat-17b2.workers.dev/html/index.html
  — redeploy after any change with `npx wrangler deploy`.
- **GitHub Pages:** still builds, but every page redirects to the
  Cloudflare Workers URL above.
- **Stack:** static HTML/CSS/JS, no build step, no framework — one shared
  Supabase Postgres project (reused across every video on the channel,
  not one project per video) for all per-page content, notes, ratings,
  links, journal/retro rows. Kokoro TTS + Azure Blob Storage for
  voiceover audio.
- **Pipeline model:** pre-production is nine linked stages (Unknowns →
  Research → Arguments → Script → Design → Previsualisation → Pre
  Production Plan → Journal → Retro), each feeding the next;
  `js/pipeline.js` renders the stage stepper on every page. See "Pages"
  below for what belongs on each one.

This is a static HTML site (JS in `js/`, shared CSS in `css/shared.css`).
No build step. Root `index.html` is just a redirect stub into
`html/unknowns.html`/`html/index.html`.

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

## Pages

The top nav (built once in `js/nav.js`, rendered into `#nav-mount` on
every page) groups pages into five menus. Each page below lives at
`html/<file>` unless noted.

### 🧠 Remember
- **Unknowns** (`unknowns.html`) — Stage 0 open questions for the video, tracked before research locks anything in.
- **Research** (`index.html`) — source links, pro/con video comparisons, perspective comparison table, and footage-lead shot list; feeds Arguments.
- **Arguments** (`arguments.html`) — core message, premise, audience transformation, the 20 argument cards, sanity-check cards, and conclusion; built from Research, feeds Script.

### 💡 Understand
- **Script** (`script.html`) — the 5-beat script (Hook → 3 sections → Outro) with VO text, visual notes, and audio generation/download tools; feeds Design.
- **Design** (`design.html`) — three-act structure breakdown, core editing rule, theme/palette, typography, and motion-graphics specs; feeds Previsualisation.
- **Previsualisation** (`previsualisation.html`) — the shot board (panels mapped to script beats) with prompts, downloadable images, and a carousel/grid view; shows empty-state placeholders when no shots exist yet.

### 📊 Analysis (static — snapshots of the video's own content, don't change per iteration)
- **About this video** (`about.html`) — the 5W1H (why/what/how/when/where) behind the video. Currently placeholder text — fill in once the real argument is locked.
- **Task Report** (`task-report.html`) — production-plan progress by stage with recommended focus.

### ⚖️ Evaluate (updates every version/iteration — re-run these each time you revise the content)
- **Confidence Check** (`confidence_check.html`) — one live score for the whole project, computed from Pre Production Plan task completion via `Nav.getGamifiedStats()`. Check this every time you're working on the project. With changes, open this page after updating it.
- **Sanity Check Report** (`sanity-check.html`) — project health/logic/data-integrity checks, plus the script length & version audit (word count and estimated runtime per beat vs. the 3:00 hard cap — formerly a separate "Script v2 Sanity Check" page, now merged in here). With changes, open this page after updating it.
- **Plain English Review** (`plain-english.html`) — before/after: script jargon vs. layman's terms, for the script — mention issues and fixes.
- **Script Review** (`script-review.html`) — full-argument rewrite pass, all arguments cherry-picked. *(Referenced in nav; page not yet created.)* Make sure the objectives and results are reached and there is value for the audience.

### ✨ Create
- **Journal** (`journal.html`) — dated decision log for this project.
- **Retro** (`retro.html`) — this project's — or a previous project's — own retrospective: hypothesis verdict and what to change next time.
- **Maturity** (`maturity.html`) — cross-project institutional learning: lessons pulled from *past* projects on this channel (distinct from Retro, which is this project's own). Currently placeholder lesson cards.
- **Pre Production Plan** (`todo.html`) — the full task board (also surfaced as "✅ Tasks"), source of the XP/level numbers shown in the nav bar.
- Plus quick links to Canva, YouTube Studio, and grouped external tools (deployment, data/storage, production, research, community).

**Analysis vs. Evaluate:** Analysis pages are static reporting/reference —
they describe the state of *this* video and don't need re-checking on
every edit. Evaluate pages are the working loop — re-run them every time
you touch the project; Confidence Check in particular is meant to be the
single number you check on every pass. When a change touches Evaluate
data (task status, script, sanity checks), open the affected Evaluate
page(s) in Chrome after applying the change so the updated score/report
is visible immediately.

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
