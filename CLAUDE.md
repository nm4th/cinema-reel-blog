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
- 利用ガイド / 推し活 / デート / パーティー / 撮影 / 比較 / お知らせ

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

## 新規記事の作り方

```bash
# テンプレート生成
npm run new-post -- "新宿で○○する完全ガイド" デート 誕生日 サプライズ

# → src/content/posts/YYYY-MM-DD-slug.md が draft: true で作成される
# → 執筆して draft: false に変更してから commit & push
```

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

```
A dark cinematic interior of a private screening room in Tokyo Shinjuku,
warm gold and crimson accent lighting, soft 35mm film grain, deep shadows,
[SCENE], shallow depth of field, intimate atmosphere, no readable text
```

DALL-E は文字レンダが弱いので **「no readable text」「no clearly identifiable
corporate logos」を明示**しておくと事故が減る。人物は anonymous silhouettes /
back view に逃がすと不気味の谷を回避しやすい。

### GitHub Secrets

- `OPENAI_API_KEY` ― OpenAI Platform で発行、課金設定済みのアカウントのもの



- サービス: Formspree（無料プラン）
- フォーム ID: `xqewogvj`
- エンドポイント: `https://formspree.io/f/xqewogvj`
- 送信先メール: jesuisallerajapon@yahoo.co.jp
- 設置場所: `src/pages/index.astro` の CONTACT セクション
