# Project workflow

This is a static HTML site (9 pipeline pages under `html/` — Unknowns,
Research (`index.html`), Arguments, Script, Design, Previsualisation,
Production Plan (`todo.html`), Journal, Retro — plus a set of secondary
Analysis/Evaluate/Create pages; JS in `js/`, shared CSS in
`css/shared.css`) for pre-production notes on the **"Task Decomposition"**
course module (3-minute hard cap). No build step. Root `index.html` is
just a redirect stub into `html/unknowns.html`/`html/index.html`.

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
- **Sanity Check Report** (`sanity-check.html`) — automated verification of project links, tasks, and data integrity.
- **Task Report** (`task-report.html`) — production-plan progress by stage with recommended focus.
- **Script v2 Sanity Check** (`script-v2-report.html`) — length audit & trim recommendations. *(Referenced in nav; page not yet created.)*

### ⚖️ Evaluate (updates every version/iteration — re-run these each time you revise the content)
- **Confidence Check** (`confidence_check.html`) — one live score for the whole project, computed from Production Plan task completion via `Nav.getGamifiedStats()`. Check this every time you're working on the project.
- **Plain English Review** (`plain-english.html`) — before/after: script jargon vs. layman's terms.
- **Script Review** (`script-review.html`) — full-argument rewrite pass, all 22 arguments cherry-picked. *(Referenced in nav; page not yet created.)*

### ✨ Create
- **Journal** (`journal.html`) — dated decision log for this project.
- **Retro** (`retro.html`) — this project's own retrospective: hypothesis verdict and what to change next time.
- **Maturity** (`maturity.html`) — cross-project institutional learning: lessons pulled from *past* projects on this channel (distinct from Retro, which is this project's own). Currently placeholder lesson cards.
- **Production Plan** (`todo.html`) — the full task board (also surfaced as "✅ Tasks"), source of the XP/level numbers shown in the nav bar.
- Plus quick links to Canva, YouTube Studio, and grouped external tools (deployment, data/storage, production, research, community).

**Analysis vs. Evaluate:** Analysis pages are static reporting/reference —
they describe the state of *this* video and don't need re-checking on
every edit. Evaluate pages are the working loop — re-run them every time
you touch the project; Confidence Check in particular is meant to be the
single number you check on every pass.

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
