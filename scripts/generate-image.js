#!/usr/bin/env node
/**
 * Generate a single image via OpenAI DALL-E 3 and save it to
 * public/images/blog/<slug>/<filename>.png.
 *
 * Used by both the batch generator (scripts/generate-images.js)
 * and standalone CLI invocation:
 *
 *   OPENAI_API_KEY=sk-... node scripts/generate-image.js \
 *     --slug 2026-04-25-birthday-surprise-private-cinema \
 *     --filename hero \
 *     --size 1792x1024 --style vivid --quality hd \
 *     --prompt "A glowing birthday cake in a dark private screening room..."
 *
 * Designed to run on GitHub Actions (Node 20+) with no npm dependencies.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export async function generateImage({
  prompt,
  slug,
  filename,
  size = '1792x1024',
  style = 'natural',
  quality = 'standard',
  apiKey = process.env.OPENAI_API_KEY,
  overwrite = false,
}) {
  if (!apiKey) throw new Error('OPENAI_API_KEY env var is required');
  if (!prompt) throw new Error('prompt is required');
  if (!slug) throw new Error('slug is required');

  const safeSlug = String(slug).replace(/[^a-zA-Z0-9_\-]/g, '-');
  const dir = path.join(ROOT, 'public', 'images', 'blog', safeSlug);
  await fs.mkdir(dir, { recursive: true });

  let outFile;
  if (filename) {
    const safe = String(filename)
      .replace(/\.png$/i, '')
      .replace(/[^a-zA-Z0-9_\-]/g, '-');
    outFile = path.join(dir, `${safe}.png`);
  } else {
    const existing = await fs.readdir(dir).catch(() => []);
    const n = existing.filter((f) => /^\d{2}\.png$/.test(f)).length + 1;
    outFile = path.join(dir, `${String(n).padStart(2, '0')}.png`);
  }

  const rel = path.relative(ROOT, outFile);

  if (!overwrite) {
    try {
      await fs.access(outFile);
      console.log(`⏭  skip (exists): ${rel}`);
      return { path: outFile, skipped: true };
    } catch {
      // file doesn't exist; continue
    }
  }

  console.log(`🎨 generate: ${rel}`);

  // Tier-0 OpenAI accounts cap DALL-E 3 around 1 image/min.
  // Retry on 429 with backoff so a single workflow run can finish a batch.
  const MAX_ATTEMPTS = 5;
  const BACKOFFS_MS = [30_000, 60_000, 75_000, 90_000];
  let response;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        style,
        quality,
        response_format: 'b64_json',
      }),
    });

    if (response.status !== 429 || attempt === MAX_ATTEMPTS) break;
    const wait = BACKOFFS_MS[attempt - 1] ?? 90_000;
    console.log(`   ⏳ 429 rate-limited, retrying in ${Math.round(wait / 1000)}s (attempt ${attempt}/${MAX_ATTEMPTS - 1})`);
    await new Promise((res) => setTimeout(res, wait));
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI ${response.status}: ${text.slice(0, 400)}`);
  }

  const json = await response.json();
  const data = json.data?.[0];
  if (!data?.b64_json) {
    throw new Error('OpenAI response missing b64_json');
  }

  await fs.writeFile(outFile, Buffer.from(data.b64_json, 'base64'));
  console.log(`✅ saved:    ${rel}`);
  if (data.revised_prompt) {
    console.log(`   revised: ${data.revised_prompt.slice(0, 200)}`);
  }

  return { path: outFile, skipped: false, revisedPrompt: data.revised_prompt };
}

// ---- CLI ----
function parseCliArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'overwrite' || key === 'force') {
      out.overwrite = true;
    } else if (i + 1 < argv.length) {
      out[key] = argv[++i];
    }
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseCliArgs(process.argv.slice(2));
  generateImage(args)
    .then((r) => process.exit(0))
    .catch((err) => {
      console.error(`❌ ${err.message}`);
      process.exit(1);
    });
}
