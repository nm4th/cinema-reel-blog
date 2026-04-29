#!/usr/bin/env node
/**
 * CINEMA REEL 新宿 — DALL-E MCP server
 *
 * Generates images via OpenAI DALL-E 3 and saves them under
 * public/images/blog/<slug>/<NN>.png so they can be referenced from
 * Markdown blog posts as /images/blog/<slug>/<NN>.png.
 *
 * The server reads OPENAI_API_KEY from (in order):
 *   1. process.env.OPENAI_API_KEY
 *   2. <project-root>/.env.local
 *   3. <project-root>/.env
 *
 * .env.local is git-ignored (see /.gitignore). NEVER commit your API key.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// ---- Tiny .env loader (no external dependency) ----
function loadEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile(path.join(PROJECT_ROOT, '.env.local'));
loadEnvFile(path.join(PROJECT_ROOT, '.env'));

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error(
    '[dalle-mcp] OPENAI_API_KEY is required. ' +
      'Add it to .env.local at the project root, e.g. OPENAI_API_KEY=sk-...'
  );
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

const server = new Server(
  { name: 'cinema-reel-dalle', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_image',
      description:
        'Generate an image with DALL-E 3 and save it to public/images/blog/<slug>/<NN>.png. ' +
        'Returns the public path (use in Markdown as ![](/images/blog/<slug>/<NN>.png)) ' +
        'and the DALL-E revised prompt actually used. English prompts produce best results. ' +
        'Cost: standard $0.04 (1024) / $0.08 (1792); hd $0.08 / $0.12.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description:
              'Detailed image prompt. English produces best results. Describe scene, mood, composition, lighting, color palette. For CINEMA REEL 新宿 brand fit, lean into dark cinematic, warm gold + crimson accents, film grain.',
          },
          slug: {
            type: 'string',
            description:
              'Article slug; used as the folder name. E.g. "2026-04-25-birthday-surprise-private-cinema". Will be sanitized.',
          },
          size: {
            type: 'string',
            enum: ['1024x1024', '1792x1024', '1024x1792'],
            description:
              '1792x1024 = landscape (hero/banner; default), 1024x1024 = square, 1024x1792 = portrait.',
          },
          style: {
            type: 'string',
            enum: ['vivid', 'natural'],
            description:
              'vivid = dramatic/hyper-real (good for cinematic moods), natural = realistic/photographic (default).',
          },
          quality: {
            type: 'string',
            enum: ['standard', 'hd'],
            description:
              'standard (default) is fine for blog inline; hd for hero images.',
          },
          filename: {
            type: 'string',
            description:
              'Optional override of the generated filename (without extension). If omitted, uses 01.png, 02.png, ... in the slug folder.',
          },
        },
        required: ['prompt', 'slug'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'generate_image') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = request.params.arguments ?? {};
  const {
    prompt,
    slug,
    size = '1792x1024',
    style = 'natural',
    quality = 'standard',
    filename,
  } = args;

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('prompt is required and must be a string');
  }
  if (!slug || typeof slug !== 'string') {
    throw new Error('slug is required and must be a string');
  }

  const safeSlug = String(slug).replace(/[^a-zA-Z0-9_\-]/g, '-');

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size,
    style,
    quality,
    response_format: 'b64_json',
  });

  const data = response.data?.[0];
  if (!data?.b64_json) {
    throw new Error('OpenAI response did not contain image data');
  }

  const dir = path.join(PROJECT_ROOT, 'public', 'images', 'blog', safeSlug);
  await fsp.mkdir(dir, { recursive: true });

  let outName;
  if (filename) {
    const safe = String(filename).replace(/[^a-zA-Z0-9_\-]/g, '-');
    outName = `${safe}.png`;
  } else {
    const existing = await fsp.readdir(dir).catch(() => []);
    const n = existing.filter((f) => /^\d{2}\.png$/.test(f)).length + 1;
    outName = `${String(n).padStart(2, '0')}.png`;
  }

  const filepath = path.join(dir, outName);
  await fsp.writeFile(filepath, Buffer.from(data.b64_json, 'base64'));

  const publicPath = `/images/blog/${safeSlug}/${outName}`;
  const relPath = path.relative(PROJECT_ROOT, filepath);

  const lines = [
    `Saved:    ${publicPath}`,
    `Local:    ${relPath}`,
    `Size:     ${size} | Style: ${style} | Quality: ${quality}`,
  ];
  if (data.revised_prompt) {
    lines.push('', 'DALL-E revised prompt:', data.revised_prompt);
  }
  lines.push('', 'Markdown snippet:');
  lines.push(`![](${publicPath})`);

  return {
    content: [{ type: 'text', text: lines.join('\n') }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[dalle-mcp] ready');
