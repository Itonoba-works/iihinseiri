# `aff_src` 追加手順 — 「ASP計測URL」と「公式サイト直リンク」をGA4で分ける

対象: `iihinseiri.com` ／ GTM `GTM-MCP38LG6` ／ GA4 `G-P0HBQC3BJC`
前提: サイト側の改修（`AffLink.astro` / `src/lib/aff.js`）は**コミット済み・デプロイ済み**であること。

---

## 0. この改修で何が変わるか

CTAを踏んだとき、**リンク先URLの出所**が `data-aff-src` としてHTMLに出力されるようになります。

| `data-aff-src` の値 | 意味 |
|---|---|
| `aff-lp` | `companies.json` の `affLp[用途]`（用途別のASP計測URL） |
| `aff` | `companies.json` の `affUrl`（ASP計測URL） |
| `official` | `officialUrl`（ASP未提携で公式サイトへ直リンク） |
| `internal` | どちらも未設定で、サイト内レビュー/比較へ |

→ GA4で「**ASPリンクのクリック**」と「**まだ提携していない公式サイトへのクリック**」を分けて集計できます。ASP提携が進むと `official` → `aff` に移り変わるので、**提携前後のCTA反応を比較**できます。

> `aff_external` は「サイト外かどうか」しか表さず、現状すべて `true` です。その欠落を `aff_src` が補います。

---

## 1. すでに入っているサイト改修（確認用）

**`src/components/AffLink.astro`**
```astro
const external = lpUrl || c.affUrl || c.officialUrl || '';
/* URL の出所。GTM の aff_src としてGA4に送り、ASP計測URLか公式サイト直リンクかを区別する */
const src = lpUrl ? 'aff-lp' : c.affUrl ? 'aff' : c.officialUrl ? 'official' : 'internal';
const href = external || (c.hasReview ? ... );
```
```astro
  data-aff-lp={lpUrl ? lp : undefined}
  data-aff-src={src}
  data-aff-external={external ? '1' : undefined}
```

**`src/lib/aff.js`**（記事HTML内の `data-aff` をビルド時解決する側）
```js
const external = lpUrl || c.affUrl || c.officialUrl || '';
/* URL の出所。GTM の aff_src としてGA4に送る（AffLink.astro と同一ロジック） */
const src = lpUrl ? 'aff-lp' : c.affUrl ? 'aff' : c.officialUrl ? 'official' : 'internal';
```
```js
attrs.push('data-aff="' + c.id + '"');
attrs.push('data-aff-src="' + src + '"');
```

### デプロイ後の確認
ブラウザでCTAを右クリック →「検証」し、`<a>` に `data-aff-src="official"`（または `aff`）が付いていればOK。

---

## 2. GTM に変数 `aff_src` を追加

GTM →「変数」→「新規」→ **変数のタイプ: カスタム JavaScript**

- 変数名: **`aff_src`**

```js
function () {
  var a = {{Click Element}}.closest('a[data-aff]');
  return a ? (a.getAttribute('data-aff-src') || '') : '';
}
```

> `{{Click Element}}` は「変数を追加」→「クリック要素」で挿入。既存の `aff_id` などと同じ書き方です。
> 保存して **GTMを公開**（既存の `aff_click` タグのパラメータを編集する必要はありません。次のステップでパラメータを1つ足します）。

---

## 3. `aff_click` タグにパラメータを1つ追加

GTM →「タグ」→ **`GA4 - CTAクリック（aff_click）`** を開き、イベントパラメータに1行追加します。

| パラメータ名 | 値 |
|---|---|
| `aff_src` | `{{aff_src}}` |

保存 → **プレビュー** → CTAをクリック → `aff_src` に `official` などの値が入ることを確認 → **送信 → 公開**。

> サイトが未デプロイの場合は `aff_src` が空文字になります（エラーにはなりません）。

---

## 4. GA4 にカスタムディメンションを追加

GA4 →「管理」→「カスタム定義」→「カスタムディメンションを作成」

| ディメンション名 | 範囲 | イベントパラメータ |
|---|---|---|
| **アフィリ区分** | **イベント** | `aff_src` |

※「範囲」は必ず **イベント** を選択（ユーザーにすると値が入りません）。
※登録後に計測された分のみ表示されます（過去には遡及しません）。

---

## 5. 見方

- **エンゲージメント → イベント → `aff_click`** を開き、ディメンションに「アフィリ区分」を選ぶ
- **探索（自由形式）** の設定例:

| 項目 | 設定 |
|---|---|
| 行 | `アフィリ区分` |
| 列 | `業者ID` |
| 値 | `イベント数` |
| フィルタ | `イベント名` 次と一致 `aff_click` |

→ 「ASPリンク（`aff`）が押されたか」「公式サイト直リンク（`official`）止まりか」を業者別に比較できます。

### 運用に効く見方
- `official` のクリックが多い業者＝**提携したら伸びる候補**（=ASP案件の優先順位づけに使える）
- 提携後 `aff` に変わった業者で、クリック数が維持/増加していれば導線は機能している
- `aff-lp`（`curama` の用途別LP）で、どの用途のLPが強いか比較

---

## 6. チェックリスト

- [ ] サイト改修をコミット → デプロイ完了
- [ ] 実ページのCTAに `data-aff-src` が付いていることを確認
- [ ] GTM 変数 `aff_src` を作成
- [ ] `aff_click` タグにパラメータ `aff_src` を追加
- [ ] プレビューで値が入ることを確認 → GTM公開
- [ ] GA4 にカスタムディメンション「アフィリ区分」（範囲=イベント / `aff_src`）を追加
- [ ] 数日後、探索で `アフィリ区分` × `業者ID` を確認

---

## 7. 既存の設定書との関係

- `ga4-cta-affclick-setup.md` … 変数4つ＋トリガー＋`aff_click` タグ＋ディメンション3つの**基本設定**
- 本ドキュメント … その上に **`aff_src` を1本追加**する差分。基本設定が未了なら先にそちらを完了してください。
