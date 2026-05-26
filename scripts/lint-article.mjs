#!/usr/bin/env node
/**
 * Pre-publish lint for auto-generated daily articles.
 *
 * Checks (any failing → exit 1, GITHUB_OUTPUT passed=false):
 *   • frontmatter structure
 *   • category in schema enum
 *   • H2 count
 *   • ≥2 inline CTAs
 *   • ≥1 source-list (上映ガイドのみ)
 *   • ≥3 source-list URLs (上映ガイドのみ)
 *   • forbidden phrases (誇大広告 / 規約違反系)
 *   • body length 2,500-5,500 visible chars
 *   • no recent duplicate (same slug stem in last 14 days)
 *
 * Usage:
 *   node scripts/lint-article.mjs <path-to-md>
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const filepath = process.argv[2];
if (!filepath) {
  console.error('usage: lint-article.mjs <path>');
  process.exit(1);
}

const ROOT = path.resolve(import.meta.dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');

const md = await fs.readFile(filepath, 'utf8');

const VALID_CATEGORIES = new Set([
  '利用ガイド',
  '上映ガイド',
  '推し活',
  'デート',
  'パーティー',
  '撮影',
  '比較',
  'お知らせ',
]);

// Forbidden phrases. If any appears, the article gates to draft PR for human review.
const FORBIDDEN = [
  // exaggerated claims (景品表示法対策)
  '最高の', '業界一', '日本一', 'No.1', 'No1', '世界一',
  '絶対に', '必ず', '100%', '完璧',
  // factually wrong about CINEMA REEL
  '完全防音', '防音性が高い', '防音性の高い',
  // contradicts spacemarket precautions
  '声出しは自由', '大声OK', '拍手OK', '叫びOK',
  '声を張り上げ', // "声を張り上げて" etc
  // unverified hard sell
  '今すぐ予約',
];

const issues = [];

// ─── Frontmatter parse ────────────────────────────────────────────────────
const fmMatch = md.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
if (!fmMatch) {
  issues.push('frontmatter --- block missing');
  await report(issues);
}
const frontmatter = fmMatch[1];
const body = fmMatch[2];

// Parse simple YAML key: value pairs (good enough for our schema)
const fmFields = {};
for (const line of frontmatter.split('\n')) {
  const m = line.match(/^(\w+):\s*(.*)$/);
  if (m) fmFields[m[1]] = m[2].trim();
}

// Required fields
for (const field of ['title', 'description', 'pubDate', 'category']) {
  if (!fmFields[field]) issues.push(`frontmatter missing: ${field}`);
}

// Category in enum
const rawCat = (fmFields.category || '').replace(/^"|"$/g, '');
if (!VALID_CATEGORIES.has(rawCat)) {
  issues.push(`category not in enum: "${rawCat}"`);
}

// Hero source: heroVideoId or heroImage (lifestyle articles can omit both,
// but flag for humans if neither — usually a sign we forgot)
const isWatchGuide = rawCat === '上映ガイド';
if (isWatchGuide && !fmFields.heroVideoId && !fmFields.heroImage) {
  issues.push('上映ガイド without heroVideoId or heroImage');
}

// ─── Structure checks ─────────────────────────────────────────────────────
const h2Count = (body.match(/^## /gm) || []).length;
const minH2 = isWatchGuide ? 5 : 5;
if (h2Count < minH2) {
  issues.push(`only ${h2Count} H2 sections (expected ≥${minH2})`);
}

const inlineCtaCount = (body.match(/<aside\s+class="post-cta-inline">/g) || []).length;
if (inlineCtaCount < 2) {
  issues.push(`only ${inlineCtaCount} inline CTAs (expected ≥2)`);
}

// Inline CTAs must point to "/" (homepage funnel), not the Spacemarket
// promo URL directly. The sticky bottom CTA + the post-cta aside in
// PostLayout handle the Spacemarket link globally; the in-article CTA's
// job is to land readers on the homepage where they get the full pitch.
const inlineCtaBlocks = body.match(/<aside\s+class="post-cta-inline">[\s\S]+?<\/aside>/g) || [];
for (const block of inlineCtaBlocks) {
  if (/href="https?:\/\/[^"]*spacemarket\.com/.test(block)) {
    issues.push('inline post-cta links to spacemarket directly (should be href="/")');
    break;
  }
  if (!/href="\/?"/.test(block) && !/href="\/#?[\w-]*"/.test(block)) {
    issues.push('inline post-cta href is not the homepage ("/")');
    break;
  }
}

// Visual richness gate: count iframes and figures. The minimum thresholds
// differ by category (上映ガイド relies on YouTube iframes + venue photos;
// lifestyle articles have DALL-E figures from the manifest).
const iframeCount = (body.match(/<div\s+class="video-embed">/g) || []).length;
const figureCount = (body.match(/<figure\b/g) || []).length;
const visualTotal = iframeCount + figureCount;

if (isWatchGuide) {
  const hasSourceList = /<div\s+class="source-list">/.test(body);
  if (!hasSourceList) {
    issues.push('上映ガイド without source-list');
  } else {
    const sourceListMatch = body.match(/<div\s+class="source-list">[\s\S]+?<\/div>/);
    const urlsInSourceList = (sourceListMatch?.[0].match(/href="https?:\/\/[^"]+"/g) || []).length;
    if (urlsInSourceList < 3) {
      issues.push(`source-list has only ${urlsInSourceList} URLs (expected ≥3)`);
    }
  }

  // 上映ガイドの視覚密度ルール:
  //   - iframe ≥ 1（最低 1 本の公式動画）
  //   - iframe + figure 合計 ≥ 3（venue photo の figure で補える）
  // 一般作品は iframe 3〜5 が普通、live broadcast は iframe 1〜2 + figure 2〜3 で
  // 視覚密度を確保するパターン。どちらも合計 3 以上で pass。
  if (iframeCount < 1) {
    issues.push('上映ガイド without any iframe embed — need ≥1 official YouTube video');
  }
  if (visualTotal < 3) {
    issues.push(`only ${visualTotal} visual elements (iframes + figures) — 上映ガイド needs ≥3 total`);
  }
} else {
  // Lifestyle / other categories: rely on figure-based DALL-E imagery.
  if (figureCount < 1 && iframeCount < 1) {
    issues.push('no visual elements (no <figure> and no iframe)');
  }
}

// ─── Forbidden phrase scan ────────────────────────────────────────────────
for (const phrase of FORBIDDEN) {
  if (body.includes(phrase)) {
    issues.push(`forbidden phrase: "${phrase}"`);
  }
}

// ─── Length check ─────────────────────────────────────────────────────────
const visibleBody = body
  .replace(/<[^>]+>/g, '')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
  .replace(/[#*_>`-]+/g, '')
  .replace(/https?:\/\/[^\s)]+/g, '')
  .replace(/\s+/g, '');
const charCount = [...visibleBody].length;
if (charCount < 2500) issues.push(`body too short: ${charCount} chars (min 2500)`);
if (charCount > 5500) issues.push(`body too long: ${charCount} chars (max 5500)`);

// ─── Recent duplicate check ───────────────────────────────────────────────
// Compare the stem of this article's slug against posts from the last 14 days.
// Reject if a strong stem match exists (same work / event).

// Generic slug tokens that appear across many unrelated articles. They must
// NOT count toward duplicate detection — only distinctive subject tokens
// (work / artist / event names) should. Otherwise every Netflix article
// collides on netflix+month+year and gets false-flagged as a duplicate.
const GENERIC_SLUG_TOKENS = new Set([
  // platforms / sources
  'netflix', 'abema', 'disney', 'disneyplus', 'prime', 'primevideo', 'video',
  'unext', 'hulu', 'wowow', 'amazon', 'vod',
  // format / boilerplate
  'watch', 'guide', 'viewing', 'view', 'cinema', 'shinjuku', 'live', 'stream',
  'streaming', 'release', 'releases', 'ppv', 'movie', 'film', 'series',
  'season', 'special', 'drama', 'anime', 'new', 'top', 'the', 'and', 'for',
  'with', 'reel',
  // months
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov',
  'dec', 'january', 'february', 'march', 'april', 'june', 'july', 'august',
  'september', 'october', 'november', 'december',
  // years
  '2024', '2025', '2026', '2027', '2028',
]);

const distinctiveSlugTokens = (stem) =>
  new Set(
    stem
      .split('-')
      .filter((t) => t.length >= 3 && !GENERIC_SLUG_TOKENS.has(t)),
  );

const filename = path.basename(filepath);
const slugStem = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
const today = new Date(filename.slice(0, 10) + 'T00:00:00+09:00');

try {
  const allPosts = await fs.readdir(POSTS_DIR);
  for (const f of allPosts) {
    if (f === filename) continue;
    if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f)) continue;
    const otherDate = new Date(f.slice(0, 10) + 'T00:00:00+09:00');
    const days = Math.abs((today - otherDate) / (1000 * 60 * 60 * 24));
    if (days > 14) continue;
    const otherStem = f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
    if (otherStem === slugStem) {
      issues.push(`exact slug duplicate within 14 days: ${f}`);
      continue;
    }
    // Loose stem overlap — but only count DISTINCTIVE subject tokens (work /
    // artist / event names). Generic tokens (platform, format, month, year)
    // appear in most slugs, so counting them false-flagged unrelated articles
    // like "netflix-avatar-...-june-2026" vs "netflix-...-kenkadokugaku-june-2026"
    // (shared: netflix,june,2026). Strip those, then require ≥2 real overlaps —
    // enough to catch genuine repeats like kujo-no-taizai × kujo-no-taizai.
    const aTokens = distinctiveSlugTokens(slugStem);
    const bTokens = distinctiveSlugTokens(otherStem);
    const shared = [...aTokens].filter((t) => bTokens.has(t));
    if (shared.length >= 2) {
      issues.push(`possible duplicate within 14 days: ${f} (shared subject tokens: ${shared.join(',')})`);
    }
  }
} catch (err) {
  // POSTS_DIR missing is unexpected but not fatal for lint
  console.warn('skipping dup check:', err.message);
}

// ─── Report ───────────────────────────────────────────────────────────────
await report(issues);

async function report(issues) {
  const passed = issues.length === 0;
  console.log(passed ? '✅ lint passed' : '❌ lint failed');
  if (issues.length) {
    for (const i of issues) console.log('  • ' + i);
  }

  const out = process.env.GITHUB_OUTPUT;
  const issuesEncoded = issues.join(' / ').replace(/\n/g, ' ').slice(0, 800);
  if (out) {
    await fs.appendFile(
      out,
      `passed=${passed}\nissues=${issuesEncoded}\n`,
      'utf8'
    );
  }
  process.exit(passed ? 0 : 1);
}
