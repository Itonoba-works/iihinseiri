# くらしの整理ナビ（Astro版）

## セットアップ

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/ に静的HTMLを出力
```

## Cloudflare Pages の設定

| 項目 | 値 |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20 以上（環境変数 `NODE_VERSION=20`） |

---

# 1. アフィリエイトURLの差し替え

## 書き換えるファイルは1つだけ

```
src/data/companies.json
```

各社の `affUrl` にASPの計測URLを入れる。**それ以外のファイルは触らない。**

```json
{
  "id": "ihinnoseiriyasan",
  "name": "遺品の整理屋さん",
  "affUrl": "",        ← ここにASPの計測URLを貼る
  "asp": ""            ← 管理用メモ（A8.net 等）。出力されない
}
```

## affUrl を入れると自動で切り替わるもの

| | affUrl が空（現在） | affUrl に計測URLあり |
|---|---|---|
| リンク先 | 自社レビュー記事／ランキング内アンカー | ASPの計測URL |
| `rel` | なし | `sponsored nofollow noopener` |
| `target` | なし | `_blank` |
| PRラベル | 出ない | ボタンに自動で付く |
| 記事のPR表記・免責 | 出ない | 全記事に自動で出る |

## 反映される箇所（1社あたり）

`affUrl` を1行書き換えると、その業者の以下すべてが同時に切り替わります。手作業の置換は不要です。

- トップページ　ランキング上位3社の社名リンク・「公式サイトを見る」
- ランキングページ　比較表の行・詳細ブロックの社名・「公式サイトを見る」
- レビュー記事　ヒーローCTA・末尾CTA・サイドバー
- 全ページ共通　ヘッダーの「一括見積もりはこちら」・ドロワー・追従バー（遷移先は `site.json` の `estimateAffId` で指定した業者）

### 対象11社のID

| ID | 業者名 | カテゴリ |
|---|---|---|
| `ihinnoseiriyasan` | 遺品の整理屋さん | 遺品整理 |
| `777fukujin` | ゴミ屋敷片付け七福神 | 遺品整理 |
| `liferesetro` | ライフリセット | 遺品整理 |
| `ihin110` | 遺品整理110番 | 遺品整理 |
| `minnano` | みんなの遺品整理 | 遺品整理 |
| `emeao` | EMEAO（イーミーオ） | 遺品整理 |
| `migakuru` | ミガクる | ハウスクリーニング |
| `osoujikakumei` | おそうじ革命 | ハウスクリーニング |
| `osoujihonpo` | おそうじ本舗 | ハウスクリーニング |
| `yourmystar` | ユアマイスター | ハウスクリーニング |
| `kajitaku` | カジタク | ハウスクリーニング |

---

# 2. PR表記はどこに入るか

ステマ規制（景品表示法）対応として、**アフィリエイトリンクが1件でも有効になった時点で自動表示**されます。`companies.json` に `affUrl` が1つ入れば判定が切り替わるため、PRのための書き換えは不要です。

## 自動で出る3箇所

| 箇所 | 表示 | 判定条件 | 実装ファイル |
|---|---|---|---|
| ボタン内 | `PR` バッジ（ボタン左） | その業者の `affUrl` が入っているとき | `src/components/AffLink.astro` |
| ヘッダー／ドロワー／追従バー | `PR` バッジ | `estimateAffId` の業者の `affUrl` が入っているとき | `Header.astro` / `StickyCta.astro` |
| 記事タイトル直下と記事末尾 | `PR` タグ＋免責文 | **どこか1社でも** `affUrl` が入っているとき | `src/layouts/ArticleLayout.astro` |

社名のテキストリンクにはPRを付けていません（ボタンのみ）。個別に付けたい場合は `<AffLink id="..." pr={true}>` と書けます。

## 手動で切り替えたいとき

`src/data/site.json` に次の2つを足すと上書きできます。どちらも省略可です。

```json
{
  "affiliateActive": true,
  "affiliateDisclosure": "本サイトはアフィリエイトプログラムに参加しており、…"
}
```

- `affiliateActive: true` … affUrl が空でもPR表記を出す（申請中に先出しする場合）
- `affiliateActive: false` … affUrl が入っていてもPR表記を出さない
- `affiliateDisclosure` … 記事末尾の免責文を差し替える（既定文は ArticleLayout に記載）

---

### AFFILIATE_LINKS.md との関係

`AFFILIATE_LINKS.md` は業者IDとASP候補の管理表として引き続き使えますが、
同ファイルの「ステップ3: 一括置換（sed 等で）」と「各ページの `href="#"` を差し替える」という手順は
**現在のAstro版では不要**です。`companies.json` の `affUrl` 1箇所で全ページに反映されます。

---

# 3. 日常の更新作業

## 企業を追加する

`src/data/companies.json` に1件足すだけで、比較表・詳細ブロック・レビューページ・サイドバー・「6社」の件数表示まで自動反映されます。

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
  "specs": [{ "label": "料金目安（公式）", "value": "1K 20,000円〜" }],
  "shortType": "自社施工",
  "shortPrice": "1K 20,000円〜",
  "shortArea": "全国",
  "shortFeature": "短い特徴",
  "hasReview": false,
  "affUrl": "",
  "asp": ""
}
```

本文を書く場合は `src/content/reviews/newcompany.html` を作り、`hasReview` を `true` に。

## 更新日の表示

ヘッダー右上の「更新日：」は `public/assets/site.js` がビルド日から自動生成します（`data-today` 属性）。記事ごとの公開日・更新日は表示していません。

---

## ディレクトリ構成

```
src/
  data/
    site.json          サイト名・ナビ・フッター・アセットのバージョン・一括見積の遷移先
    companies.json     ★企業データとアフィリエイトURL（唯一の情報源）
    pages.json         各ページのタイトル・H1・要点
  layouts/
    Base.astro         <head>・ヘッダー・フッター・スクリプト
    ArticleLayout.astro 記事レイアウト（PR表記・免責の自動表示を含む）
  components/
    Header.astro / Footer.astro / StickyCta.astro
    AffLink.astro      ★企業リンクはすべてこれ経由（PRバッジ自動付与）
    CompareTable.astro / CompanyBlock.astro / Sidebar.astro / KeyPoints.astro
    SmartImage.astro   画像プレースホルダ
  content/
    articles/*.html    記事本文
    reviews/*.html     レビュー本文
    rankings/*.intro.html / *.outro.html
  pages/
    index.astro
    rankings/[slug].astro   ihin / cleaning
    reviews/[slug].astro    companies.json の全社分を自動生成
    articles/[slug].astro
public/
  assets/styles.css      共通CSS（PRバッジ・免責表記のスタイルを含む）
  assets/page-*.css      ページ種別ごとのCSS
  assets/site.js         日付自動更新・ドロワー・スクロール演出・計測
  images/brand/logo.png  ヘッダーロゴ
```

## URL は旧版と同一

`build.format: 'file'` を指定しているため `/articles/akutoku.html` 形式のURLが維持されます。リダイレクト設定は不要です。
