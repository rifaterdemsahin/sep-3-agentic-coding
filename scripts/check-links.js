#!/usr/bin/env node

/**
 * 🔗 Link Checker & Test Suite — sep-3-agentic-coding
 * Scans HTML, JS, and Markdown files for internal, external, and live deployment links.
 * Tests route resolution, status codes, and edge-redirect patterns.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT_DIR, 'html');
const JS_DIR = path.join(ROOT_DIR, 'js');

const WORKER_BASE = 'https://sep-3-agentic-coding.polished-boat-17b2.workers.dev';
const GITHUB_PAGES_BASE = 'https://rifaterdemsahin.github.io/sep-3-agentic-coding';

const EXPECTED_PAGES = [
  'index.html',
  'arguments.html',
  'script.html',
  'design.html',
  'previsualisation.html',
  'assets.html',
  'todo.html'
];

// Helper to fetch URL headers with redirects followed
function checkUrl(targetUrl, maxRedirects = 4) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.request(
        targetUrl,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (LinkValidator/1.0; sep-3-agentic-coding)'
          },
          timeout: 8000
        },
        (res) => {
          const status = res.statusCode;
          if (
            (status === 301 || status === 302 || status === 307 || status === 308) &&
            res.headers.location &&
            maxRedirects > 0
          ) {
            let nextUrl = res.headers.location;
            if (nextUrl.startsWith('/')) {
              nextUrl = parsed.origin + nextUrl;
            }
            res.resume();
            return checkUrl(nextUrl, maxRedirects - 1).then((r) => {
              resolve({
                url: targetUrl,
                status: r.status,
                finalUrl: r.finalUrl || nextUrl,
                redirected: true,
                ok: r.ok
              });
            });
          }
          res.resume();
          resolve({
            url: targetUrl,
            status,
            ok: status >= 200 && status < 400
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ url: targetUrl, status: 'TIMEOUT', ok: false });
      });

      req.on('error', (err) => {
        resolve({ url: targetUrl, status: err.code || 'ERR', ok: false, error: err.message });
      });

      req.end();
    } catch (err) {
      resolve({ url: targetUrl, status: 'INVALID_URL', ok: false, error: err.message });
    }
  });
}

async function runTests() {
  console.log('🔍 Starting Link Verification & Live Route Test Suite...\n');
  let failures = 0;
  let passes = 0;

  // 1. Verify Local Files Existence
  console.log('📁 [1/4] Checking local project assets & page files...');
  for (const p of EXPECTED_PAGES) {
    const fullPath = path.join(HTML_DIR, p);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ Local file exists: html/${p}`);
      passes++;
    } else {
      console.log(`  ❌ Missing local file: html/${p}`);
      failures++;
    }
  }

  // Check local assets
  const requiredLocalAssets = [
    'css/shared.css',
    'js/nav.js',
    'js/supabase-client.js',
    'js/notes.js',
    'images/panel_1.jpg',
    'images/panel_9.jpg'
  ];
  for (const a of requiredLocalAssets) {
    const fullPath = path.join(ROOT_DIR, a);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ Local asset exists: ${a}`);
      passes++;
    } else {
      console.log(`  ❌ Missing local asset: ${a}`);
      failures++;
    }
  }

  // 2. Test Cloudflare Worker Edge Live Routes
  console.log('\n⚡ [2/4] Testing Cloudflare Worker Edge deployment routes...');
  for (const p of EXPECTED_PAGES) {
    const url = `${WORKER_BASE}/html/${p}`;
    process.stdout.write(`  ⏳ Testing ${url}... `);
    const res = await checkUrl(url);
    if (res.ok) {
      console.log(`✅ [${res.status}] OK`);
      passes++;
    } else {
      console.log(`❌ [${res.status}] FAILED ${res.error || ''}`);
      failures++;
    }
  }

  // Test root worker route
  process.stdout.write(`  ⏳ Testing ${WORKER_BASE}/... `);
  const rootRes = await checkUrl(`${WORKER_BASE}/`);
  if (rootRes.ok) {
    console.log(`✅ [${rootRes.status}] OK`);
    passes++;
  } else {
    console.log(`⚠️ [${rootRes.status}] (Check root redirect or index)`);
  }

  // 3. Test GitHub Pages -> Worker Forwarding Logic
  console.log('\n🐙 [3/4] Verifying GitHub Pages forwarding script in HTML files...');
  const htmlFiles = fs.readdirSync(HTML_DIR).filter((f) => f.endsWith('.html'));
  for (const f of htmlFiles) {
    const content = fs.readFileSync(path.join(HTML_DIR, f), 'utf8');
    const hasGitHubCheck = content.includes("location.hostname.endsWith('github.io')");
    const hasSubpathStrip = content.includes("replace(/^\\/[^/]+/, '')") || content.includes("replace(/^\\/sep-3-agentic-coding/, '')");
    const hasDirectWorkerUrl = content.includes(WORKER_BASE);

    if (hasGitHubCheck && hasDirectWorkerUrl && hasSubpathStrip) {
      console.log(`  ✅ html/${f}: Forwarding snippet correctly cleans GitHub repo subpath`);
      passes++;
    } else if (hasGitHubCheck && hasDirectWorkerUrl && !hasSubpathStrip) {
      console.log(`  ❌ html/${f}: Forwarding snippet is MISSING subpath strip! (Will cause 404 on Worker)`);
      failures++;
    } else {
      console.log(`  ⚠️ html/${f}: No forwarding script found`);
    }
  }

  // 4. Test Key External & Tool Endpoints
  console.log('\n🌐 [4/4] Testing key external tools and reference links...');
  const externalLinks = [
    { name: 'GitHub Repo', url: 'https://github.com/rifaterdemsahin/sep-3-agentic-coding' },
    { name: 'YouTube Premise Source', url: 'https://www.youtube.com/watch?v=R2meHtrO1n8' },
    { name: 'Layman Terms Reference', url: 'https://www.youtube.com/watch?v=zU_H8mcFqpQ' },
    { name: 'Kokoro Voices Service', url: 'https://secondbrain-kokoro.fly.dev/voices' }
  ];

  for (const link of externalLinks) {
    process.stdout.write(`  ⏳ Testing ${link.name} (${link.url})... `);
    const res = await checkUrl(link.url);
    if (res.ok) {
      console.log(`✅ [${res.status}] OK`);
      passes++;
    } else {
      console.log(`⚠️ [${res.status}] ${res.error || 'Check connectivity'}`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`📊 Test Results: ${passes} passed, ${failures} failed.`);
  if (failures > 0) {
    console.log(`❌ Fixes needed! Run 'node scripts/fix-links.js' to auto-repair routes.`);
    process.exit(1);
  } else {
    console.log(`✨ All critical deployment and route links are verified and operational!`);
    process.exit(0);
  }
}

runTests();
