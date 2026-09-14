# Weekly Checklist — Task Decomposition (video_id: 38080b26)

Each day names the page to fill in, the `seed-content.js` section that
backs it, and the re-seed command. Every field seeded so far is a `TODO:`
placeholder — this checklist is what replaces them with the real video.

## Mon — Unknowns + Research
- **Page:** `html/unknowns.html`
- **Do:** write the 3 Stage 0 questions for real (prior belief + falsifier
  per question), then click **Lock snapshot** on each.
- **Then:** start `html/index.html` (Research) — source links, pro/con
  video table, footage leads. Use the "🔗 Link to Unknowns…" picker on
  each source to tie it back to the question it speaks to.
- **Edit:** `unknownsBlocks` and `indexBlocks` in `supabase/seed-content.js`.
- **Re-seed:** `node supabase/seed-content.js`

## Tue — Arguments
- **Page:** `html/arguments.html`
- **Do:** premise, arguments, conclusion, sanity-check. Tick **📓 This is
  a decision** on every per-item note where you cut, keep, or change an
  argument — it's what populates the Journal.
- **Edit:** `argumentsBlocks` in `supabase/seed-content.js`.
- **Re-seed:** `node supabase/seed-content.js`

## Wed — Script + VO
- **Page:** `html/script.html`
- **Do:** write the real beats — **hard cap ~450 words / 3:00** for this
  course module. Confirm the hook states the module's objective (understand
  Task Decomposition and learn Multi-Step Reasoning Strategies) and the
  close points at the audience deliverable. Generate/save Kokoro VO.
- **Edit:** `scriptBlocks` in `supabase/seed-content.js`.
- **Re-seed:** `node supabase/seed-content.js`

## Thu — Design + Previs
- **Pages:** `html/design.html`, `html/previsualisation.html`
- **Do:** lock palette/typography/pacing against the real script beats,
  then board all 9 shots. Confirm the previs intro block ties to "use in
  real life in a meaningful manner."
- **Edit:** `designBlocks`, `previsBlocks` in `supabase/seed-content.js`.
  Replace `images/panel_1.jpg`–`panel_9.jpg` (currently reused template
  placeholders) with real frames.
- **Re-seed:** `node supabase/seed-content.js`

## Fri — Assets + deliverable + edit handoff
- **Page:** `html/assets.html`
- **Do:** finalize the audience-deliverable card (replace the default
  "this repo" row once a real repo/prompt/checklist/template exists) and
  the real-life-application card. Confirm every B-roll item is sourced.
- **Edit:** `assetItems` in `supabase/seed-content.js`, and
  `videos.audience_deliverable` in `supabase/seed.js`.
- **Re-seed:** `node supabase/seed.js && node supabase/seed-content.js`

## Sat/Sun — Publish
- `npx wrangler deploy`, confirm the Workers URL, set `videos.status =
  'published'` yourself (nothing in the app does this automatically), then
  publish.

## +7 days — Retro
- **Page:** `html/retro.html`
- **Do:** fill the verdict (held/partly/failed), retention note, CTR, avg
  view duration, top comment questions, what you'd change. Saving shows
  the verdict banner on Unknowns and Journal.
- **Then:** go back to `html/unknowns.html` and update each question's
  `status` (answered / changed-my-mind / still-open) and `answer`.
- **Then:** `html/journal.html` — write the real Formula (reusable rule +
  symbol + evidence) so future modules can find it in the cross-video
  library.
