#!/usr/bin/env node
/**
 * Convert /public/logo.png (paletted PNG with black background)
 * into /public/logo-transparent.png by adding a tRNS chunk that makes
 * palette index 0 (pure black) fully transparent. Anti-aliased edge
 * pixels (which are not pure black) stay opaque so the C film mark and
 * wordmark keep their soft edges.
 *
 * Pure Node, no npm dependencies. Idempotent — safe to re-run.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'public', 'logo.png');
const OUT = path.join(ROOT, 'public', 'logo-transparent.png');

// PNG chunks parsing helpers ------------------------------------------------

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function parseChunks(buf) {
  if (buf.subarray(0, 8).compare(SIG) !== 0) {
    throw new Error('not a PNG');
  }
  const chunks = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.subarray(off + 4, off + 8).toString('ascii');
    const data = buf.subarray(off + 8, off + 8 + len);
    const crc = buf.readUInt32BE(off + 8 + len);
    chunks.push({ type, data, crc });
    off += 12 + len;
    if (type === 'IEND') break;
  }
  return chunks;
}

// CRC-32 (PNG variant: polynomial 0xedb88320, big-endian output)
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c;
  }
  return t;
})();
function crc32(typeStr, data) {
  let c = 0xffffffff;
  for (const b of Buffer.from(typeStr, 'ascii')) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  for (const b of data) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function encodeChunk(type, data) {
  const buf = Buffer.alloc(12 + data.length);
  buf.writeUInt32BE(data.length, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  buf.writeUInt32BE(crc32(type, data), 8 + data.length);
  return buf;
}

// Main ----------------------------------------------------------------------

function main() {
  const src = fs.readFileSync(SRC);
  const chunks = parseChunks(src);

  const ihdr = chunks.find((c) => c.type === 'IHDR');
  if (!ihdr) throw new Error('no IHDR');
  const colorType = ihdr.data[9];
  if (colorType !== 3) {
    throw new Error(
      `expected paletted PNG (color-type=3) but got color-type=${colorType}; ` +
        `for non-paletted sources, use a different conversion path.`
    );
  }

  const plte = chunks.find((c) => c.type === 'PLTE');
  if (!plte) throw new Error('paletted PNG missing PLTE');
  const paletteEntries = plte.data.length / 3;

  // Locate every palette entry that is pure black (R=G=B=0). In our logo
  // there is exactly one, at index 0.
  const blackIdx = [];
  for (let i = 0; i < paletteEntries; i++) {
    if (plte.data[i * 3] === 0 && plte.data[i * 3 + 1] === 0 && plte.data[i * 3 + 2] === 0) {
      blackIdx.push(i);
    }
  }
  if (blackIdx.length === 0) throw new Error('no pure-black palette entry to make transparent');

  // Build tRNS: one byte per palette entry, alpha 0 for black, 255 otherwise.
  // The spec lets tRNS be shorter than the palette (entries beyond it are
  // assumed 255), so we trim trailing 255s to keep the chunk minimal.
  const trns = Buffer.alloc(paletteEntries, 255);
  for (const i of blackIdx) trns[i] = 0;
  let trimmedLen = trns.length;
  while (trimmedLen > 0 && trns[trimmedLen - 1] === 255) trimmedLen--;
  const trnsData = trns.subarray(0, trimmedLen);

  // Drop bKGD (the spec recommends keeping it but with paletted+tRNS it's
  // ambiguous, and we want pure transparency by default).
  const filtered = chunks.filter((c) => c.type !== 'bKGD' && c.type !== 'tRNS');

  // Re-emit: signature, then each chunk, with tRNS inserted right after PLTE.
  const out = [SIG];
  for (const c of filtered) {
    out.push(encodeChunk(c.type, c.data));
    if (c.type === 'PLTE') {
      out.push(encodeChunk('tRNS', trnsData));
    }
  }
  const result = Buffer.concat(out);
  fs.writeFileSync(OUT, result);

  const rel = path.relative(ROOT, OUT);
  console.log(`✅ wrote ${rel}`);
  console.log(`   palette entries: ${paletteEntries}`);
  console.log(`   transparent indices: [${blackIdx.join(', ')}]`);
  console.log(`   tRNS length: ${trnsData.length} bytes`);
  console.log(`   file size: ${result.length} bytes (input ${src.length})`);
}

main();
