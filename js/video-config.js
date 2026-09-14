// This video's row key in the SHARED videos table — every query/write in
// content-db.js, notes.js, ratings.js, assets.js, audio-clips.js and
// links.js filters/inserts by this id so this project never touches
// another video's rows in the shared Supabase project.
window.VIDEO_ID = '38080b26';
