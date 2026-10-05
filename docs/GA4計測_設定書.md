# GA4 計測 設定書 — くらしの整理ナビ

対象: `iihinseiri.com` ／ GTM: **GTM-MCP38LG6** ／ GA4 測定ID: **G-P0HBQC3BJC**

この1ファイルに、GA4/GTM の設定手順をすべてまとめています。
（旧: `ga4-cta-affclick-setup.md` / `aff-src-setup.md` / `aff-scaling-ops-rules.md` を統合）

---

## 0. 前提（完了済み）

- GTM 公開済み・タグ設置済み（`src/layouts/Base.astro`）
- GA4 内部トラフィックのデータフィルタ **有効**
- 拡張計測機能 **ON**
- Search Console 連携

---

## 1. 何を計測するか

サイトの全CTAには、次の属性が最初から入っています（`AffLink.astro` / `StickyCta.astro` / `src/lib/aff.js` が自動付与）。**サイトの追加改修は不要**です。

| 属性 | 意味 | 例 |
|---|---|---|
| `data-aff` | 業者ID | `lifereset`, `curama` … |
| `data-aff-pos` | CTAの位置 | `review-hero`, `review-foot`, `compare-btn`, `sticky`, `header`, `drawer` |
| `data-aff-lp` | 用途別LPキー | `curama` の `cleaning` / `disposal` / `organizer` / `top` |
| `data-aff-src` | URLの出所 | `aff` / `aff-lp` / `official` / `internal` |
| `data-aff-external` | サイト外か | `1` のとき外部 |

これらを **`aff_click` という1つのイベント**にまとめて送ります（業者ごとにイベントを増やさないのが鉄則）。

---

## 2. GTM 設定

### 2-1. 変数（カスタム JavaScript）を5つ作る

**`aff_id`**
```js
function () { var a = {{Click Element}}.closest('a[data-aff]'); return a ? a.getAttribute('data-aff') : ''; }
```
**`aff_pos`**
```js
function () { var a = {{Click Element}}.closest('a[data-aff]'); return a ? (a.getAttribute('data-aff-pos') || '') : ''; }
```
**`aff_lp`**
```js
function () { var a = {{Click Element}}.closest('a[data-aff]'); return a ? (a.getAttribute('data-aff-lp') || '') : ''; }
```
**`aff_src`**
```js
function () { var a = {{Click Element}}.closest('a[data-aff]'); return a ? (a.getAttribute('data-aff-src') || '') : ''; }
```
**`aff_external`**
```js
function () { var a = {{Click Element}}.closest('a[data-aff]'); return a ? (a.getAttribute('data-aff-external') ? 'true' : 'false') : ''; }
```

> `{{Click Element}}` は「変数を追加」→「クリック要素」で挿入。テキストや内側の `<span>` をクリックしても `.closest()` が親の `<a data-aff>` を拾います。

### 2-2. トリガー（1つ）

- タイプ: **クリック - すべての要素**
- 条件: **Click Element** → **CSS セレクタに一致** → `a[data-aff], a[data-aff] *`
- 名前: `CTAクリック（data-aff）`

### 2-3. タグ（1つ）

- タイプ: **Google アナリティクス: GA4 イベント**
- タグの設定: **既存の Google タグを選択**（`G-P0HBQC3BJC`）
- イベント名: `aff_click`
- パラメータ:

| パラメータ名 | 値 |
|---|---|
| `aff_id` | `{{aff_id}}` |
| `aff_pos` | `{{aff_pos}}` |
| `aff_lp` | `{{aff_lp}}` |
| `aff_src` | `{{aff_src}}` |
| `aff_external` | `{{aff_external}}` |
| `link_url` | `{{Click URL}}` |

- 発火トリガー: `CTAクリック（data-aff）`
- タグ名: `GA4 - CTAクリック（aff_click）`

### 2-4. プレビュー → 公開

1. 右上「プレビュー」→ サイトを開く
2. CTAをクリック（比較表のボタン・レビューの上部CTA・追従バーなど）
3. 「Tags Fired」に `GA4 - CTAクリック（aff_click）` が出る
4. Variables で `aff_id` / `aff_pos` / `aff_src` に値が入っている（例: `aff_id=lifereset`, `aff_pos=review-foot`, `aff_src=official`）
5. **送信 → 公開してバージョンを作成**（例: `CTAクリック計測`）

---

## 3. GA4 側の設定

### 3-1. カスタムディメンション（「管理 → カスタム定義」／範囲は必ず **イベント**）

| ディメンション名 | イベントパラメータ |
|---|---|
| 業者ID | `aff_id` |
| CTA位置 | `aff_pos` |
| LP用途 | `aff_lp` |
| アフィリ区分 | `aff_src` |

※ `link_url` は標準パラメータなので登録不要。
※ 登録後に計測された分のみ表示されます（過去へは遡及しません）。

### 3-2. キーイベント化（任意）

「管理 → イベント」で `aff_click` にキーイベントのマークを付けると、ASPリンクのクリックを中間コンバージョンとして扱えます。

---

## 4. 見方

### 標準レポート
- **エンゲージメント → イベント → `aff_click`** を開く → イベント数・ユーザー数
- ディメンションに「業者ID」「CTA位置」「アフィリ区分」を選ぶと内訳が見える

### 探索（自由形式）で分解する

| 見たいもの | 行 | 列 | 値 | フィルタ |
|---|---|---|---|---|
| 業者 × 位置 | 業者ID | CTA位置 | イベント数 | `イベント名 = aff_click` |
| 業者 × 区分 | 業者ID | アフィリ区分 | イベント数 | `イベント名 = aff_click` |
| LPの強弱 | LP用途 | 業者ID | イベント数 | `イベント名 = aff_click` |

### 活用
- `official` のクリックが多い業者＝**ASP提携すると伸びる候補**（案件の優先順位づけに使える）
- 提携後に `aff` へ変わり、クリックが維持／増加していれば導線は機能している
- `aff-lp` で `curama` の用途別LPの強弱を比較

---

## 5. ページの滞在・離脱を見る

GA4には「離脱率」という単一指標はありません。次の2つで代替します。

| 知りたいこと | レポート | 指標 |
|---|---|---|
| ページ別の滞在 | エンゲージメント → **ページとスクリーン** | 平均エンゲージメント時間 |
| どこまで読まれたか | ページとスクリーン | スクロール数（90%到達時） |
| 入口ページの質 | エンゲージメント → **ランディングページ** | セッションあたりの平均エンゲージメント時間 |
| 業者ページの反応 | ページとスクリーン（行を「ページパス＋クエリ文字列」に） | `/reviews/…` を確認 |

> 90%だけでは粗い場合は、GTMの「スクロール深度」トリガー（25/50/75/90%）＋ `scroll_depth` イベントを追加すると離脱ポイントが掴めます。

---

## 6. 業者が増えても壊れない理由

GTMは「ボタン」ではなく **属性 `a[data-aff]` というルール**で拾っています。
新しいクライアントも同じ `AffLink` コンポーネント経由で `data-aff` を出力するため、**自動的に計測対象に加わります**。

| 項目 | 上限（無償版） | この設計 |
|---|---|---|
| イベントスコープのカスタムディメンション | 50個 | 最大4個で固定 |
| 1イベントあたりのパラメータ数 | 25個 | 6個程度 |
| イベント名の長さ | 40文字 | `aff_click` は8文字 |

出典: [収集の上限](https://www.ga4.guide/setting-implementation/data-limit/) ／ [カスタム イベント（公式）](https://support.google.com/analytics/answer/12229021?hl=ja)

---

## 7. トラブルシューティング

| 症状 | 確認点 |
|---|---|
| プレビューで発火しない | トリガーのCSSセレクタが `a[data-aff], a[data-aff] *` か。`data-aff` の無いリンクは対象外 |
| パラメータが空 | クリックした要素が `a[data-aff]` の中にあるか（`.closest()` の有無） |
| GA4に列が出ない | カスタムディメンションの**範囲=イベント**で登録したか／登録後の計測分のみ表示 |
| `aff_src` が全部空 | サイト側が未デプロイ。CTAを右クリック→検証で `data-aff-src` を確認 |
| `aff_external` が全部 `true` | 全社に `officialUrl` があるため仕様どおり。「ASP提携済みか」は `aff_src` で判別する |
