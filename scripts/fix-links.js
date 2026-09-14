#!/usr/bin/env node

/**
 * 🛠️ Link Fixer & Route Repair Engine — sep-3-agentic-coding
 * Automatically fixes:
 * 1. GitHub Pages -> Cloudflare Workers forwarding snippet in all HTML files.
 * 2. LIVE_BASE canonical link in js/nav.js.
 * 3. Root index.html redirect for root domain hits.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT_DIR, 'html');
const JS_DIR = path.join(ROOT_DIR, 'js');

const WORKER_BASE = 'https://sep-3-agentic-coding.polished-boat-17b2.workers.dev';

const CANONICAL_REDIRECT_SNIPPET = `<script>
  // Canonical host is Cloudflare Workers; GitHub Pages forwards visitors with repo subpath cleaned.
  if(location.hostname.endsWith('github.io')){
    var cleanPath = location.pathname.replace(/^\\/sep-3-agentic-coding/, '').replace(/^\\/[^/]+(?=\\/html\\/)/, '');
    if(!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    location.replace('${WORKER_BASE}' + cleanPath + location.search + location.hash);
  }
</script>`;

function fixHtmlFiles() {
  console.log('🔧 [1/3] Repairing GitHub Pages -> Worker forwarding snippet in HTML files...');
  const files = fs.readdirSync(HTML_DIR).filter((f) => f.endsWith('.html'));

  files.forEach((f) => {
    const filePath = path.join(HTML_DIR, f);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace any legacy redirect script blocks
    const legacyPattern = /<script>[\s\S]*?if\s*\(\s*location\.hostname\.endsWith\(['"]github\.io['"]\)[\s\S]*?<\/script>/;

    if (legacyPattern.test(content)) {
      content = content.replace(legacyPattern, CANONICAL_REDIRECT_SNIPPET);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Repaired redirect script in html/${f}`);
    } else {
      // If no redirect script, insert after <head>
      if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>\n${CANONICAL_REDIRECT_SNIPPET}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Injected redirect script in html/${f}`);
      }
    }
  });
}

function fixNavJs() {
  console.log('\n🔧 [2/3] Setting canonical LIVE_BASE in js/nav.js...');
  const navPath = path.join(JS_DIR, 'nav.js');
  if (fs.existsSync(navPath)) {
    let content = fs.readFileSync(navPath, 'utf8');
    const legacyLiveBase = /var LIVE_BASE = ['"][^'"]+['"];/;
    const targetLiveBase = `var LIVE_BASE = '${WORKER_BASE}/html/';`;

    if (legacyLiveBase.test(content)) {
      content = content.replace(legacyLiveBase, targetLiveBase);
      fs.writeFileSync(navPath, content, 'utf8');
      console.log(`  ✅ Updated LIVE_BASE -> ${WORKER_BASE}/html/ in js/nav.js`);
    } else {
      console.log(`  ℹ️ LIVE_BASE already matches target in js/nav.js`);
    }
  }
}

function fixRootIndex() {
  console.log('\n🔧 [3/3] Creating / updating root index.html forwarder...');
  const rootIndexPath = path.join(ROOT_DIR, 'index.html');
  const rootIndexContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=html/index.html">
<title>Job Apocalypse · Debunked</title>
<script>
  var cleanPath = location.pathname.replace(/^\\/sep-3-agentic-coding/, '');
  if(!cleanPath || cleanPath === '/') cleanPath = '/html/index.html';
  if(location.hostname.endsWith('github.io')){
    location.replace('${WORKER_BASE}' + cleanPath + location.search + location.hash);
  } else {
    location.replace('html/index.html' + location.search + location.hash);
  }
</script>
</head>
<body>
  <p>Redirecting to <a href="html/index.html">Job Apocalypse · Debunked</a>...</p>
</body>
</html>
`;
  fs.writeFileSync(rootIndexPath, rootIndexContent, 'utf8');
  console.log(`  ✅ Wrote root index.html redirect forwarder`);
}

function runFix() {
  console.log('🚀 Executing Link Repair & Canonical Route Sync...\n');
  fixHtmlFiles();
  fixNavJs();
  fixRootIndex();
  console.log('\n✨ Link repairs complete! Run "node scripts/check-links.js" to verify.');
}

runFix();
