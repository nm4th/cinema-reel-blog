# SETUP ― 初回セットアップ手順

## 1. ローカル動作確認

```bash
npm install
npm run dev
```

- トップ: http://localhost:4321/
- ブログ: http://localhost:4321/blog/

## 2. GitHub リポジトリへ push

```bash
git remote add origin https://github.com/<USER>/cinema-reel-blog.git
git push -u origin main
```

## 3. GitHub Secrets の登録

リポジトリ Settings → Secrets and variables → Actions → New repository secret

- `FTP_SERVER` ― お名前.com RSプランの FTP ホスト名
- `FTP_USERNAME` ― FTP ユーザー名（例: `3m63g_r9262022` 系）
- `FTP_PASSWORD` ― FTP パスワード

FTP情報はお名前.com Navi の「サーバー設定」→「FTPアカウント設定」で確認。

## 4. 初回デプロイ

main ブランチへの push で GitHub Actions が起動し、`/public_html/cinema-reel.com/` に FTP 配置されます。

GitHub の Actions タブでビルドログを確認し、緑チェックになったら https://cinema-reel.com/ にアクセスして反映を確認。

## 5. Search Console 登録（公開後）

1. https://search.google.com/search-console
2. プロパティ追加 → URL プレフィックス → `https://cinema-reel.com/`
3. HTMLタグ方式で所有権確認 → タグの内容を `src/layouts/Layout.astro` の `<head>` に追加 → push して反映 → 確認
4. サイトマップ送信 → `sitemap-index.xml` を送信
5. URL検査 → 主要ページをインデックス申請

## 6. Google Analytics（任意）

`src/layouts/Layout.astro` の `<head>` に GA4 のタグを追加。

## トラブルシューティング

### デプロイは成功したのに反映されない
- ブラウザのキャッシュをクリア
- お名前.com Navi の FTP で `/public_html/cinema-reel.com/index.html` のタイムスタンプを確認
- `dist/` 内のローカルビルド結果と比較

### .htaccess が消える
- GitHub Actions の `exclude` で `.htaccess` を除外しているので、サーバー側の既存ファイルは保持されるはず
- 万一消えた場合は、お名前.com Navi の FTP で以下を再配置:

```apache
RewriteEngine On
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

### Formspree から確認メールが来ない
- 初回は Formspree 側で受信先メール（jesuisallerajapon@yahoo.co.jp）の確認が必要
- フォーム ID `xqewogvj` に間違いがないか `src/pages/index.astro` で確認
