#!/usr/bin/env node
/**
 * New blog post scaffold for CINEMA REEL 新宿.
 *
 * Usage:
 *   npm run new-post -- "新宿で○○する完全ガイド" デート 推し活 誕生日
 *   npm run new-post -- "<title>" <category> [tag1 tag2 ...]
 *
 * Allowed categories: 利用ガイド / 推し活 / デート / パーティー / 撮影 / 比較 / お知らせ
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.resolve(__dirname, '..', 'src', 'content', 'posts');

const ALLOWED_CATEGORIES = [
  '利用ガイド',
  '推し活',
  'デート',
  'パーティー',
  '撮影',
  '比較',
  'お知らせ',
];

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npm run new-post -- "<title>" <category> [tag1 tag2 ...]');
  console.error(`Allowed categories: ${ALLOWED_CATEGORIES.join(' / ')}`);
  process.exit(1);
}

const [title, category, ...tags] = args;

if (!ALLOWED_CATEGORIES.includes(category)) {
  console.error(`Invalid category: "${category}". Must be one of: ${ALLOWED_CATEGORIES.join(' / ')}`);
  process.exit(1);
}

const today = new Date();
const ymd = today.toISOString().slice(0, 10);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[\s　]+/g, '-')
    .replace(/[^\w\-ぁ-んァ-ン一-龯ー]/g, '')
    .slice(0, 60) || 'post';
}

const slug = slugify(title);
const filename = `${ymd}-${slug}.md`;
const filepath = path.join(POSTS_DIR, filename);

if (fs.existsSync(filepath)) {
  console.error(`File already exists: ${filepath}`);
  process.exit(1);
}

const tagsYaml = tags.length ? tags.map((t) => `  - "${t}"`).join('\n') : '  - "新宿"\n  - "プライベートシネマ"';

const template = `---
title: "${title}"
description: "（120〜140字。SEO重要。記事の要約 + キーワード自然挿入。「新宿駅徒歩2分の…」のような立地キーワードを含めると効果的。）"
pubDate: ${ymd}
category: "${category}"
tags:
${tagsYaml}
heroImage: "https://cdnspacemarket.com/uploads/attachments/1571410/image.jpg?width=1200&quality=85&format=jpg&auto=webp"
draft: true
---

（リード文：3〜5文。記事を最後まで読みたくなる導入。検索意図に対する答えの匂わせ + CINEMA REEL 新宿の差別化要素を1行入れる。）

## （H2 #1：問題提起 / 結論先出し）

（300〜500字。なぜこのテーマが重要か、もしくは結論を先に提示。）

## （H2 #2：本論パート1）

（500〜800字。具体例・数字・比較を入れる。）

### （必要なら H3 で細分化）

## （H2 #3：本論パート2）

（500〜800字。実際の使い方・段取り・選び方など、ハウツー寄りに。）

## （H2 #4：CINEMA REEL 新宿での具体例）

（400〜600字。価格・アクセス・設備など、具体的な情報を絡める。スペマリンクへの自然な導線を含む。）

## （H2 #5：注意点 / よくある質問）

（300〜500字。トラブル回避のための観点を3つほど。）

---

新宿駅徒歩2分、最大6名の完全貸切プライベートシネマ。空き状況の確認とご予約は、[スペースマーケットの専用ページ](https://spacemarket.com/p/Rk36vVe7-ZK_fg-E)からどうぞ。

<!--
執筆チェックリスト:
[ ] 文字数 3000-4500字
[ ] H2 4〜6個 / H3 適宜
[ ] description は120-140字 + 主要キーワード自然挿入
[ ] 「最安値」「業界一」「No.1」「絶対」「必ず」「100%」を使っていない
[ ] 競合の固有名でディスっていない
[ ] スペマリンクは https://spacemarket.com/p/Rk36vVe7-ZK_fg-E
[ ] 公開時に draft: true を外す
-->
`;

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(filepath, template, 'utf-8');

console.log(`✓ Created: ${path.relative(process.cwd(), filepath)}`);
console.log(`  Title:    ${title}`);
console.log(`  Category: ${category}`);
console.log(`  Tags:     ${tags.length ? tags.join(', ') : '(default)'}`);
console.log('');
console.log('  Edit the file, then set draft: false when ready to publish.');
