-- Schema for the "Job Apocalypse" pre-production site.
-- Replaces localStorage/cookie-based storage in assets.js, notes.js,
-- ratings.js and links.js with Supabase Postgres tables.
--
-- Single-user tool (no auth system in the app), so RLS is enabled with
-- permissive anon policies scoped to the anon/public API key. Run with:
--   node supabase/apply-schema.js

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- videos: catalog of video production projects (multi-video support)
-- ---------------------------------------------------------------------
create table if not exists public.videos (
  id          text primary key,          -- e.g. "sep-1-future-of-jobs"
  title       text not null default '',
  description text not null default '',
  slug        text not null default '',
  status      text not null default 'draft', -- draft, production, review, published
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- assets: items saved via the "Add to Assets" buttons across pages
-- ---------------------------------------------------------------------
create table if not exists public.assets (
  id          text primary key,          -- matches data-id on .add-asset-btn
  type        text not null default 'item',
  title       text not null default '',
  description text not null default '',
  source      text not null default '',
  url         text not null default '',
  comment     text not null default '',
  added_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- notes: free-form notes for the "Video Production Agent" bar
-- ---------------------------------------------------------------------
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  page       text not null,              -- e.g. index.html, script.html
  text       text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- item_notes: one note per catalog item (id -> text)
-- ---------------------------------------------------------------------
create table if not exists public.item_notes (
  id         text primary key,           -- catalog item id
  text       text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ratings: 1-5 star rating per catalog item
-- ---------------------------------------------------------------------
create table if not exists public.ratings (
  id         text primary key,           -- catalog item id
  stars      smallint not null check (stars between 0 and 5),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- links: cross-stage links between catalog items
--   key = "<sourceFile>|<itemId>", linked_ids = array of linked item ids
-- ---------------------------------------------------------------------
create table if not exists public.links (
  key        text primary key,
  linked_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- content_blocks: the hand-authored production content that used to be
-- static markup on each page (source links, arguments, script beats,
-- design specs, shot-board panels). One row per card/row/panel; `data`
-- holds whatever fields that block type needs, so each page's renderer
-- interprets `type` to build the same markup that used to be hardcoded.
--   page    = html filename, e.g. "index.html"
--   section = the section id within the page, e.g. "source-links"
--   type    = block type, e.g. "link-card", "argument", "beat", "shot"
-- ---------------------------------------------------------------------
create table if not exists public.content_blocks (
  id         text primary key,           -- stable item id (matches previous data-id)
  page       text not null,
  section    text not null,
  position   integer not null default 0,
  type       text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists content_blocks_page_section_idx
  on public.content_blocks (page, section, position);

-- ---------------------------------------------------------------------
-- audio_clips: manifest of Kokoro voice-over audio saved to Azure Blob
-- Storage, so the app knows what's already backed up without depending
-- solely on per-browser IndexedDB. blob_path excludes the SAS query
-- string (that's a short-lived credential, not something to persist) —
-- it's re-joined with whatever SAS URL is currently configured.
--   id = "<page>|<card_id>|<voice>|<speed>"
-- ---------------------------------------------------------------------
create table if not exists public.audio_clips (
  id         text primary key,
  page       text not null,
  card_id    text not null,
  voice      text not null,
  speed      text not null,
  blob_path  text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security: public tool, no auth, anon key does everything.
-- ---------------------------------------------------------------------
alter table public.videos         enable row level security;
alter table public.assets         enable row level security;
alter table public.notes          enable row level security;
alter table public.item_notes     enable row level security;
alter table public.ratings        enable row level security;
alter table public.links          enable row level security;
alter table public.content_blocks enable row level security;
alter table public.audio_clips    enable row level security;

drop policy if exists "anon full access" on public.videos;
create policy "anon full access" on public.videos
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.assets;
create policy "anon full access" on public.assets
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.notes;
create policy "anon full access" on public.notes
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.item_notes;
create policy "anon full access" on public.item_notes
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.ratings;
create policy "anon full access" on public.ratings
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.links;
create policy "anon full access" on public.links
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.content_blocks;
create policy "anon full access" on public.content_blocks
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.audio_clips;
create policy "anon full access" on public.audio_clips
  for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- v2: multi-video scoping + learning-loop stages (additive only —
-- existing shared tables are never dropped/rewritten; pre-existing rows
-- from before this migration are backfilled to their original video's
-- id in supabase/migrate-v2.js, not here, since that value is data, not
-- schema).
-- ---------------------------------------------------------------------

alter table public.videos add column if not exists video_type text;
alter table public.videos add column if not exists viewer_takeaway text;
alter table public.videos add column if not exists audience_deliverable jsonb;
alter table public.videos add column if not exists published_at timestamptz;

alter table public.content_blocks add column if not exists video_id text;
alter table public.assets         add column if not exists video_id text;
alter table public.notes          add column if not exists video_id text;
alter table public.item_notes     add column if not exists video_id text;
alter table public.item_notes     add column if not exists decision boolean not null default false;
alter table public.ratings        add column if not exists video_id text;
alter table public.audio_clips    add column if not exists video_id text;
alter table public.links          add column if not exists video_id text;

create index if not exists content_blocks_video_id_idx on public.content_blocks (video_id);
create index if not exists assets_video_id_idx         on public.assets (video_id);
create index if not exists notes_video_id_idx           on public.notes (video_id);
create index if not exists item_notes_video_id_idx      on public.item_notes (video_id);
create index if not exists ratings_video_id_idx         on public.ratings (video_id);
create index if not exists audio_clips_video_id_idx     on public.audio_clips (video_id);
create index if not exists links_video_id_idx           on public.links (video_id);

-- ---------------------------------------------------------------------
-- retros: post-publish testing stage (Stage 9) — one row per video,
-- created on first save.
-- ---------------------------------------------------------------------
create table if not exists public.retros (
  video_id              text primary key,
  hypothesis_verdict    text,              -- held | partly | failed
  retention_note        text not null default '',
  ctr                   text not null default '',
  avg_view_duration_s   integer,
  top_comment_questions jsonb not null default '[]'::jsonb,
  source_comparison     text not null default '', -- weekly-video only
  what_id_change        text not null default '',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- patterns: one reusable Formula per video, extracted at Journal/Retro
-- time. Read cross-video (the "Formulas from other videos" library);
-- written only for the current video_id.
-- ---------------------------------------------------------------------
create table if not exists public.patterns (
  id         uuid primary key default gen_random_uuid(),
  video_id   text not null,
  formula    text not null default '',   -- one-sentence reusable rule
  symbol     text not null default '',   -- short mnemonic / name
  evidence   text not null default '',   -- which retro field supports it
  created_at timestamptz not null default now()
);

create index if not exists patterns_video_id_idx on public.patterns (video_id);

alter table public.retros   enable row level security;
alter table public.patterns enable row level security;

drop policy if exists "anon full access" on public.retros;
create policy "anon full access" on public.retros
  for all using (true) with check (true);

drop policy if exists "anon full access" on public.patterns;
create policy "anon full access" on public.patterns
  for all using (true) with check (true);
