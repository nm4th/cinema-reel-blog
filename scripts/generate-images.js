#!/usr/bin/env node
/**
 * Batch image generation from scripts/image-manifest.json.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-images.js [--force] [--slug <slug>]
 *
 *   --force       Regenerate even if the file already exists (costs $$)
 *   --slug <s>    Only generate images for entries matching this slug
 *
 * Skip-if-exists behavior is the default so re-runs are cheap.
 * Used by .github/workflows/generate-images.yml.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateImage } from './generate-image.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(__dirname, 'image-manifest.json');

function parseArgs(argv) {
  const out = { force: false, slug: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') out.force = true;
    else if (a === '--slug' && i + 1 < argv.length) out.slug = argv[++i];
  }
  return out;
}

async function main() {
  const { force, slug: filterSlug } = parseArgs(process.argv.slice(2));

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY env var is required');
    process.exit(1);
  }

  const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(raw);

  const entries = filterSlug
    ? manifest.images.filter((e) => e.slug === filterSlug)
    : manifest.images;

  if (entries.length === 0) {
    console.error(`No entries found${filterSlug ? ` for slug "${filterSlug}"` : ''}`);
    process.exit(1);
  }

  console.log(
    `📋 manifest: ${entries.length} entries${force ? ' (force regenerate)' : ' (skip-if-exists)'}`
  );
  console.log('');

  const results = { generated: 0, skipped: 0, failed: 0 };

  // Pause between successful generations to stay under the per-minute rate
  // limit (Tier 0 ≈ 1 image/min for DALL-E 3). Skips/failures don't pause.
  const THROTTLE_MS = 8_000;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    let didCall = false;
    try {
      const r = await generateImage({ ...entry, overwrite: force });
      if (r.skipped) results.skipped++;
      else {
        results.generated++;
        didCall = true;
      }
    } catch (err) {
      console.error(`❌ ${entry.slug}/${entry.filename}: ${err.message}`);
      results.failed++;
    }
    console.log('');
    if (didCall && i < entries.length - 1) {
      await new Promise((res) => setTimeout(res, THROTTLE_MS));
    }
  }

  console.log('────────────────────────────');
  console.log(`Generated: ${results.generated}`);
  console.log(`Skipped:   ${results.skipped}`);
  console.log(`Failed:    ${results.failed}`);

  if (results.failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
