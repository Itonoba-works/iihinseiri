# GA4 CTAクリック計測 設定書 — `data-aff` を活用

対象サイト: `iihinseiri.com`（くらしの整理ナビ）
GTM コンテナ: **GTM-MCP38LG6** ／ GA4 測定ID: **G-P0HBQC3BJC**
前提（完了済み）: GTM公開済み・GA4内部トラフィック有効・拡張計測機能ON

---

## 0. なぜサイト改修が不要か

サイトの全CTAには、もともと次の属性が入っています（`src/components/AffLink.astro` / `StickyCta.astro` / `src/lib/aff.js` が自動付与）。

| 属性 | 意味 | 例 |
|---|---|---|
| `data-aff` | 業者ID | `ihinnoseiriyasan`, `curama`, `migakuru` … |
| `data-aff-pos` | CTAの設置位置 | `review-hero`, `review-foot`, `compare-btn`, `sticky`, `header`, `drawer` |
| `data-aff-lp` | 用途別LPキー | `curama` の `cleaning` / `disposal` / `organizer` / `top` |
| `data-aff-external` | **サイト外への遷移か**（ASP計測URLか公式サイト直リンクかは問わない） | `1` のとき外部 |

GTMはこの属性を読むだけでよいので、**サイト側のコード変更・再デプロイは不要**です。

---

## 1. 実在する業者ID（12社）

ihinnoseiriyasan / 777fukujin / lifereset / ihin110 / minnano / emeao / curama / osoujikakumei / osoujihonpo / yourmystar / migakuru / kajitaku

## 2. 実在する `data-aff-pos`（設置位置）

**記事コンテンツ側（静的HTML）**
- `review-hero` … レビュー記事の上部CTA
- `review-foot` … レビュー記事の末尾CTA
- `review-body-cleaning` / `review-body-disposal` / `review-body-organizer` … 本文中（用途別LP、curama）
- `review-osouji` … 本文中（おそうじ系、kajitaku）

**コンポーネント自動生成側**
- `header` … ヘッダー右上CTA
- `drawer` … スマホ用ドロワー内CTA
- `sticky` … 画面下の追従バーCTA
- `compare-name` / `compare-btn` … 比較表の名称リンク／ボタン
- `rank-1-name` ～ `rank-N-name` / `rank-1-btn` ～ `rank-N-btn` … ランキング詳細ブロック
- `top-ihin-name` / `top-cleaning-name` … トップページのカード名称リンク

> `data-aff-pos` が付かないリンクもあります（`AffLink` に `pos` を渡していない箇所）。未設定は空文字として記録されます。位置を増やしたい場合は該当コンポーネントに `pos` を追記すれば、次回デプロイから反映されます。

---

## 3. GTM 設定（コピペ用）

### 3-1. 変数①〜④（変数のタイプ: カスタム JavaScript）

**変数名 `aff_id`**
```js
function () {
  var a = {{Click Element}}.closest('a[data-aff]');
  return a ? a.getAttribute('data-aff') : '';
}
```

**変数名 `aff_pos`**
```js
function () {
  var a = {{Click Element}}.closest('a[data-aff]');
  return a ? (a.getAttribute('data-aff-pos') || '') : '';
}
```

**変数名 `aff_lp`**
```js
function () {
  var a = {{Click Element}}.closest('a[data-aff]');
  return a ? (a.getAttribute('data-aff-lp') || '') : '';
}
```

**変数名 `aff_external`**
```js
function () {
  var a = {{Click Element}}.closest('a[data-aff]');
  return a ? (a.getAttribute('data-aff-external') ? 'true' : 'false') : '';
}
```

> `{{Click Element}}` は「変数を追加」→「クリック要素」で挿入できます。テキストや `<span>` をクリックしても `.closest()` が親の `<a data-aff>` を拾います。

### 3-2. トリガー（1つ）

- トリガーのタイプ: **クリック - すべての要素**
- このトリガーを発生させる条件:
  - **Click Element** → **CSS セレクタに一致** → `a[data-aff], a[data-aff] *`
- 名前: `CTAクリック（data-aff）`

### 3-3. タグ（1つ）

- タグのタイプ: **Google アナリティクス: GA4 イベント**
- タグの設定: **既存の Google タグを選択**（`G-P0HBQC3BJC` の Google タグ）
- イベント名: `aff_click`
- イベントパラメータ:

| パラメータ名 | 値 |
|---|---|
| `aff_id` | `{{aff_id}}` |
| `aff_pos` | `{{aff_pos}}` |
| `aff_lp` | `{{aff_lp}}` |
| `aff_external` | `{{aff_external}}` |
| `link_url` | `{{Click URL}}` |

- 発火トリガー: `CTAクリック（data-aff）`
- タグ名: `GA4 - CTAクリック（aff_click）`

### 3-4. プレビュー確認

1. GTM右上「プレビュー」→ サイトを開く
2. 任意のCTAをクリック（例: 比較表の「公式サイト」ボタン、レビュー記事の上部CTA、追従バー）
3. 「Tags Fired」に `GA4 - CTAクリック（aff_click）` が出る
4. Variables タブで `aff_id` / `aff_pos` / `aff_lp` / `aff_external` に値が入っている
   - 例: `aff_id = lifereset`、`aff_pos = review-foot`
5. 問題なければ **送信 → 公開してバージョンを作成**（例: `CTAクリック計測`）

---

## 4. GA4 側：カスタムディメンション登録（必須）

「管理 → カスタム定義 → カスタムディメンションを作成」で **範囲 = イベント** にして3つ登録します。

| ディメンション名（任意） | 範囲 | イベントパラメータ |
|---|---|---|
| 業者ID | イベント | `aff_id` |
| CTA位置 | イベント | `aff_pos` |
| LP用途 | イベント | `aff_lp` |

※ `link_url` は GA4 の標準パラメータなので登録不要（そのままディメンションとして使えます）。

これで **「どの業者の・どの位置のCTAが押されたか」** がレポートに出ます。

---

## 5. 見方（標準レポート）

- **レポート → エンゲージメント → イベント** で `aff_click` をクリック → イベント数・ユーザー数
- ディメンションで `業者ID` / `CTA位置` / `LP用途` を選ぶと内訳が見える
- 外部遷移だけ見たいときは、フィルタで `aff_external = true` を指定

### 探索（自由形式）で「業者 × 位置」を集計

| 項目 | 設定 |
|---|---|
| 手法 | 自由形式 |
| 行 | `業者ID` |
| 列 | `CTA位置` |
| 値 | `イベント数` |
| フィルタ | `イベント名` 次と一致 `aff_click` |

これで「どの業者の、どの位置のCTAが強いか」がマトリクスで見えます。さらに **セッションのデフォルト チャネル グループ**を列に足せば、流入元別のCTA反応も測れます。

---

## 6. ページの滞在・離脱を見る（標準レポート）

| 知りたいこと | レポート | 備考 |
|---|---|---|
| ページ別の滞在 | エンゲージメント → **ページとスクリーン** | 指標「平均エンゲージメント時間」 |
| どこまで読まれたか | ページとスクリーン | 列「スクロール数」（90%到達時） |
| 入口ページの質 | エンゲージメント → **ランディングページ** | セッションあたりの平均エンゲージメント時間 |
| 業者ページの反応 | ページとスクリーンで行を「ページパス＋クエリ文字列」に切替 | `/reviews/…` を確認 |

> GA4には「離脱率」という単一指標はありません。**平均エンゲージメント時間 × スクロール数**で「読まずに帰られたページ」を推定します。
> 90%だけでは粗い場合は、GTMの「スクロール深度」トリガー（25/50/75/90%）＋ `scroll_depth` イベントを追加すると離脱ポイントが掴めます。

---

## 7. キーイベント（コンバージョン）化 — 任意

「管理 → イベント」で受信した `aff_click` の「キーイベントとしてマークを付ける」をONにすると、ASPリンクのクリック＝中間コンバージョンとして、流入元別の成果を測れます。

---

## 8. うまくいかないときのチェック

| 症状 | 確認点 |
|---|---|
| プレビューで発火しない | トリガーのCSSセレクタが `a[data-aff], a[data-aff] *` になっているか。`data-aff` の無いリンク（`data-detail` のみ等）は対象外です |
| パラメータが空 | クリックした要素が `a[data-aff]` の中にあるか。`.closest()` が入っているか |
| GA4のレポートに列が出ない | カスタムディメンションの**範囲=イベント**で登録したか／登録後に計測された分のみ表示（過去には遡及しません） |
| `aff_external` が全部 `true` になる | **現状は全12社に `officialUrl` があるため、全CTAが `true`**（ASP URLでも公式サイト直リンクでも外部遷移）。`false` になるのは `affUrl` も `officialUrl` も未設定の社だけ。**「ASP計測URLか公式サイト直リンクか」は区別できません** → 区別したい場合は下記「拡張運用ルール」の `aff_src` を追加 |

---

## 9. 追加の改修候補（任意・次回デプロイ時）

- トップページの「詳細はこちら」リンク（`src/pages/index.astro`）は `data-detail` のみで `data-aff` が無い → `data-aff={c.id}` を足すと詳細クリックも計測可能
- `minnano` / `yourmystar` はコンポーネント経由でのみリンク生成 → 比較表・詳細ブロックに出るようになれば自動で計測対象
- `data-aff-pos` 未設定のリンクに `pos` を追記すると位置の解像度が上がる
