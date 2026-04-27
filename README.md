# CINEMA REEL 新宿 ― 公式サイト

新宿駅徒歩2分の完全貸切プライベートシネマ「CINEMA REEL 新宿」の公式サイトです。

- **公開URL**: https://cinema-reel.com/
- **予約**: https://spacemarket.com/p/Rk36vVe7-ZK_fg-E
- **運営**: 合同会社liberty

## 構成

- **Astro 5.x**（静的サイトジェネレーター）
- **Content Collections** によるブログ記事管理
- **Formspree** お問い合わせフォーム（フォームID: `xqewogvj`）
- **GitHub Actions** で main ブランチ push を契機にお名前.com RSプランへ FTP 自動デプロイ

## 開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に出力
npm run preview  # ビルド結果のローカルプレビュー
npm run check    # 型チェック
```

## 新規ブログ記事の作成

```bash
npm run new-post -- "記事タイトル" カテゴリ タグ1 タグ2 ...

# 例
npm run new-post -- "新宿で女子会を開くなら" パーティー 女子会 新宿
```

`src/content/posts/YYYY-MM-DD-slug.md` が draft で生成されるので、本文を書いて `draft: false` にしてから push してください。

## ディレクトリ構成

```
src/
├── pages/
│   ├── index.astro              # トップページ
│   ├── rss.xml.js               # RSSフィード
│   └── blog/
│       ├── index.astro          # ブログ一覧
│       ├── [slug].astro         # 記事個別ページ
│       └── category/[category].astro
├── layouts/
│   ├── Layout.astro             # 共通レイアウト
│   └── PostLayout.astro         # 記事用レイアウト
└── content/
    ├── config.ts                # スキーマ
    └── posts/                   # ブログ記事（Markdown）
public/
└── robots.txt
.github/workflows/
└── deploy.yml                   # 自動デプロイ
scripts/
└── new-post.js                  # 記事テンプレ生成
CLAUDE.md                        # Claude Code 用 運営ガイド（先に読む）
SETUP.md                         # 初回セットアップ手順
```

## デザイン方針（重要）

トップページ：シネマティック・ダーク基調（映画館っぽい没入感）
ブログ：同じ世界観・本文は読みやすさ重視

詳細は `CLAUDE.md` を参照。
