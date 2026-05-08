#!/usr/bin/env node
/**
 * Daily auto-article generator for CINEMA REEL 新宿.
 *
 * Two-phase Anthropic Messages API call:
 *   Phase A — Research: Claude uses the built-in web_search tool to find
 *     today's best topic, cross-checks with multiple official sources,
 *     decides "publish" or "skip", returns structured JSON.
 *   Phase B — Write: given the verified topic + facts, generate the full
 *     article markdown following the CLAUDE.md rules.
 *
 * Output:
 *   - On publish: writes src/content/posts/YYYY-MM-DD-<slug>.md and prints
 *       path=<filepath>
 *       skipped=false
 *     to $GITHUB_OUTPUT.
 *   - On skip: prints
 *       skipped=true
 *       reason=<why>
 *     and exits 0.
 *
 * Env:
 *   ANTHROPIC_API_KEY — required
 *   GITHUB_OUTPUT — set by Actions, optional locally
 *   FORCE_DATE — override today's date in YYYY-MM-DD (for testing)
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is required');
  process.exit(1);
}

const MODEL = 'claude-sonnet-4-5';
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const today = process.env.FORCE_DATE || new Date().toISOString().slice(0, 10);
const todayDate = new Date(today + 'T00:00:00+09:00');
const dayOfWeekJp = ['日', '月', '火', '水', '木', '金', '土'][todayDate.getDay()];

const ROOT = path.resolve(import.meta.dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');

// ─── Anthropic API call helper ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callClaude({ system, messages, tools, maxTokens = 4096, maxRetries = 4 }) {
  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    ...(tools ? { tools } : {}),
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429 && attempt < maxRetries - 1) {
      // Anthropic Tier-1 has a per-minute token bucket; 65s clears it fully.
      // Back off longer on later attempts in case the bucket needs longer.
      const waitSec = 65 + 30 * attempt;
      console.log(`⏳ 429 rate-limited; sleeping ${waitSec}s before retry (${attempt + 1}/${maxRetries - 1})…`);
      await sleep(waitSec * 1000);
      continue;
    }

    if (res.status >= 500 && res.status < 600 && attempt < maxRetries - 1) {
      console.log(`⏳ ${res.status} server error; retrying in 15s (${attempt + 1}/${maxRetries - 1})…`);
      await sleep(15_000);
      continue;
    }

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 600)}`);
    }
    return res.json();
  }
  throw new Error('Anthropic API: exhausted retries');
}

// Squeeze the final assistant text out of a Messages API response, ignoring
// intermediate tool_use / tool_result blocks (web_search runs server-side
// so we just want the model's terminal text).
function extractFinalText(resp) {
  if (!resp.content) return '';
  return resp.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

function extractJsonBlock(text) {
  // The model is instructed to output JSON only, but defensively strip any
  // markdown fences and surrounding prose.
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  // Find the outermost { ... } in case prose still wraps it.
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`no JSON object found in:\n${text.slice(0, 600)}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

// ─── Recent posts loader ───────────────────────────────────────────────────
// Phase A needs to know what topics we've already covered so it doesn't pick
// the same trending event again on the next day. Surfaces title + date + slug
// for everything published in the last 14 days.
async function getRecentPosts(days = 14) {
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  let files;
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch {
    return [];
  }
  const recent = [];
  for (const f of files) {
    if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f)) continue;
    const dateStr = f.slice(0, 10);
    const dateMs = new Date(dateStr + 'T00:00:00+09:00').getTime();
    if (dateMs < cutoffMs) continue;

    let title = '(no title)';
    let category = '';
    let tags = '';
    try {
      const md = await fs.readFile(path.join(POSTS_DIR, f), 'utf8');
      const tMatch = md.match(/^title:\s*"?([^"\n]+?)"?\s*$/m);
      const cMatch = md.match(/^category:\s*"?([^"\n]+?)"?\s*$/m);
      const tagMatch = md.match(/^tags:\s*\[([^\]]*)\]/m);
      if (tMatch) title = tMatch[1].trim();
      if (cMatch) category = cMatch[1].trim();
      if (tagMatch) tags = tagMatch[1].trim();
    } catch {}

    recent.push({ date: dateStr, slug: f.replace(/\.md$/, ''), title, category, tags });
  }
  return recent.sort((a, b) => b.date.localeCompare(a.date));
}

const recentPosts = await getRecentPosts(14);
console.log(`📚 recent posts in last 14 days: ${recentPosts.length}`);

// ─── Phase A — research the topic ───────────────────────────────────────────
const RESEARCH_SYSTEM = `あなたは新宿の完全貸切プライベートシネマ「CINEMA REEL 新宿」のエディトリアル AI です。
施設は約19㎡（12畳）、最大6名、EPSON 4Kプロジェクター + 大型スクリーン、新宿駅西口徒歩2分。
店舗側で **Netflix / Prime Video / U-NEXT / Disney+ / Abema** がログイン済み。

# あなたの仕事
今日のブログ記事1本ぶんの題材を選定する。捏造ゼロ、公式情報のみ。

# 採用優先順位（高い順）
1. **CINEMA REEL でログイン済みの VOD で観られる確定日程の生配信・PPV**
   ✅ Abema PPV（ボクシング、MMA、スポーツ生中継）
   ✅ Netflix の生中継（スポーツ、特別イベント）
   ✅ Prime Video PPV
   ✅ Disney+ / U-NEXT のライブ・ライブ映像
   ❌ PIA LIVE STREAM / Streaming+ / ZAIKO / その他 CINEMA REEL にログインしていないサービスの配信ライブ
2. Netflix Japan / Abema / U-NEXT などで配信開始日確定の話題作（公式プレスリリースあり）
3. 既配信の Top 10 トレンド作品（CINEMA REEL でログイン済みの VOD のもの）
4. 季節・イベント連動ライフスタイル記事（GW / クリスマス / バレンタイン / 卒業 / 新学期 / 夏休み 等）
   — 該当週のみ、特定作品ではなく汎用ノウハウ記事

# 必ず除外（skip 対象）
- 子供向け・教育コンテンツ（プリキュア、Eテレ、ディズニーチャンネル子供向け等）
- 18禁・成人向け
- 政治・宗教・社会運動・ニュース時事ネタ・スキャンダル
- 公式ソース 2 件未満
- 過去同名イベントとの年号取り違えリスクが高いもの
- CINEMA REEL にログインしていない VOD の独占配信

# 重複回避（最重要・厳守）
直近14日間に **既にカバー済みの「具体的題材」** とは、特定の作品名・特定のアーティスト名・特定の興行名・特定のイベント名を主体とした記事のこと。これと同じ題材は絶対に選ばない。

ただし以下は重複扱いしない（積極的に採用してOK）:
- **カテゴリレベルの類似**は OK
  - 例: 過去記事「推し活上映会の組み立て方ガイド」(汎用ノウハウ・特定アーティスト無し) と
    候補「○○（特定アーティスト）の PPV ライブ視聴ガイド」 は全く別物 → 採用 OK
- **同カテゴリでも具体的な題材が違う**なら OK
  - 例: 過去「Netflix MMA Rousey vs Carano」と 候補「Abema PPV ボクシング井上尚弥」 → 別の興行・別の選手なので OK
- **一般論記事と特定作品記事の組み合わせ**は別物
  - 例: 過去「新宿のレンタルシアター選び方」と 候補「特定 Netflix 作品の視聴ガイド」 → OK

判断基準: **slug の specific token（作品名・アーティスト名・興行名）が直近14日と被るか** で判断する。カテゴリ・テーマレベルの類似で過剰に skip しないこと。

${recentPosts.length === 0
  ? '直近14日間の記事: なし（重複の心配はない）'
  : `## 直近14日間に既にカバー済みの題材
${recentPosts.map(p => `- ${p.date} [${p.category}] ${p.title}\n  tags: ${p.tags}`).join('\n')}

これらと同じ作品・同じイベント・同じ出演者中心の記事は **絶対に書かない**。`
}

# 出力フォーマット（必ず JSON のみ）
web_search を必ず使って事実確認したうえで、最後に以下の JSON だけを出力する。前後に説明文を書かない。

採用する場合:
{
  "decision": "publish",
  "topic": {
    "title": "記事タイトル（日本語、'新宿で大画面で観るなら｜...' 形式）",
    "slug": "ascii-kebab-case-slug-no-japanese",
    "category": "上映ガイド" or "推し活" or "デート" or "パーティー" or "利用ガイド",
    "tags": ["<プラットフォーム>", "<作品名>", "<出演者名>", ...],
    // プラットフォーム タグは必ず1つ以上含める。配信元に応じて以下のいずれかを使う:
    //   "Netflix" / "ABEMA" / "Disney+" / "U-NEXT" / "Prime Video"
    // これがハブ・スポーク SEO の自動分類に使われるので表記揺れを避ける。
    "type": "live-broadcast" | "netflix-release" | "trending" | "seasonal-lifestyle",
    "summary": "1文の要約",
    "factsVerified": [
      { "claim": "配信開始日 2026-XX-XX", "sources": ["url1", "url2"] }
    ],
    "youtubeOfficialVideos": [
      { "id": "<11文字のYouTube動画ID>", "title": "動画タイトル", "role": "trailer" | "teaser" | "press-conf" | "interview" | "bts" | "clip" | "highlight" | "promo" }
    ],
    "officialUrls": [
      { "title": "Netflix公式作品ページ", "url": "https://..." },
      { "title": "About Netflix プレスリリース", "url": "https://..." },
      { "title": "..." , "url": "..." }
    ]
  }
}

# 動画リサーチ（重要）
youtubeOfficialVideos は **題材タイプによって下限が異なる**:

- **type: "live-broadcast"（確定日程の生配信・PPV）** → **最低 1 本** で OK
  - ライブ・PPV は元々公開動画が少ないため。公式予告編・イベント告知映像・選手プロフィール動画など何か 1 本見つかれば採用可
  - 動画が少ない分は記事内で venue photo の figure を 2〜3 枚多めに入れて視覚密度を確保する（Phase B 側で対応）
- **type: "netflix-release" / "trending"（配信開始日確定の作品・既配信のトレンド作品）** → **最低 2 本**、目標 3〜5 本
  - 主要作品は予告編・キャスト対談・特別映像・BTS 等が複数あるはず

各動画 ID は **11文字の YouTube 動画 ID（dQw4w9WgXcQ 形式）**で、watch URL から抽出する。実在性を verify すること（架空の動画 ID は禁止）。Netflix Japan / ABEMA / アーティスト等 **公式 YouTube チャンネル** からのみ取得。

公式動画が条件本数未満しか見つからない、または検証不能な場合のみ decision: "skip"。動画 1 本＋公式 URL 2 件で確定情報が取れる live broadcast は **絶対に skip しない**。

スキップする場合:
{
  "decision": "skip",
  "reason": "今日は採用基準に合う題材が見つからなかった理由を簡潔に"
}`;

console.log(`📅 today: ${today} (${dayOfWeekJp})`);
console.log('🔍 Phase A: researching today\'s topic…');

const researchUserMsg = `今日は ${today}（${dayOfWeekJp}曜日）。
CINEMA REEL 新宿のブログに今日公開する上映ガイド記事の題材を1つ選んで、JSON で返してください。
web_search を使って必ず複数ソースで事実確認すること。`;

const researchResp = await callClaude({
  system: RESEARCH_SYSTEM,
  messages: [{ role: 'user', content: researchUserMsg }],
  tools: [
    { type: 'web_search_20250305', name: 'web_search', max_uses: 8 },
  ],
  maxTokens: 8192,
});

const researchText = extractFinalText(researchResp);
let research;
try {
  research = extractJsonBlock(researchText);
} catch (err) {
  console.error('❌ failed to parse research JSON:', err.message);
  console.error('--- raw text ---\n' + researchText.slice(0, 1200));
  process.exit(1);
}

console.log(`📋 decision: ${research.decision}`);

if (research.decision === 'skip') {
  console.log(`⏭  reason: ${research.reason}`);
  await writeOutput({ skipped: 'true', reason: research.reason });
  process.exit(0);
}

const topic = research.topic;
console.log(`📝 topic: ${topic.title}`);
console.log(`   category: ${topic.category}`);
console.log(`   slug: ${topic.slug}`);
console.log(`   sources: ${topic.officialUrls?.length || 0}`);

// ─── Phase B — write the article ────────────────────────────────────────────
// Wait out the per-minute token-bucket window before firing Phase B. Phase A's
// web_search results consume a sizable input-token chunk that's still counted
// in the same 60-second window if we hit the API immediately afterward — on
// Tier-1 accounts this trips the 30K input-tokens/min limit.
const PHASE_GAP_SEC = 65;
console.log(`⏳ pausing ${PHASE_GAP_SEC}s to clear the rate-limit window before Phase B…`);
await sleep(PHASE_GAP_SEC * 1000);

const ARTICLE_SYSTEM = `あなたは「CINEMA REEL 新宿」のブログのエディトリアルライターです。
シネマティック・ダーク基調、文学的で上品なトーンで日本語の記事を書く。

# ブランドルール（厳守）
- 最上級表現禁止: 「最高」「絶対」「業界一」「No.1」「100%」「必ず○○できる」を使わない
- 防音性を高く謳わない: 「完全防音ではない」と正直に書く（言及する場合のみ）
- 「声出しは自由」「大声OK」「拍手OK」と書かない（規約上、大声・拍手・合唱・破裂音は禁止）
- 比較で他店をディスらない
- ハードセルしない: PostLayout 側の post-cta aside と sticky CTA に任せる

# 必ず使う HTML スニペット

## 動画ヒーロー（リード直後、上映ガイドの場合）
<div class="video-embed">
  <iframe src="https://www.youtube.com/embed/<VIDEO_ID>" title="<タイトル> 公式予告編" allowfullscreen loading="lazy"></iframe>
</div>

## 中盤の inline 動画埋め込み
本文中の各 H2 の文脈に合わせて、上記 \`<div class="video-embed">\` を **複数回** 配置する（目標: 3〜5本）。同じ動画を繰り返し使わない。

## 図版（figure 図 + キャプション）
作品画像の hotlink/転載は禁止だが、**CINEMA REEL 新宿の実空間写真**は使ってよい（ユーザー所有のスペース写真）。視聴方法・選択肢・準備系のセクションで figure として挿入する:

利用可能な実空間写真（Spacemarket CDN URL）:
- スクリーン正面 → \`https://cdnspacemarket.com/uploads/attachments/1571410/image.jpg?width=1200&quality=85&format=jpg&auto=webp\`
- 室内・ソファ → \`https://cdnspacemarket.com/uploads/attachments/1556569/image.jpg?width=1200&quality=85&format=jpg&auto=webp\`
- 4Kプロジェクター → \`https://cdnspacemarket.com/uploads/attachments/1529635/image.jpg?width=1200&quality=85&format=jpg&auto=webp\`
- 空間全景 → \`https://cdnspacemarket.com/uploads/attachments/1585361/image.jpg?width=1200&quality=85&format=jpg&auto=webp\`

書き方:
\`\`\`html
<figure class="post-figure">
  <img src="<上記のいずれか>" alt="<内容を説明する代替テキスト>" loading="lazy" />
  <figcaption>キャプション文（イタリック体で表示される）</figcaption>
</figure>
\`\`\`

上映ガイド記事は **最低 1 枚**、可能なら **2 枚** の venue photo figure を「視聴方法」「選択肢」「準備」系のセクションに挿入する。

## 中盤の inline CTA（記事内 2 箇所、25-35% と 60-75% の地点）
**CTA のリンク先は必ず "/" （TOPページ）にする。Spacemarket への直リンクは使わない。** これは記事 → ホームページ → Spacemarket というファネル設計。ボタン文言は「詳細を見る →」で固定。

<aside class="post-cta-inline">
  <p>新宿駅西口徒歩2分の完全貸切プライベートシネマ <strong>CINEMA REEL 新宿</strong>。最大6名・EPSON 4Kプロジェクターと大画面で、自分たちだけの上映時間を。</p>
  <a href="/">詳細を見る →</a>
</aside>

別バリエーションの inline CTA（VOD推し）:
<aside class="post-cta-inline">
  <p><strong>CINEMA REEL 新宿</strong>では Netflix・Prime Video・U-NEXT・Disney+・Abema が店舗側でログイン済み。来店してすぐ大画面に。</p>
  <a href="/">詳細を見る →</a>
</aside>

## 公式情報まとめ（上映ガイドの末尾）
<div class="source-list">
  <p class="source-list-title">SOURCES</p>
  <ul>
    <li><a href="..." target="_blank" rel="noopener noreferrer">タイトル</a></li>
    ...
  </ul>
</div>

# 記事構造（上映ガイド版・10セクションテンプレ）
1. frontmatter（title / description 140-160字 / pubDate / category / tags / heroVideoId = role: "trailer" の動画 ID）
2. リード（3-5文）
3. リード直後に **動画ヒーロー iframe**（role: "trailer" を使用）
4. ## H2 #1: 作品概要・配信日程
5. ## H2 #2: メインキャスト・出演者
   - ここに role: "interview" / "press-conf" の **iframe を1本** 埋める
6. （ここに 1 個目の <aside class="post-cta-inline">）
7. ## H2 #3: 公式予告編・特別映像 or 過去ハイライト
   - role: "teaser" / "clip" / "highlight" の **iframe を1本** 埋める
8. ## H2 #4: 撮影の裏側 / 制作秘話 / 試合背景 など
   - role: "bts" / "promo" の **iframe を1本** 埋める
9. ## H2 #5: 大画面で観たい人向けの選択肢
   - **<figure>** で venue photo 1 枚（スクリーン正面 or 4Kプロジェクター）を挿入
   - CINEMA REEL を 1 回さりげなく言及
10. （ここに 2 個目の <aside class="post-cta-inline">）
11. ## H2 #6: グループ視聴の楽しみ方・進行のヒント
   - **<figure>** で venue photo 1 枚（室内・ソファ or 空間全景）を挿入
12. ## 公式情報まとめ（<div class="source-list">）
13. 末尾の閉じパラグラフ（CINEMA REEL を選択肢として軽く再登場）

## 視覚要素の最低ライン（厳守）
- **iframe（公式 YouTube 動画埋め込み）**: 最低 1 本、目標 3〜5 本
  - 一般作品（Netflix ドラマ等）は 3〜5 本が標準
  - 確定日程の生配信・PPV は 1〜2 本でも可（元々公開動画が少ないため）
- **figure（venue photo）**: 最低 1 枚、推奨 2〜3 枚
  - **動画が 2 本未満（live broadcast 等）の場合は 3 枚 以上**を入れて視覚密度を確保
- iframe + figure の合計が **最低 3 個** ないと記事は採用されない（lint で gate）

組み立てイメージ:
- 動画 4本＋figure 1枚 = 視覚 5個（一般作品）
- 動画 2本＋figure 2枚 = 視覚 4個
- **動画 1本＋figure 3枚 = 視覚 4個（live broadcast 想定）**
- 動画 1本＋figure 1枚 = 視覚 2個 → 不足、figure を追加すること

# 季節・イベント連動ライフスタイル記事の場合
- heroVideoId は不要、heroImage も不要（または既存 DALL-E 画像）
- video-embed iframe は不要
- source-list は不要
- 6-8 個の H2 セクションで、ノウハウ・選び方・実例の構成
- inline CTA は同じく中盤 2 箇所

# 文字数
本文 3,000〜4,500 字（厳守）

# CINEMA REEL 言及ルール
本文中の言及は **2回まで**: 中盤の「選択肢」セクション + 末尾クロージング
（中盤の inline CTA や末尾の post-cta aside は別カウント、本文ではない）

# 出力
**Markdown のみ** を出力。先頭は \`---\` から始まる frontmatter、末尾は閉じパラグラフ。説明文・コードフェンス・JSON は一切付けない。`;

console.log('✍️  Phase B: writing article…');

const articleUserMsg = `以下の題材で、上記ルールに従って記事 markdown を生成してください。

題材データ（JSON）:
${JSON.stringify(topic, null, 2)}

# 注意
- pubDate: ${today}
- すべての事実は factsVerified と officialUrls の範囲に限定（捏造禁止）
- youtubeOfficialId が null の場合: 動画ヒーロー iframe は省略、heroVideoId frontmatter も省略、heroImage を別途指定するか省略
- type === "seasonal-lifestyle" の場合: 上映ガイド構造ではなくライフスタイル構造で書く（H2 6-8個、source-list 不要）
- frontmatter の draft フィールドは省略する（false がデフォルト）
- 公式情報まとめのリンク先は officialUrls にあるものだけ`;

const articleResp = await callClaude({
  system: ARTICLE_SYSTEM,
  messages: [{ role: 'user', content: articleUserMsg }],
  maxTokens: 8192,
});

let articleMd = extractFinalText(articleResp);

// Some models occasionally wrap output in ```markdown fences. Strip if so.
const fenceMatch = articleMd.match(/^```(?:markdown|md)?\s*([\s\S]+?)```\s*$/);
if (fenceMatch) articleMd = fenceMatch[1].trim();

// Sanity: must start with frontmatter
if (!articleMd.startsWith('---')) {
  console.error('❌ generated article does not start with frontmatter');
  console.error('--- first 600 chars ---\n' + articleMd.slice(0, 600));
  process.exit(1);
}

// ─── Save ──────────────────────────────────────────────────────────────────
const slug = topic.slug.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').toLowerCase();
const filename = `${today}-${slug}.md`;
const filepath = path.join(POSTS_DIR, filename);

await fs.writeFile(filepath, articleMd, 'utf8');
console.log(`✅ wrote ${path.relative(ROOT, filepath)} (${articleMd.length} chars)`);

await writeOutput({
  skipped: 'false',
  path: path.relative(ROOT, filepath),
  title: topic.title,
  category: topic.category,
  type: topic.type,
});

// ─── GitHub Actions output helper ──────────────────────────────────────────
async function writeOutput(kv) {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) {
    for (const [k, v] of Object.entries(kv)) console.log(`${k}=${v}`);
    return;
  }
  const lines = Object.entries(kv)
    .map(([k, v]) => {
      const safe = String(v).replace(/\n/g, ' ');
      return `${k}=${safe}`;
    })
    .join('\n');
  await fs.appendFile(out, lines + '\n', 'utf8');
}
