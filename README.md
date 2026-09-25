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

`main` にプッシュすると本番（Production）に反映されます。`main` 以外のブランチはプレビュー（Preview）になり、本番には出ません。

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
  "affUrl": ""         ← ここにASPの計測URLを貼る
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

- トップページ　「業者を比較する」の社名リンク
- ランキングページ　比較表の行・詳細ブロックの社名・「公式サイトを見る」
- レビュー記事　ヒーローCTA・末尾CTA・サイドバー
- 全ページ共通　ヘッダーの「一括見積はこちら」・ドロワー・追従バー（遷移先は `site.json` の `estimateAffId` で指定した業者）

### 対象11社のID

| ID | 業者名 | カテゴリ |
|---|---|---|
| `ihinnoseiriyasan` | 遺品の整理屋さん | 遺品整理 |
| `777fukujin` | ゴミ屋敷片付け七福神 | 遺品整理 |
| `lifereset` | ライフリセット | 遺品整理 |
| `ihin110` | 遺品整理110番 | 遺品整理 |
| `minnano` | みんなの遺品整理 | 遺品整理 |
| `emeao` | EMEAO!（エミーオ！） | 遺品整理 |
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

# 3. 業者を追加する

> **人もAIも、この章の順番どおりに作業してください。**
> 業者の追加で書き換えるのは **2ファイルだけ** です。
>
> | ファイル | 書くこと |
> |---|---|
> | `src/data/companies.json` | 業者の基本情報（名前・料金・特徴・リンク） |
> | `src/data/areas.json` | 業者の対応エリア（TOPの都道府県検索に使う） |
>
> **片方だけ書くのは禁止です。** `areas.json` に書き忘れると、その業者は「全国対応」として全都道府県に表示されます（エラーにはなりません）。

## 3-1. 公式サイトで調べること

**情報源は、その業者の公式サイトだけ**にしてください。比較サイトや口コミサイトの情報は使いません。
調べたら、確認したページのURLを必ず控えます。

| 調べること | 探す場所の例 | 書く先 |
|---|---|---|
| 業者名 | トップページ・会社概要 | `companies.json` の `name` |
| 料金の目安 | 料金ページ | `companies.json` の `price` / `shortPrice` / `specs` |
| サービスの形態（自社施工・仲介・フランチャイズ） | 会社概要・よくある質問 | `companies.json` の `serviceType` / `shortType` |
| **対応エリア** | 「対応エリア」「出張エリア」「店舗一覧」のページ | `areas.json`（3-3参照）と `companies.json` の `area` / `shortArea` |

## 3-2. `src/data/companies.json` に追加する

配列に1件足します。**配列の並び順が、サイトでの表示順**です（`rank` は並び順と同じ数字にしておきます）。

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
    { "label": "対応エリア", "value": "関東1都6県" }
  ],
  "price": "1K 20,000円〜",
  "area": "関東1都6県",
  "editorNote": "",
  "hasReview": false,
  "officialUrl": "https://example.com/",
  "affUrl": "",
  "shortType": "自社施工",
  "shortPrice": "1K 20,000円〜",
  "shortArea": "関東",
  "shortFeature": "短い特徴"
}
```

| 項目 | ルール |
|---|---|
| `id` | 半角英小文字・数字・ハイフンのみ。**`areas.json` のキーと完全に同じ文字**にする。画像・レビューのファイル名にも使う |
| `category` | 遺品整理・不用品回収は `ihin`、ハウスクリーニングは `cleaning` |
| `officialUrl` | 公式サイトのURL。`affUrl` が空のあいだのリンク先になる |
| `affUrl` | ASPの計測URL。未提携なら空 `""` |
| `hasReview` | レビュー本文を書いたら `true`（3-5参照） |

## 3-3. `src/data/areas.json` に対応エリアを書く

`companies` の中に、`id` と同じキーで1件足します。

### 対応エリアの判定ルール（上から順に当てはめる）

| 公式サイトの書き方 | `type` | ほかに書く項目 |
|---|---|---|
| 「全国対応」「47都道府県」など、全国と明記している | `"all"` | ― |
| 全国と書いてあるが、「一部地域を除く」「店舗により異なる」とある | `"all"` | `note` に「一部地域を除く」などと書く |
| 対応する都道府県を列挙している | `"list"` | `prefs` に都道府県名を並べる |
| 列挙した地域の外も「ご相談ください」「対応可能な場合あり」とある | `"list"` | `prefs` ＋ `"outside": "consult"` |
| 業者を紹介する仲介型で、紹介できる業者が地域で変わる | `"consult"` | `note` に説明 |
| 対応エリアの記載が見つからない | `"all"` | `"verified": false` と `note` に「要確認」 |

### 書き方のルール

- **都道府県名は正式名で書く。** 「東京」ではなく `"東京都"`、「大阪」ではなく `"大阪府"`、「北海道」はそのまま `"北海道"`。
  使える名前は、`areas.json` の `regions` に並んでいる47個だけです。1文字でも違うと、その県で表示されません。
- **「関東」「関西」など地方名だけが書かれている場合**
  - 公式サイトが「1都6県」「関東全域」などと範囲をはっきり書いている → `regions` の該当地方の都道府県をすべて書く
  - どの県が含まれるか分からない → 推測で広げない。公式サイトに明記されている都道府県だけを書き、`note` に「関東（詳細は要確認）」と書く
- **市区町村単位の記載**（例：「横浜市・川崎市」）→ その市区町村がある都道府県を書き、`note` に「神奈川県は横浜市・川崎市のみ」と書く
- `verified`：公式サイトで確認できたら `true`、確認できなかったら `false`
- `source`：対応エリアを確認したページのURL（必須）
- `checked`：確認した日付。`"2026-09-26"` の形で書く（任意だが推奨。定期的な見直しに使う）
- `core`：重点エリアの都道府県（任意。いまのTOPの表示には使っていないが、記録として残してよい）

### 書き方の例

```json
"newcompany": {
  "type": "list",
  "verified": true,
  "outside": "consult",
  "prefs": ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"],
  "note": "関東1都6県。その他の地域も相談可",
  "source": "https://example.com/area/",
  "checked": "2026-09-26"
}
```

### TOPの都道府県検索での表示のされ方

| `areas.json` の書き方 | 都道府県を選んだときの表示 |
|---|---|
| `type: "all"` | すべての都道府県で表示 |
| `type: "consult"` | すべての都道府県で表示 |
| `type: "list"` ＋ `outside: "consult"` | すべての都道府県で表示 |
| `type: "list"`（`outside` なし） | **`prefs` に書いた都道府県だけ**で表示 |
| `areas.json` に書いていない | すべての都道府県で表示（書き忘れに注意） |

- 表示の仕組みは `src/pages/index.astro` にあります（`areaAttr` と、ページ末尾の `<script>`）。
- **TOPに出るのは、各カテゴリで条件に合う業者のうち、`companies.json` の並び順で上から5社まで**です。6社目以降は「比較表を見る」から見られます。新しい業者をTOPに出したい場合は、`companies.json` の中で5番目以内に置きます。

## 3-4. 画像（任意）

`public/images/companies/{id}.webp`（横4：縦3、800×600px 目安）を置くと、比較ページの写真枠に表示されます。無いあいだは仮の枠が表示されます。

## 3-5. レビューを書く場合（任意）

`src/content/reviews/{id}.html` を作り、`companies.json` の `hasReview` を `true` にします。
レビューページとサイトマップへの追加は自動です。

## 3-6. 追加したあとの確認

1. `node scripts/check-areas.mjs` を実行し、`OK` と出ることを確認する（書き忘れ・都道府県名の誤りを見つけるスクリプト）
2. `npm run build` がエラーなく終わる
3. 画面で確認する
   - TOPで、対応エリアに**含まれる**県を選ぶ → 表示される
   - `type: "list"` の場合は、対応エリアに**含まれない**県を選ぶ → 表示されない
   - 比較ページ（`/rankings/ihin.html` または `/rankings/cleaning.html`）に載っている
   - 社名リンクの行き先が正しい

## 3-7. 対応エリアの見直し

対応エリアは業者の都合で変わります。**半年に1回**を目安に、各社の `source` のページを開き、`areas.json` と食い違いがないか確認してください。
確認したら `checked` の日付を更新し、TOPの注記（`index.astro` の「2026年9月時点」）も書き換えます。

---

# 4. 日常の更新作業

## 更新日の表示

ヘッダー右上の「更新日：」は `public/assets/site.js` がビルド日から自動生成します（`data-today` 属性）。記事ごとの公開日・更新日は表示していません。

## 記事を追加する

1. `src/content/articles/{slug}.html` に本文を置く
2. `src/data/pages.json` の**末尾**に1件足す（`type: "article"`）。末尾ほど新しい記事として、TOPの「新着・人気記事」と記事一覧の先頭に出ます
3. アイキャッチ画像を `public/images/articles/{slug}.webp`（800×500px 目安）に置く
4. フッターに載せる場合は、`src/data/site.json` の `footer` →「お役立ち情報」に足す

サイトマップと記事一覧（`/articles.html`）には自動で追加されます。

## CSS・JSを変えたとき

`src/data/site.json` の `assetVersion` を新しい値（例：`20260926a`）に変えると、ブラウザに古いファイルが残らなくなります。

---

## ディレクトリ構成

```
src/
  data/
    site.json          サイト名・ナビ・フッター・アセットのバージョン・一括見積の遷移先
    companies.json     ★企業データとアフィリエイトURL（唯一の情報源）
    areas.json         ★各社の対応エリアと都道府県の一覧（TOPの地域検索）
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
    index.astro             トップページ（地域から探す）
    articles.astro          記事一覧 /articles.html
    sitemap.xml.js          サイトマップ（pages.json / companies.json から自動生成）
    rankings/[slug].astro   ihin / cleaning
    reviews/[slug].astro    companies.json の全社分を自動生成
    articles/[slug].astro
scripts/
  check-areas.mjs      companies.json と areas.json の整合チェック
public/
  assets/styles.css      共通CSS（PRバッジ・免責表記・TOPへ戻るボタンのスタイルを含む）
  assets/page-*.css      ページ種別ごとのCSS
  assets/home.css        トップページ・記事一覧のCSS
  assets/site.js         日付自動更新・ドロワー・スクロール演出・計測・TOPへ戻るボタン
  images/brand/logo.png  ヘッダーロゴ
```

## URL は旧版と同一

`build.format: 'file'` を指定しているため `/articles/akutoku.html` 形式のURLが維持されます。リダイレクト設定は不要です。
