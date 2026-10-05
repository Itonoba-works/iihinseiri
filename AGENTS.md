# AGENTS.md — このリポジトリで作業する AI・担当者向け

> **最初に `README.md` を読んでください。** そこが運用マニュアルの「唯一の正」です。
> このファイルは、AI や担当者が**迷わず・壊さず**作業するための短いルール集です。

---

## 1. 変えたいもの → 編集するファイル（これ以外は触らない）

| 変えたいもの | 編集するファイル（唯一の置き場） |
|---|---|
| アフィリエイトURL（ASP計測URL） | `src/data/companies.json` の `affUrl`（用途別は `affLp`） |
| 業者の情報（名前・料金・特徴） | `src/data/companies.json` |
| 業者の対応エリア | `src/data/areas.json` |
| 業者の追加・削除 | `src/data/companies.json` ＋ `src/data/areas.json`（**両方**） |
| 記事の追加・削除 | `src/content/articles/{slug}.html` ＋ `src/data/pages.json` |
| レビュー記事 | `src/content/reviews/{id}.html` ＋ `companies.json` の `hasReview` |
| ナビ・フッター・一括見積の遷移先・キャッシュ版数 | `src/data/site.json` |
| 記事のタイトル・要点 | `src/data/pages.json` |
| 画像 | `public/images/`（下表） |
| 計測（GA4/GTM） | `docs/GA4計測_設定書.md` の手順どおり |

### 画像の置き場所（拡張子は **.webp**）

| 用途 | パス | 目安サイズ |
|---|---|---|
| トップのヒーロー | `public/images/hero.webp` | 1200×900 |
| 記事・レビューのアイキャッチ | `public/images/articles/{slug}.webp` | 800×500 |
| 業者のサムネイル | `public/images/companies/{id}.webp` | 800×600（4:3） |
| ロゴ | `public/images/brand/logo.png` | 変更しない |

> 画像がない場合は自動でプレースホルダが表示されます。後から置けば反映されます。

---

## 2. 絶対ルール

1. **URLを本文（HTML）に直書きしない。** 必ず `data-aff="{業者ID}"` を使う。
   - 例: `<a href="#" data-aff="lifereset" data-aff-pos="review-hero">…</a>`
   - ビルド時に `companies.json` のURLへ自動で差し替わります。
2. **業者IDは一度決めたら変えない。** 変えるとGA4の過去データと分断されます。
3. **`companies.json` と `areas.json` は必ずセットで更新する。** 片方だけだと表示がおかしくなります。
4. **GA4/GTMの設定は、業者が増えても変更しない。** イベントは `aff_click` 1本のまま（パラメータで分解）。
5. **`public/assets/` の CSS・JS を変えたら `site.json` の `assetVersion` を上げる**（キャッシュ対策）。
6. コミット前に `npm run build` を通す（URL直書き・ID不整合を自動チェックします）。

---

## 3. 触ると壊れるもの（原則、編集しない）

| ファイル | 理由 |
|---|---|
| `astro.config.mjs` の `build.format: 'file'` | 既存URL（`/articles/xxx.html`）が崩れる |
| `public/assets/*.css` / `site.js` | サイトUIそのもの。変えるなら `assetVersion` 更新が必須 |
| `src/components/AffLink.astro` / `src/lib/aff.js` | URL解決の中核。`data-aff` の仕組みが壊れる |
| `src/layouts/Base.astro` | GTM計測タグ。消すと計測が止まる |

---

## 4. よくある作業

- **AFFリンクを差し替える** → `companies.json` の `affUrl` を書き換えるだけ（詳細: `README.md` 第1章）
- **クライアントを増やす** → `companies.json` に1件＋`areas.json` に1件（詳細: `README.md` 第3章）
- **記事を増やす** → `src/content/articles/`＋`pages.json`（詳細: `README.md` 第4章）
- **GA4でCTA計測を入れる** → `docs/GA4計測_設定書.md`
- **ASP提携の管理** → `AFFILIATE_LINKS.md`

---

## 5. コミット前チェック

```bash
npm run check     # URL直書き・ID不整合の検出
npm run build     # ビルド（checkはbuildにも組み込み済み）
```

`npm run check` が `NG` を出したら、表示されたファイルを直してください。
