# 🧭 Menu Specification

Specification for the shared top navigation bar rendered by `js/nav.js`
(`Nav.render(currentId)`) on every page. One file, one menu — every page
stays in sync automatically. See [Related specs](#related-specs) for how
this fits into the rest of the project's documentation.

---

## 1. Layout

```
🧠 Task Decomposition · Course Module   🧠 Remember ▾  💡 Understand ▾
                                📊 Analysis ▾  ⚖️ Evaluate ▾  ✨ Create ▾
                                        🔎 Search ⌘K  ⭐ Lvl N badge  🎨 Theme ▾  🌐 Live
[ ▓▓▓▓▓▓▓▓░░░░░░░░░░ ]  ← nav-xp-bar (production progress, done/in-progress)
```

- Left: brand link (`index.html`).
- Center-left: five top-level menu buttons, each a collapsible
  `<details>`-style dropdown panel (`menu-toggle` + `menu-panel`), with its
  own accent color from `MENU_COLORS`.
- Right: the single Search entry point, the gamified level badge, the
  🎨 Theme picker, and a `🌐 Live` link to the current page's Cloudflare
  Workers equivalent — Theme sits directly next to Live. Search lives only
  here now — the previous copy duplicated inside the center row was a
  leftover `id="nav-search-wrap"` clash and has been removed.
- Bottom: an XP progress bar reflecting production-plan completion.
- A separate bottom-of-viewport bar (`renderBottomBar`) lists any tasks
  currently `in progress`, independent of the top nav.

## 2. Top-level menus

| Menu | Color | Contents |
|---|---|---|
| 🧠 Remember | `#5ab0ff` | Research, Arguments — source-gathering pages |
| 💡 Understand | `#4bcfa1` | Script, Design, Previsualisation — synthesis pages |
| 📊 Analysis | `#b388ff` | **Reports:** About this video, Sanity Check Report, Task Report |
| ⚖️ Evaluate | `#ffab40` | **Comparisons:** Assets, Plain English Review |
| ✨ Create | `#ff5252` | Canva Workshop, YouTube Studio, **+ ✅ Tasks and the 6 tool groups** (see §3) |

🔎 Search is not a dropdown menu — it's a command-palette modal, kept as
its own entry point on the right (see §4).

The grouping (Remember/Understand/Analysis/Evaluate/Create) is a
*cognitive* grouping layered on top of the 7-stage pipeline defined in
`PROJECT_TEMPLATE_SPECS.md` §1 — it is not a new set of pages, just a
different lens for reaching the same `html/*.html` files. `todo.html`
(Production Plan) is deliberately excluded from Remember/Understand and
surfaced only as "✅ Tasks" inside ✨ Create.

### Pages by menu (`PAGES` array)

**Remember**

| id | emoji | label | file |
|---|---|---|---|
| research | 🔍 | Research | `index.html` |
| arguments | 🧩 | Arguments | `arguments.html` |

**Understand**

| id | emoji | label | file |
|---|---|---|---|
| script | 📝 | Script | `script.html` |
| design | 🎨 | Design | `design.html` |
| previsualisation | 🎞️ | Previsualisation | `previsualisation.html` |

**Analysis — Reports** *(not in `PAGES`; see note below)*

- `about.html` — About this video
- `sanity-check.html` — Sanity Check Report
- `task-report.html` — Task Report

**Evaluate — Comparisons**

| id | emoji | label | file |
|---|---|---|---|
| assets | 🗂️ | Assets | `assets.html` |

- `plain-english.html` — Plain English Review *(not in `PAGES`)*

**Create → Tasks**

| id | emoji | label | file |
|---|---|---|---|
| todo | ✅ | Production Plan | `todo.html` |

Non-pipeline pages (`about.html`, `sanity-check.html`, `task-report.html`,
`plain-english.html`) live only inside Analysis/Evaluate — they are not in
`PAGES` and are not indexed by the search palette's page results, but
**are** reachable and highlighted as `active` via `currentId` checks.

## 3. ✨ Create → Tools groups (`TOOL_GROUPS`)

✨ Create's dropdown holds, in order: **➕ Create Task** (a deep link to
`todo.html?newTask=1`), the two static Create links (Canva Workshop,
YouTube Studio), then the ✅ Tasks group, then every `TOOL_GROUPS` entry —
each an independently-collapsible `<details open>` accordion. This folds
what used to be a separate top-level 🧰 Tools menu into Create, so Create
is now the single place to reach both making things and the tools that
support making them.

**➕ Create Task** is the one item that isn't just a link: `todo.html`
checks `location.search` for `newTask=1` on load, immediately opens its
existing `#new-task-popover` (the same one behind the page's own
"➕ New Task" button), and then strips the query param via
`history.replaceState` so a refresh doesn't reopen it. This gives every
page a one-click path to add a Production Plan task without hand-copying
the popover markup elsewhere — the popover and its `addCustomTask` logic
stay owned by `todo.html`.

1. 🚀 **Deployment** — Cloudflare Worker Live, GitHub Pages, GitHub Repo
2. 🗄️ **Data & Storage** — Supabase Dashboard, Supabase Table Editor,
   Azure Portal, Azure Container, **Second Brain Server**
   (`http://localhost:30080/` — must be running before opening any local
   page, per the project's [Local-preview workflow](#related-specs)),
   Second Brain sample note
3. 🎬 **Production Tools** — Google Flow, Kokoro Voices, Canva Design
4. 🔬 **Research** — Gemini research thread, Grok, YouTube, The Economist
5. 👥 **Community** — Skool, Course
6. 🧰 **Browser Utilities** — Tab to Top extension

Adding/removing a tool means editing one entry in `TOOL_GROUPS` in
`js/nav.js` — it automatically appears in both the Create dropdown *and*
the search index (§4). Being on `todo.html` (or any in-progress Tasks
item) now highlights the ✨ Create button as active, since Tasks lives
inside it.

## 4. 🔎 Search (command palette)

- Opens as a centered modal (`⌘K`/`Ctrl+K` from anywhere, or the single
  Search button on the right), not an anchored dropdown.
- Index is three sources merged at load time:
  1. `pageIndex` — the 7 `PAGES` entries (`kind: 'page'`)
  2. `toolIndex` — every tool inside `TOOL_GROUPS` (`kind: 'tool'`)
  3. `contentIndex` — every row in Supabase's `content_blocks` table
     (`kind: 'content'`), fetched once via `window.sb` and labeled by
     `data.title`/`fullTitle`/`num` — this is what makes the search box
     cover arguments, research notes, script beats, design specs, and
     shot panels without any of that content being hardcoded here.
- Ranking: title match on a page/tool (0) beats title match on content
  (1) beats a match buried only in a content block's body (2); top 10
  shown.
- Empty-query state shows up to 5 "Recent" picks (persisted to
  `localStorage['navSearchRecent']`) plus a "Jump to a page" list of all
  7 pipeline pages.
- Arrow keys navigate, Enter opens and records to Recent, Escape/outside
  click/✕ closes.

## 5. Gamified badge + bottom bar

- `getGamifiedStats()` derives level/rank/XP from `window.PRODUCTION_PLAN`
  (11 stages, each a list of tasks with `status: done|progress|todo`),
  merged with any per-task `localStorage['todoStatusOverrides']` and
  `localStorage['todoCustomTasks']` set on `todo.html`.
- The top-nav badge (`⭐ Lvl N`) and `nav-xp-bar` reflect this everywhere;
  `todo.html` is the only page that can change it.
- `renderBottomBar()` renders a separate fixed bar at the bottom of every
  page listing tasks currently `progress`, with a click-through modal to
  mark done / revert / jump to Production Plan.

## 6. 🎨 Theme picker

- Owned by `js/theme.js`, not `js/nav.js` — but it mounts *into* a nav
  slot rather than floating on its own. `Nav.render()` leaves an empty
  `<div class="menu-wrap" id="nav-theme-wrap"></div>` right before the
  `🌐 Live` link; on `DOMContentLoaded`, `theme.js` finds that slot and
  builds a `.menu-toggle` + `.menu-panel` pair into it, reusing the same
  dropdown look as every other nav menu (open/close on click, close on
  outside click or Escape, closes sibling menus when opened).
- The toggle's label always shows the active theme's emoji (`🌑 Theme`,
  `🌊 Theme`, …), refreshed on every pick.
- Picking a theme calls `Theme.apply(id)` (sets `data-theme` on `<html>`
  and fires a `themechange` event) and `Theme.save(id)` (persists to both
  `localStorage` and a 365-day cookie so the choice survives across pages
  and repeat visits) — unchanged from before this move, only *where* the
  control lives changed.
- Previously this was a floating circular button fixed to the
  bottom-right corner of the viewport, independent of the nav bar, and it
  was missing entirely from `sanity-check.html`, `task-report.html`, and
  `todo.html` (no `<script src="../js/theme.js">` tag). All three now
  include it, so the picker is present in the nav on every page.

## 7. Editing rule

**Only edit `js/nav.js`.** Never hand-copy nav markup into an `html/*.html`
file — every page renders it from `PAGES` / `TOOL_GROUPS` /
`PRODUCTION_PLAN` via `Nav.render(currentId)` on a `#nav-mount` element,
which is exactly what keeps all pages in sync (see the file's own header
comment, `js/nav.js:1-7`). The one exception is the theme picker (§6),
which mounts into a slot nav.js reserves for it but is built by
`js/theme.js` so theme data/logic stays in one place.

---

## Related specs

- **[`PROJECT_TEMPLATE_SPECS.md`](PROJECT_TEMPLATE_SPECS.md)** — the
  architecture this menu sits on top of: the 7-stage `html/` pipeline
  (§1), the `content_blocks` table this menu's search indexes live-content
  from (§2), and the local-preview command (`python3 -m http.server 30080`)
  that the Create → Data & Storage → Second Brain Server entry assumes is
  already running (§3 step 5, and this repo's `CLAUDE.md`).
- **[`README.md`](README.md)** — the canonical live URLs this menu's
  🌐 Live link and Create → Deployment tool group point to, and confirms
  content (not nav structure) lives in Supabase.
- **[`REPORT.md`](REPORT.md)** — migration history explaining *why*
  assets/notes/ratings moved to Supabase tables that back the Evaluate →
  Assets page and the search palette's content index.
