# 拡張運用ルール — クライアント増加・AFFリンク差し替えに強い構成

対象: `iihinseiri.com`（Astro / Cloudflare Pages）
関係する仕組み: `src/data/companies.json`（唯一の出典）＋ `AffLink.astro` / `src/lib/aff.js`（ビルド時解決）＋ GTM（属性を読むだけ）

---

## 結論：いまの設計のままで、ほぼ無改修でスケールします

このサイトは **「URLをコンテンツに書かない」設計がすでに入っています**。だから ①素リンク→AFFリンク差し替え も ②クライアント増加 も、**触る場所が1箇所に集約**できます。

```
src/data/companies.json          ← 唯一のURL管理場所（affUrl / officialUrl / affLp）
        ↓ ビルド時に解決
AffLink.astro ／ src/lib/aff.js  ← ここが href を組み立てる（編集不要）
        ↓
全ページの CTA（比較表・ランキング・レビュー・追従バー・ヘッダー）
        ↓ 同じ data-aff / data-aff-pos / data-aff-lp を出力
GTM（a[data-aff] を読むだけ）    ← クライアントが増えても編集不要
        ↓
GA4 aff_click（aff_id × aff_pos × aff_lp）
```

**なぜGTMを触らなくて済むのか:** GTMは「特定のボタン」ではなく **属性 `a[data-aff]` というルール**で拾っています。新しいクライアントも同じ `AffLink` コンポーネント経由で `data-aff` を出すので、**自動的に対象になる**。GA4側も、パラメータの「名前」は固定で「値」だけ増えるため、カスタムディメンションの追加登録は不要です。

---

## 鉄則 3つ

| # | 鉄則 | 理由 |
|---|---|---|
| 1 | **URLをコンテンツHTMLに直接書かない**。必ず `data-aff="{業者ID}"` を使う | URLが変わっても1箇所の修正で済む |
| 2 | **`companies.json` 以外にURLを置かない** | 「どこを直せばいいか」が常に1つになる |
| 3 | **業者ごとにGTMイベントを増やさない**。イベント名は `aff_click` 1本のまま | 業者20社→イベント20本は破綻する（後述の上限・アンチパターン） |

---

## ① 素リンク → アフィリエイトリンク への差し替え

### やること（1箇所だけ）

`src/data/companies.json` の該当社の `affUrl` を、ASPが発行した計測URLに書き換える。

```jsonc
{
  "id": "ihinnoseiriyasan",
  "affUrl": "https://px.a8.net/svt/ejp?a8mat=XXXXXX",   // ← ここだけ
  "officialUrl": "https://ihinnoseiriyasan.example/",   // 残しておく（フォールバック）
  "hasReview": true
}
```

これだけで、その社の **比較表・ランキング詳細・レビュー記事・追従バー・ヘッダー** の全CTAが一括で切り替わります（`AffLink.astro` と `src/lib/aff.js` の優先順位: `affLp[用途] → affUrl → officialUrl → サイト内`）。

### 用途別LPを持つ社

複数のLPを持ち回りたい社は `affLp` にキーを追加し、コンテンツ側で `data-aff-lp` を指定します。

```jsonc
{
  "id": "curama",
  "affUrl": "https://.../default",
  "affLp": {
    "top":      "https://.../lp-top",
    "cleaning": "https://.../lp-cleaning",
    "disposal": "https://.../lp-disposal",
    "organizer":"https://.../lp-organizer"
  }
}
```
```html
<a data-aff="curama" data-aff-lp="cleaning" data-aff-pos="review-body-cleaning" ...>
```

`affLp` に入れた用途は **GA4で `aff_lp` として見える**ので、「清掃LPと遺品LP、どちらが押されるか」を比較できます。

### 差し替え時の検証（3点）

1. ブラウザで実際に踏み、ASPへ正しく遷移するか
2. 踏んだあと **GTMプレビューで `aff_click` が発火**し、`aff_id` が正しい業者IDか
3. `rel="sponsored nofollow noopener"` と `target="_blank"` が付いているか（`AffLink` が自動付与。手書きリンクには付かないので注意）

---

## ② クライアントを追加する

### 手順

| # | 作業 | 備考 |
|---|---|---|
| 1 | `src/data/companies.json` に1件追加 | `category` を `ihin` / `cleaning` から選ぶ。**配列の並び順＝ランキング順** |
| 2 | 画像を `public/images/companies/{id}.webp` に置く | 無くても `onerror` で代替表示。後追い可 |
| 3 | レビュー記事を作る場合 `src/content/reviews/{id}.html` を作成し `"hasReview": true` | `data-aff="新ID"` でCTAを書く |
| 4 | 比較記事に入れたい場合は `category` を合わせるだけ | `CompareTable.astro` が自動で行を追加 |
| 5 | デプロイ → GTMプレビューで `aff_click` の `aff_id` に新IDが出るか確認 | **GTM側の作業はゼロ** |

### 追加時に決める命名（固定ルールにする）

| 項目 | ルール | 例 |
|---|---|---|
| `id` | 英小文字・ハイフンなし・**一度決めたら変えない**（GA4の過去データと紐づくため） | `ihinnoseiriyasan`, `curama` |
| `category` | `ihin` / `cleaning` のいずれか（増やす場合はGA4の見方もセットで追加） | `cleaning` |
| `data-aff-pos` | `場所-詳細` 形式。**語彙を決めて増やす**（無秩序に増やさない） | `review-hero`, `rank-3-btn` |

> `id` を変えると、GA4上の「同じ業者」が別物として分断されます。**IDは不変**が原則です。

---

## アンチパターン（やらないこと）

| やってはいけない | なぜダメか |
|---|---|
| 業者ごとにイベント名を分ける（`aff_click_lifereset`） | イベント管理が破綻する。**1イベント＋パラメータで分解**が正解 |
| コンテンツHTMLに `href="https://px.a8.net/..."` を直書き | 差し替え時に全ファイル検索地獄。`data-aff` を使う |
| `data-aff-pos` を場当たり的に増やす | 値が増えすぎると集計不能。語彙を決める |
| 業者IDを後から変更する | GA4の時系列が分断される。IDは不変 |

---

## 推奨の小さな改修（任意・やるなら設置前が最適）

### A. `aff_src` を追加して「AFF計測URLか / 公式サイト直リンクか」を分離

いまは全社に `officialUrl` があるため `aff_external` が常に `true` で、**ASP提携済みかどうかをGA4で区別できません**。そこで「URLの出所」を持たせます。

**`src/components/AffLink.astro`**（`const external = ...` の下に1行追加）
```astro
const src = lpUrl ? 'aff-lp' : c.affUrl ? 'aff' : c.officialUrl ? 'official' : 'internal';
```
`<a ...>` に属性を1つ追加
```astro
data-aff-src={src}
```

**`src/lib/aff.js`**（`const external = ...` の下に1行追加）
```js
const src = lpUrl ? 'aff-lp' : c.affUrl ? 'aff' : c.officialUrl ? 'official' : 'internal';
```
属性を組み立てている箇所に1行追加
```js
attrs.push('data-aff-src="' + src + '"');
```

**GTM**: 変数 `aff_src` を追加（他と同じ書き方）
```js
function () {
  var a = {{Click Element}}.closest('a[data-aff]');
  return a ? (a.getAttribute('data-aff-src') || '') : '';
}
```
GA4のカスタムディメンションに **「アフィリ区分」= `aff_src`** を1つ追加。

→ これで「**ASP計測URLのクリック**」と「**公式サイト直リンクのクリック**」を分けて集計でき、提携前後で比較できます。（未改修でも空文字で動くので、後から入れても壊れません）

### B. 直書きURLの混入を防ぐビルドチェック

`scripts/check-aff-links.mjs`（新規）を作り、`package.json` の `build` 前に走らせます。URLの直書きを検知して落とす仕組みです。

```js
// scripts/check-aff-links.mjs
// data-aff の無い外部リンク / href="#" のAFFリンク化漏れ を検出する
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src/content', 'src/pages', 'src/components'];
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|astro)$/.test(p)) files.push(p);
  }
})(ROOTS[0]);

let bad = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  // 外部リンクなのに data-aff が無い（＝URL直書き）
  for (const m of src.matchAll(/<a\b[^>]*href="https?:\/\/[^"]+"[^>]*>/g)) {
    if (!/data-aff=/.test(m[0]) && !/data-detail=/.test(m[0])) {
      console.log(`[warn] 直書きURL: ${f}\n  ${m[0].slice(0, 120)}`);
      bad++;
    }
  }
}
if (bad) {
  console.log(`\n外部リンクの直書きが ${bad} 件。data-aff 経由にしてください。`);
  process.exit(1);
}
console.log('OK: 外部リンクはすべて data-aff 経由です');
```

`package.json`:
```json
"scripts": { "build": "node scripts/check-aff-links.mjs && astro build" }
```

> このチェックは「URLが本文に散ると運用が破綻する」という本質問のリスクを、**ビルドで自動的に防ぐ**ためのものです。

---

## GA4 / GTM の上限（増えても壊れない範囲）

| 項目 | 上限（無償版） | この設計での見込み |
|---|---|---|
| イベントスコープのカスタムディメンション | **50個** | `aff_id` / `aff_pos` / `aff_lp`（＋`aff_src`）= **最大4個**で固定 |
| 1イベントあたりのイベントパラメータ数 | **25個** | `aff_click` は5個程度 |
| イベント名の長さ | 40文字 | `aff_click` は8文字 |
| 値が500個を超えるディメンション | 高基数扱い（「(other)」集約・サンプリングのおそれ） | 業者ID＝数十、位置＝十数、LP＝数個。**余裕** |

出典: [収集の上限（ga4.guide）](https://www.ga4.guide/setting-implementation/data-limit/) ／ [カスタム イベント（公式）](https://support.google.com/analytics/answer/12229021?hl=ja)

> **重要:** 業者ごとにイベントを増やすと50個のディメンション枠が枯渇し、後から本当に見たい指標を登録できなくなります。「1イベント × パラメータ分解」を守れば、クライアントが20社・50社に増えても **GA4側の追加設定は不要**です。

---

## 運用チェックリスト（コピペ用）

**クライアントを足したとき**
- [ ] `companies.json` に1件追加（`id` は不変ルールで命名、`category` を選択、配列位置＝順位）
- [ ] `public/images/companies/{id}.webp` を配置（任意）
- [ ] レビュー記事があれば `hasReview: true` ＋ `src/content/reviews/{id}.html`
- [ ] 本文CTAは `data-aff="{id}"` ＋ `data-aff-pos="場所-詳細"` で書く
- [ ] デプロイ後、GTMプレビューで `aff_id` に新IDが出ることを確認
- [ ] **GTM・GA4の設定は変更しない**

**AFFリンクに差し替えたとき**
- [ ] `companies.json` の `affUrl` のみ変更（複数LPは `affLp` に追加）
- [ ] 実クリックしてASPへ遷移することを確認
- [ ] `aff_click` の `aff_id` が正しいか確認
- [ ] （`aff_src` 導入済みなら）`aff_src` が `official` → `aff` に変わることを確認
