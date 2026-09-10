# くらしの整理ナビ（Astro版）

## セットアップ

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/ に静的HTMLを出力
```

## Cloudflare Pages の設定変更

| 項目 | 変更後 |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20 以上（環境変数 `NODE_VERSION=20`） |

## 日常の作業はこの2つだけ

### 企業を追加する（例：21社目）

`src/data/companies.json` に1件足すだけです。

```json
{
  "id": "newcompany",
  "name": "新しい会社",
  "category": "ihin",
  "rank": 7,
  "top": false,
  "catch": "キャッチコピー",
  "serviceType": "自社施工",
  "intro": "紹介文（HTMLタグ可）",
  "features": ["特徴1", "特徴2"],
  "specs": [
    { "label": "料金目安（公式）", "value": "1K 20,000円〜" },
    { "label": "対応エリア", "value": "全国" }
  ],
  "shortType": "自社施工",
  "shortPrice": "1K 20,000円〜",
  "shortArea": "全国",
  "shortFeature": "短い特徴",
  "hasReview": false,
  "affUrl": "",
  "asp": ""
}
```

これだけで自動的に反映される場所：

- `/rankings/ihin.html` の比較表に1行
- 同ページの詳細ブロック
- `/reviews/newcompany.html` が新規生成（料金表とCTAだけのページ）
- 全ページのサイドバーのランキング
- 見出しの「6社」が「7社」に

文章を足したいときは `src/content/reviews/newcompany.html` を作り、
`hasReview` を `true` にします。

### アフィリエイトリンクを設定する

`companies.json` の `affUrl` にASPの計測URLを入れるだけです。

- `affUrl: ""` → 自社レビュー記事への内部リンク（リンク切れゼロ）
- `affUrl` に値あり → 外部リンク + `rel="sponsored nofollow noopener"` + `target="_blank"` を自動付与

**旧版との違い**：以前は `affiliates.js` がブラウザ上でリンクを書き換えていたため、
検索エンジンからはリンクが空に見えていました。Astro版はビルド時に本物の `<a href>` になります。

## ディレクトリ構成

```
src/
  data/
    site.json          サイト名・ナビ・フッター・アセットのバージョン
    companies.json     ★企業データ（ここが唯一の情報源）
    pages.json         各ページのタイトル・公開日・要点
  layouts/
    Base.astro         <head>・ヘッダー・フッター・スクリプト
    ArticleLayout.astro 記事レイアウト（本文＋サイドバー）
  components/
    Header.astro / Footer.astro / StickyCta.astro
    AffLink.astro      ★企業名リンクはすべてこれ経由
    CompareTable.astro 比較表を自動生成
    CompanyBlock.astro ランキング詳細ブロックを自動生成
    Sidebar.astro / KeyPoints.astro
  content/
    articles/*.html    記事本文
    reviews/*.html     レビュー本文
    rankings/*.intro.html / *.outro.html   ランキングの前後の文章
  pages/
    index.astro
    rankings/[slug].astro   ihin / cleaning
    reviews/[slug].astro    ★companies.json の全社分を自動生成
    articles/[slug].astro
public/
  assets/styles.css    共通CSS
  assets/home.css      トップページ専用
  assets/site.js       日付自動更新・ドロワー・スクロール演出・計測
```

## URL は旧版と同一

`build.format: 'file'` を指定しているため、`/articles/akutoku.html` のような
既存のURLがそのまま維持されます。リダイレクト設定は不要です。

## 移行時にリポジトリから削除するもの

```
index.html
rankings/  reviews/  articles/
assets/styles.css  assets/site.js  assets/affiliates.js  assets/home.css
assets/app.jsx  assets/tweaks_panel.jsx
```

（このフォルダの中身がすべて置き換えます）
