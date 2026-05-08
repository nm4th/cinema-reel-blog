# CLAUDE.md ― CINEMA REEL 新宿 サイト運営ガイド

このファイルは、Claude Code がこのリポジトリで作業するときに最初に読むガイドです。

## このサイトの目的

- **SEO流入**：「新宿 レンタルシアター」「新宿 プライベートシネマ」等で検索上位獲得
- **送客**：スペースマーケットのオーナー専用プロモーションリンクへの誘導
- **ブランディング**：シネマティックな世界観で「新宿で映画を観る場所」のトップオブマインド獲得

## 絶対遵守の3点

1. **スペースマーケットへのリンクは必ず以下のURLを使う**
   `https://spacemarket.com/p/Rk36vVe7-ZK_fg-E`
   通常URL `https://www.spacemarket.com/spaces/cinema-reel-shinjuku/` は使わない。
   理由：オーナー本人のプロモーション送客実績としてカウントされるため。

2. **トップページのデザイン世界観は崩さない**
   シネマティック・ダーク基調（黒・ゴールド・クリムゾン）。
   フィルムストリップ、グレイン、フリッカー演出を踏襲する。

3. **運営は合同会社liberty**
   フッター、構造化データ（JSON-LD）に必ず記載する。

## デザイントークン（変更禁止）

```
--bg: #0a0908
--bg-deep: #050403
--bg-card: #14110d
--film-edge: #1a1612
--ink: #f5e9d3
--ink-muted: #a89a82
--ink-dim: #6b6253
--gold: #c9a961
--gold-bright: #e8c878
--crimson: #8b1a1a
--crimson-bright: #b22222

--font-display: 'Bodoni Moda' (見出し・イタリック)
--font-jp: 'Shippori Mincho' (和文)
--font-aux: 'Cormorant Garamond' (補助欧文)
```

## ブログ運用ルール

### 執筆頻度・量
- 頻度: **毎日1記事**
- 文字数: **3,000〜4,500字**

### ターゲットキーワード

**Tier 1（最重要・月1本ずつ）**
- 新宿 レンタルシアター
- 新宿 プライベートシネマ
- 新宿 映画 貸切
- 新宿 シアタールーム

**Tier 2（用途別・週2本程度）**
- 新宿 推し活 上映会
- 新宿 誕生日 サプライズ
- 新宿 デート スペース
- 新宿 女子会 個室
- 新宿 撮影スタジオ
- 新宿 大画面 スポーツ観戦

**Tier 3（ロングテール）**
- 新宿駅西口 レンタルスペース
- 新宿 4Kプロジェクター
- 新宿 Netflix 大画面
- 新宿 上映会 個室
- 新宿 完全貸切 12畳

**季節・時事連動**
- 12月: 新宿 クリスマスデート、新宿 年末女子会
- 2月: 新宿 バレンタインデート、新宿 卒業祝い
- 3月: 新宿 卒業旅行、新宿 入学祝い
- 4月: 新宿 新歓 上映会
- 7-8月: 新宿 夏休み 推し活
- 10月: 新宿 ハロウィン 仮装パーティー

### カテゴリ（schema 固定）
- 利用ガイド / 上映ガイド / 推し活 / デート / パーティー / 撮影 / 比較 / お知らせ

### NG表現（景品表示法・誇大広告対策）
- ❌「最安値」「業界一」「No.1」
- ❌「絶対」「必ず」「100%」
- ❌ 競合店の具体名でディスる
- ❌ 著作物の無断引用（歌詞・台詞等）

### 記事構造のテンプレ
1. リード（3〜5文）
2. H2 #1: 問題提起 / 結論先出し
3. H2 #2: 本論パート1（具体例・数字）
4. H2 #3: 本論パート2（ハウツー）
5. H2 #4: CINEMA REEL 新宿での具体例（料金・アクセス）
6. H2 #5: 注意点・FAQ
7. クロージング（スペマリンクへの自然な導線）

### 画像URL（スペマCDN・著作権OK）

メイン: `https://cdnspacemarket.com/uploads/attachments/1571410/image.jpg`
室内:   `https://cdnspacemarket.com/uploads/attachments/1556569/image.jpg`
設備:   `https://cdnspacemarket.com/uploads/attachments/1529635/image.jpg`
全景:   `https://cdnspacemarket.com/uploads/attachments/1585361/image.jpg`

末尾に `?width=1200&quality=85&format=jpg&auto=webp` を付けて最適化。

## 上映ガイド記事の書き方（Netflix / Abema / 配信ライブ系）

「Netflix のあの作品を新宿の大画面で観よう」「○月○日の配信ライブを大画面で」系の事実情報メイン記事を **1日1本** 出していくシリーズ。捏造ゼロ・公式情報のみ・押し売りなしが鉄則。

### 題材選定

毎朝以下の WebSearch クエリを叩いて候補を洗い出す:

```
1. Google Trends Japan trending today entertainment <現在の年月>
2. Netflix Japan top 10 weekly chart <現在の年月>
3. Abema 注目番組 生配信 <現在の年月>
4. Disney+ / U-NEXT / Prime Video new releases Japan <現在の年月>
```

**優先順位**:
1. **CINEMA REEL でログイン済みの VOD** で観られる **確定日程の生配信・PPV**（Abema PPV ボクシング、Netflix 生中継、Prime Video / Disney+ / U-NEXT のライブ等）
2. Netflix Japan / Abema / U-NEXT などで **配信開始日が確定している話題作**（公式プレスリリースあり）
3. 既配信中の **Top 10 トレンド作品**
4. **GW / クリスマス / バレンタイン / 卒業 / 新学期 / 夏休み** などの **季節・イベント連動ライフスタイル記事**（カテゴリは `利用ガイド` 等、画像は DALL-E 自前生成）

**除外する題材（auto-pipeline は skip）**:
- ❌ PIA LIVE STREAM / Streaming+ / ZAIKO 等、CINEMA REEL に **ログインしていない VOD** の配信ライブ
- ❌ 子供向け・教育コンテンツ（プリキュア、Eテレ等）
- ❌ 18禁・成人向け作品
- ❌ 政治・宗教・社会運動・ニュース時事ネタ・スキャンダル
- ❌ 公式ソース 2 件未満で確認できないもの
- ❌ 過去同名イベント（毎年やる興行）の年号取り違え可能性が高いもの

「今日は良い題材なし」となった日は **記事生成スキップ**（PR も commit も作らない）が許容されている。

### 事実確認

- **すべての日付・出演者・配信プラットフォーム** は **2件以上の独立ソース** でクロスチェック
- 公式プレスリリース（about.netflix.com 等）が1件あれば最強。1件もない場合は記事化を見送る
- 過去の同名イベント（例: LIFETIME BOXING FIGHTS は毎年5月開催）と取り違えないよう、年月日は必ず最新検索で確認

### 画像・動画の扱い（上映ガイド系は「公式素材オンリー」）

**重要**: 上映ガイド系の記事（特定の作品・配信ライブを扱う記事）では、**DALL-E 自前生成画像は使わない**。理由は2つ:

1. 作品について書く記事で生成画像を貼ると、内容と乖離して読者の信頼を損なう
2. 視覚的な訴求は「実物の公式素材」のほうが圧倒的に強い

代わりに **公式チャンネルの埋め込み（iframe / oEmbed）** を中心に視覚要素を構成する:

| 用途 | やること | NG |
|---|---|---|
| Hero画像 | **frontmatter の `heroVideoId` に YouTube 動画 ID を入れる**（例: `heroVideoId: "7rVBPPvqPzc"`）。PostLayout が自動で `https://img.youtube.com/vi/<ID>/maxresdefault.jpg` をヒーロー背景にする。記事内に同じ動画を iframe で埋め込んでいる前提なので一貫性 OK・hotlink も YouTube の公開 CDN なので合法。`heroImage` を別ファイルで指定すれば優先される | DALL-E生成画像、Netflix 等の公式キービジュアルを別 CDN から hotlink・転載 |
| 作品サムネ | YouTube公式チャンネルの予告編・ティーザー・特別映像を `<div class="video-embed"><iframe>` で埋め込み（複数本OK、3〜5本くらい散らす） | 静止画のキャプチャを保存して再アップ |
| 出演者写真 | 使わない、テキストリンクのみ | 事務所・公式画像の転載 |
| 出典 | テキストリンク（公式サイト・公式X・公式YouTube）。`<div class="source-list">` でまとめる | 「画像の引用URL」と称した hotlink |
| 画像の引用 | 原則しない。やるなら X (Twitter) 公式アカウントの投稿を `<blockquote class="twitter-tweet">` で埋め込み（公式の oEmbed 機構なので合法） | 公式画像URLを `<img src=...>` で読み込むこと |

**ライフスタイル系記事との違い**: 誕生日サプライズ・推し活上映会・選び方ガイドなど、特定作品を扱わない汎用記事は引き続き DALL-E + image-manifest.json で OK。**「○○を観よう」シリーズだけが公式素材オンリー**。

公式 YouTube 予告編の埋め込みコード:

```html
<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/<VIDEO_ID>"
    title="<作品名> 公式予告編"
    allowfullscreen loading="lazy"></iframe>
</div>
```

### 記事構造（上映ガイド版テンプレ）

1. **リード**（3〜5文）: 配信日・配信先・現在の話題性をまず提示
2. **リード直後の動画ヒーロー**: 公式予告編 iframe（heroImage がないので、これが視覚的な開幕）
3. **H2 #1: 作品概要** — 配信開始日（ソースリンク付き）/ 原作 / 全話数 / 制作陣
4. **H2 #2: メインキャスト** — 役名+俳優名、ソースは公式 about.netflix.com など。末尾に **原作者×キャスト対談** や **キャスト・インタビュー** の公式 iframe を1本
5. **H2 #3: 特別映像（初対面シーン等）** — 別の公式 YouTube クリップを iframe
6. **H2 #4: 撮影の裏側** — BTS / メイキングの公式映像を iframe
7. **H2 #5: 大画面で観たい人向けの選択肢** — 自宅 / 友人宅プロジェクター / プライベートシネマ。ここで CINEMA REEL を1回さりげなく
8. **H2 #6: グループ視聴の楽しみ方** — 一気観 vs 分割視聴の提案、グッズ持ち寄り、感想戦の進め方など
9. **公式情報まとめ**（`<div class="source-list">`）: 公式サイト・公式予告編・関連プレスリリースのリンク一覧
10. **クロージング**（1〜2文）: 軽く CINEMA REEL を選択肢として再登場させる

**iframe 配置の目安（題材タイプで分ける）**:
- **一般作品**（Netflix ドラマ等）: 公式 YouTube iframe **3〜5本**。リード直後に予告編、キャスト紹介で対談、中盤に特別映像、後半にBTS。
- **確定日程の生配信・PPV**（Abema PPV、Netflix Live、ライブ配信等）: iframe **1〜2本** で OK（元々公開動画が少ないため）。不足分は venue photo の figure を 2〜3 枚多めに入れて視覚密度を確保。

**venue photo の追加配置**: iframe だけでは視覚密度が薄い場合、CINEMA REEL 新宿の実空間写真（Spacemarket CDN）を `<figure>` で挿入する。これは「作品画像の hotlink/転載」とは違って、**ユーザー所有のスペース写真** なので合法。視聴方法・選択肢・グループ視聴系のセクションに挿入するのが標準。

**lint 最低ライン**:
- 上映ガイド: **iframe ≥ 1**、**iframe + figure 合計 ≥ 3**
- ライフスタイル: figure ≥ 1（DALL-E でも venue photo でも可）

これで「Abema PPV ライブで動画 1 本しか見つからない」ような題材も、venue photo を 2〜3 枚挟むことで合格できる。

**重複判定の精度（重要）**:
- 重複は **「具体的題材」（作品名・アーティスト名・興行名）** レベルで判定する
- カテゴリ（推し活、上映ガイド等）が同じだけで重複とは見なさない
- 例: 4/26「推し活上映会の組み立て方ガイド」(汎用ノウハウ) と 5/x「○○（特定アーティスト）PPV ライブ視聴ガイド」(特定イベント) は別物 → 採用OK

### CINEMA REEL 言及ルール（さりげない誘導）

**全記事共通の鉄則**:

- 本文中の言及は **2回まで**（中盤の「選択肢」セクション + 末尾クロージング）
- **最上級表現禁止**:「最高」「絶対」「他にない」「No.1」
- **比較禁止**: 他のスペース・店舗名を出してディスらない
- 押し売り（"予約必須" "今すぐ" など）は使わない
- ハードセルは **PostLayout の `.post-cta` aside** と **sticky bottom CTA** に任せる。本文は事実中心で十分

参考フレーズ:
- 「もし新宿近辺で大画面で観るなら、新宿駅西口徒歩2分の[CINEMA REEL 新宿]というプライベートシネマもあります」
- 「ご自宅、近所のスポーツバー、貸切のプライベートシネマ——観方の選択肢はいろいろ。新宿の CINEMA REEL 新宿もそのひとつ」

### 中盤の予約導線（記事内 inline CTA）

長尺記事は途中離脱が多いので、本文中に **コンパクトな予約導線カードを 2 箇所** 挟み込む。
読者がスクロールで興味を持った瞬間に予約への動線が常に近くにある状態を作る。

**配置の目安**:
- **1回目**: 全体の 25〜35% 地点（H2 #2〜#3 の末尾、まだ「読む価値」を感じている早期）
- **2回目**: 全体の 60〜75% 地点（H2 後半の末尾、深く読んでくれた読者が予約意欲のピークに）

**避けるべき配置**:
- リード直後（読み始めの邪魔になる）
- 末尾近く（既存の `.post-cta` aside と被るので意味がない）
- 同じ H2 の中（流れが分断される）

**HTML スニペット**（Markdown に直接貼れる）:

```html
<aside class="post-cta-inline">
  <p>新宿駅西口徒歩2分の完全貸切プライベートシネマ <strong>CINEMA REEL 新宿</strong>。最大6名・EPSON 4Kプロジェクターと大画面、ふかふかのソファで、自分たちだけの上映時間を。</p>
  <a href="/">詳細を見る →</a>
</aside>
```

**コピーのバリエーション**（記事ごとに 1〜2 文を文脈に合わせて差し替える）:
- 設備推し: 「最大6名・EPSON 4Kプロジェクターと大画面、ふかふかのソファで、自分たちだけの上映時間を。」
- VOD推し: 「Netflix・Prime Video・U-NEXT・Disney+・Abema を店舗側でログイン済み。来店してすぐ大画面に。」
- 作品文脈系（上映ガイド記事用）: 「○○を大画面で観るなら、Netflix がログイン済みで来店してすぐ第1話から再生できます。」

**CTA リンクは TOP ページに固定**: `/`（cinema-reel.com トップへ。ホームのヒーローに `空き状況・予約` ボタンがあるので、そこから Spacemarket へ誘導するファネル）。

直接 `https://spacemarket.com/p/Rk36vVe7-ZK_fg-E` を使うのは:
- 画面下の `sticky-cta`（決断済み読者向けの即予約パス）
- 各記事の「公式予約ページ」「最新の正確な料金」等を明示する文脈リンク

の 2 種類だけ。記事中の CTA ボタンはすべて `/` にする。

PostLayout.astro 側の `.post-cta-inline` CSS が hand off で、ゴールドボーダー + 横並び（モバイルは縦積み）+ ゴールドピルボタンの形に整える。

### カテゴリの選び方

「Netflix のあの作品を観よう」「○月○日の生配信ライブを大画面で」のような **特定作品・特定イベントの視聴ガイド** は、カテゴリ **`上映ガイド`** で統一する:

| 題材 | category |
|---|---|
| **特定の作品 / 配信イベントの視聴ガイド全般**（Netflix・Abema・配信ライブ等） | **上映ガイド** |
| アイドル・K-POP の概論や同担と過ごす推し活ノウハウ | 推し活 |
| 友人グループで集まって観る系の一般ノウハウ（スポーツ観戦の選び方等） | パーティー |
| カップル・少人数で過ごすデート用の使い方 | デート |
| 大画面の活用法を解説する汎用記事 | 利用ガイド |

ポイント: **「○○ファンならこう使える」より「○○を観たい人のためのガイド」が主目的なら 上映ガイド**。アイドル特定推しグループ向けの記事（例「BLACKPINK の円盤を同担と観るなら」）など fan-driven な切り口の場合のみ 推し活 を使う。

**タグ**は自由なので、`Netflix` `Abema` `配信ライブ` `話題作` `<作品名>` `<出演者名>` を毎回足す。

## ハブ＆スポーク構造（SEO topic cluster）

**目的**: 「Netflix 大画面 新宿」「Netflix 新宿」のような **大きいキーワードを Pillar (ハブ) ページが取り**、各作品ガイド記事 (Spoke) がロングテールを取って、サイト全体の topical authority を Google に積み上げる。

**現状のハブ**:
- `/netflix/` — Netflix 特集（`src/pages/netflix.astro`）
  - URL は固定、中身は build 時に「タグに `Netflix` を含む posts」を query して動的に生成
  - 新しい上映ガイド記事を pubilsh するたびに、次の deploy で hub のグリッドに自動追加される
  - 配信ライブ系（タグに `配信ライブ` `ライブ配信` `生中継` `PPV`）と一般作品で section 分け

**構造**:
```
/netflix/  (Pillar / Hub)
   ├─ /blog/<work-1>/  (Spoke)
   ├─ /blog/<work-2>/  (Spoke)
   └─ /blog/<live-1>/  (Spoke)
```

**ハブ → スポーク の内部リンク**:
- ハブの spoke grid から各作品ページへ
- 自動生成、メンテ不要

**スポーク → ハブ の内部リンク**:
- PostLayout.astro が `tags` を見て、`netflix` が含まれていれば記事ヒーロー直下に「Netflix 特集を見る →」chip を自動表示
- 将来 `/abema/` `/disney/` 等を増やすなら `hubLinks` 配列に追加するだけで自動対応

**SEO 構造化データ**:
- Pillar ページに `CollectionPage` JSON-LD（item list 含む）
- 各 spoke は既に `BlogPosting` JSON-LD 持ってる
- 両方に `BreadcrumbList`

**ハブ追加の手順（将来 Abema / Disney+ 等）**:
1. `src/pages/<platform>.astro` を作成（netflix.astro をひな形にコピー）
2. `getCollection` のフィルタ条件を `tag.toLowerCase() === '<platform>'` に変更
3. ヘッダー nav に追加
4. PostLayout.astro の `hubLinks` 配列に判定追加
5. CLAUDE.md にハブ一覧を追記

**コンバージョン設計（最終目的）**:
- Pillar ページ最上部にヒーロー + 「空き状況・予約」CTA
- spoke grid 後に inline CTA（`/` へ）
- ページ末尾に再 CTA セクション
- sticky bottom CTA は site-wide で常時表示
- 各 spoke 記事内も inline CTA × 2 + post-cta aside を維持

## 新規記事の作り方

### 自動（デフォルト・毎日 08:00 JST）

`.github/workflows/daily-article-auto.yml` が cron で自動実行:

1. `scripts/draft-daily-article.mjs` が Anthropic API（web_search 内蔵）で今日の題材を調査・選定
2. 題材なしなら **skip**（commit も PR も作らない）
3. 題材ありなら full markdown を生成 → `src/content/posts/YYYY-MM-DD-<slug>.md` に保存
4. `scripts/lint-article.mjs` が品質ゲートチェック（frontmatter / H2数 / inline CTA数 / 禁止フレーズ / 文字数 / 重複）
5. lint 通過 → **main に直接 commit → deploy.yml で自動公開**
6. lint 失敗 → **PR をラベル `auto-draft` `needs-review` で開く**（ユーザーが手で直してマージ）

ユーザーは GitHub からの commit / PR メール通知で気付くだけで OK。

GitHub Secrets に `ANTHROPIC_API_KEY` の設定が必須。

### 手動（テスト・即興記事）

```bash
# テンプレート生成
npm run new-post -- "新宿で○○する完全ガイド" デート 誕生日 サプライズ

# → src/content/posts/YYYY-MM-DD-slug.md が draft: true で作成される
# → 執筆して draft: false に変更してから commit & push
```

または Actions の **Daily Auto-Article** を `workflow_dispatch` で手動起動（`force_date` で日付上書き、`auto_publish=false` で常に PR 経路）。

## デプロイ

`main` ブランチに push されると、GitHub Actions が自動で：
1. `npm ci` で依存インストール
2. `npm run build` で `dist/` 生成
3. SamKirkland/FTP-Deploy-Action でお名前.com の `/public_html/cinema-reel.com/` へ FTP デプロイ

## サーバー情報（重要）

- ホスティング: お名前.com RSプラン
- 公開フォルダ（サーバー絶対パス）: `/public_html/cinema-reel.com/`
- SSL: 無料SSL（Let's Encrypt）
- リダイレクト: `.htaccess` で http → https（既存設定維持）
- GitHub Secrets: `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD`

### `server-dir` の罠（実機で確認済み）

お名前.com RS プランの FTP アカウント（例: `cinema-reel@cinema-reel.com`）は、ログイン後 **chroot されてユーザーから見た `/` が `/home/<acct>/public_html/`** になる。
そして「※ホームページデータは public_html 内の各ドメイン名のフォルダにアップロードしてください」と Navi 側にも明記されている通り、各ドメインのファイルは chroot 直下の **ドメイン名フォルダ**に置く必要がある。

したがって deploy.yml の `server-dir` は **`./cinema-reel.com/` が正解**。

実機で踏んだ NG パターン:
- ❌ `/public_html/cinema-reel.com/` ― chroot を超える絶対パス → `550 Can't change directory`
- ❌ `./` ― chroot 直下（= `public_html/` 直下）に配置されてしまい、Web で公開されない
- ✅ `./cinema-reel.com/` ― 正解

FTP サーバー（実機）: `www1020.onamae.ne.jp`
接続先ディレクトリ（クライアント設定では入力不要）: `/home/r9262022/public_html/`

## 画像生成（DALL-E via GitHub Actions）

サンドボックス（Claude Code Web / Mac Desktop）からは外部 API へのアクセスが制限されているので、
画像生成は **GitHub Actions の hosted runner で OpenAI DALL-E 3 を叩く**構成にしてある。

### 仕組み

```
scripts/image-manifest.json         ← 画像ごとに prompt/slug/size/style/quality を定義
scripts/generate-image.js           ← OpenAI Images API を直叩きする最小スクリプト（依存ゼロ）
scripts/generate-images.js          ← マニフェストを読んで一括生成、skip-if-exists
.github/workflows/generate-images.yml ← workflow_dispatch で手動起動、結果を main にコミット
```

### 使い方（GitHub UI）

1. リポジトリの **Actions タブ** → 左ペインから **"Generate Blog Images (DALL-E)"** を選択
2. 右上の **Run workflow** を押す
3. オプション:
   - `force` ― true にすると既存画像も再生成（API クレジット消費注意）
   - `slug` ― 特定の記事スラッグだけに絞り込み（空欄ならマニフェスト全件）
4. 実行 → 数分後、`public/images/blog/<slug>/<filename>.png` がコミットされる
5. main への push で FTP デプロイが連動して走る

### 新しい記事に画像を足したい時

1. `scripts/image-manifest.json` に新しい entry を追加
   ```json
   {
     "slug": "<記事のスラッグ>",
     "filename": "hero",
     "size": "1792x1024",
     "style": "vivid",
     "quality": "hd",
     "prompt": "<英語の詳細プロンプト>"
   }
   ```
2. main に push（マニフェスト更新だけ）
3. Actions タブから手動で **Run workflow** を実行
4. 新規 entry のみ生成（既存はスキップ）

### コスト目安（DALL-E 3）

| 解像度 | standard | hd |
| ---- | ---- | ---- |
| 1024×1024 | $0.040 | $0.080 |
| 1792×1024 / 1024×1792 | $0.080 | $0.120 |

各記事 hero(hd) 1枚 + inline(standard) 3枚 = $0.36/記事。

### CINEMA REEL 新宿の世界観に合わせる英語プロンプトひな形

「シネマティック + 一眼レフ写実」で生成するために、**撮影機材スペック・色設計・色補正**
を必ずプロンプトに含める。これがないと CG っぽい仕上がりになる。

```
Photorealistic editorial photograph shot on [Canon EOS R5 with RF 35mm f/1.4L lens
| Sony A7 IV with 50mm f/1.4 lens | Hasselblad medium format with 80mm f/2.8 lens]
at f/[1.8〜2.8], [SCENE composition], warm [afternoon | amber | golden hour] light
[from the left | window light | side rake], [props with hyperdetailed textures],
color graded warm cinematic palette with gold highlights and crimson shadows,
fine 35mm film grain, ultra shallow depth of field with creamy bokeh,
[Kodak Portra 400 | Kodak Portra 800] color science,
magazine-quality editorial photograph,
no people | only anonymous silhouettes from behind, no readable text, no logos
```

**必ず入れるキーワード**:
- "Photorealistic editorial photograph" — CG 感を消す
- "shot on [カメラ] with [レンズ]" — レンズボケと立体感
- "f/1.8 / f/2.8" — 被写界深度の指定
- "hyperdetailed [対象] textures" — ディテール強調
- "color graded warm cinematic palette" — シネマ感
- "fine 35mm film grain" — フィルム感
- "Kodak Portra 400/800 color science" — 肌色と陰影の柔らかさ
- "no readable text, no logos" — 文字事故防止
- 人物は "anonymous silhouettes from behind" / "no faces visible" に逃がす

quality は **`hd`** を推奨（`standard` だと realism が落ちる。コストは1.5倍）。

### GitHub Secrets

- `OPENAI_API_KEY` ― OpenAI Platform で発行、課金設定済みのアカウントのもの



- サービス: Formspree（無料プラン）
- フォーム ID: `xqewogvj`
- エンドポイント: `https://formspree.io/f/xqewogvj`
- 送信先メール: jesuisallerajapon@yahoo.co.jp
- 設置場所: `src/pages/index.astro` の CONTACT セクション
