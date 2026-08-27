#!/usr/bin/env node
// scripts/build.js
// ─────────────────────────────────────────────────────────────────────────────
// Reads SUPABASE_URL and SUPABASE_ANON_KEY from:
//   1. .env file (local development)
//   2. process.env (Vercel / CI environment variables)
//
// Injects them as a window.AppConfig inline <script> block into all HTML files
// that contain the <!-- @inject-config --> placeholder.
//
// Usage:
//   Local dev:  node scripts/build.js   (reads .env)
//   Vercel:     runs automatically via "buildCommand" in vercel.json
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

// ── 1. Load .env (local only, no dependencies needed) ────────────────────────
function parseDotEnv(filepath) {
  if (!fs.existsSync(filepath)) return;
  const lines = fs.readFileSync(filepath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val   = line.slice(eq + 1).trim();
    // Strip surrounding quotes (single or double)
    if (/^["']/.test(val) && val[0] === val[val.length - 1]) {
      val = val.slice(1, -1);
    }
    // Don't override values already set in process.env (Vercel / CI)
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = val;
    }
  }
}

parseDotEnv(path.resolve(__dirname, '../.env'));

// ── 2. Read credentials ───────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.SUPABASE_URL      || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('\n[build] WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is not set.');
  console.warn('[build]   Copy .env.example -> .env and fill in your Supabase values.');
  console.warn('[build]   Analytics will be disabled until credentials are provided.\n');
}

// ── 3. Build the inline <script> block ───────────────────────────────────────
const PLACEHOLDER = '<!-- @inject-config -->';

const inlineScript = `<script>
    /* Auto-injected by scripts/build.js from environment variables.
       Do NOT add real credentials here - use .env (local) or
       Vercel Environment Variables (production) instead. */
    window.AppConfig = {
      SUPABASE_URL:      '${SUPABASE_URL.replace(/'/g, "\\'")}',
      SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY.replace(/'/g, "\\'")}'
    };
  </script>`;

// ── 4. Inject into HTML files ─────────────────────────────────────────────────
const HTML_FILES = [
  'index.html',
  'pages/project-report.html',
  'pages/admin.html',
  'pages/404.html',
];

let updated = 0;
for (const relPath of HTML_FILES) {
  const absPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`[build] Skipping ${relPath} (file not found)`);
    continue;
  }

  let content = fs.readFileSync(absPath, 'utf8');

  if (!content.includes(PLACEHOLDER)) {
    console.log(`[build] ${relPath} - no placeholder found, skipping`);
    continue;
  }

  content = content.replace(PLACEHOLDER, inlineScript);
  fs.writeFileSync(absPath, content, 'utf8');
  console.log(`[build] ${relPath} - config injected`);
  updated++;
}

console.log(`\n[build] Done. ${updated}/${HTML_FILES.length} file(s) updated.`);
if (updated === 0 && HTML_FILES.length > 0) {
  console.log('[build] Tip: add <!-- @inject-config --> to your HTML files where AppConfig should be injected.');
}
