# DALL-E MCP server (CINEMA REEL 新宿)

Claude Code 用のローカル MCP サーバー。
OpenAI DALL-E 3 で画像を生成して `public/images/blog/<slug>/NN.png` に保存する。

## 初回セットアップ（1回だけ）

```bash
# 1. MCPサーバーの依存をインストール
cd mcp-servers/dalle
npm install
cd -

# 2. プロジェクトルートに .env.local を作成
echo 'OPENAI_API_KEY=sk-...your-key-here...' > .env.local
# .env.local は .gitignore 済み。絶対にコミットしない。

# 3. Claude Code を再起動 / プロジェクトを開き直す
# → 起動時に "Project has .mcp.json. Allow MCP server 'dalle'?" と聞かれるので Allow
```

## OpenAI API キー取得

1. https://platform.openai.com/api-keys
2. "Create new secret key"
3. `sk-...` で始まる文字列を `.env.local` に貼る
4. 課金設定: https://platform.openai.com/settings/organization/billing/overview で
   $5〜10 ぶんプリペイド入金しておくと安心

## 料金

DALL-E 3 公式料金（2026 年 4 月時点）:

| 解像度 | standard | hd |
| ---- | ---- | ---- |
| 1024×1024 | $0.040 | $0.080 |
| 1792×1024（横長） | $0.080 | $0.120 |
| 1024×1792（縦長） | $0.080 | $0.120 |

ブログ1記事に画像3〜4枚なら **$0.30〜0.50 程度**。

## 使い方（Claude Code 内）

セットアップ後、Claude Code から以下のツールが使えるようになる:

```
mcp__dalle__generate_image
```

例:

> 「2026-04-25-birthday-surprise-private-cinema 用に、ダークなプライベートシネマで誕生日ケーキの炎が灯る瞬間の画像を1792x1024 / vivid / hd で生成して」

→ `public/images/blog/2026-04-25-birthday-surprise-private-cinema/01.png` に保存され、
Markdown スニペット `![](/images/blog/2026-04-25-birthday-surprise-private-cinema/01.png)`
が返ってくるので、そのまま記事に貼り付ける。

## 入力パラメータ

| 名前 | 必須 | デフォルト | 説明 |
| ---- | ---- | ---- | ---- |
| `prompt` | ✓ | - | 画像プロンプト（英語推奨） |
| `slug` | ✓ | - | 記事スラッグ → 保存フォルダ名 |
| `size` | | `1792x1024` | `1024x1024` / `1792x1024` / `1024x1792` |
| `style` | | `natural` | `vivid` (劇的) / `natural` (写実) |
| `quality` | | `standard` | `standard` / `hd` |
| `filename` | | 自動連番 | `01.png` 等のファイル名（拡張子不要） |

## トラブルシューティング

**「OPENAI_API_KEY is required」と出て起動しない**
→ `.env.local` の場所がプロジェクトルート（`/cinema-reel-blog/.env.local`）か確認。
`mcp-servers/dalle/.env.local` ではない。

**Claude Code に MCP ツールが出てこない**
→ プロジェクトを完全に開き直す。`.mcp.json` の許可ダイアログを Deny 済みなら、
`/permissions` から再許可する。

**「You don't have access to dall-e-3」**
→ OpenAI の課金設定を確認（最低でも $5 入金が必要）。
