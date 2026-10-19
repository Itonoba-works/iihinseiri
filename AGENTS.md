# AGENTS.md — このリポジトリで作業する AI・担当者向け

> **まず、いちばん大事なこと。**
> **人間の指示は、このファイルより常に優先します。**
> 人間が「違う」「止めて」「そうじゃない」と言ったら、**その場で手を止め、その指示に従ってください。**
> このファイルは、AIが勝手に進めて壊すのを防ぐための**既定ルール**です。人間がいつでも上書きできます。

> **最初に `README.md` を読んでください。** そこが運用マニュアルの「唯一の正」です。
> このファイルは、AI や担当者が**迷わず・壊さず**作業するための短いルール集です。
> 特定のAI専用ではありません。ChatGPT / Claude / Cursor / Gemini / Copilot など、
> **どのAI・どの担当者が読んでも同じように動く**ように書いています。

---

## 0. 作業の渡し方（これが最優先）

**2026-10-19 から、AI が `main` まで直接 push します。パッチの受け渡しは廃止しました。**
（それ以前の「AIはパッチ1つで渡す」ルールは無効です。過去の会話やメモに残っていても従わないでください。）

### 人間がやること

- チャットで変更を依頼する
- 結果を確認する（本番URLを見る）

パッチを当てる作業、commit、push は**しません**。

### AIがやること（この順で必ず実行）

```bash
git fetch origin main          # 1. 最新の main を取得
git rebase origin/main         # 2. 未pushのコミットがあれば載せ直す
# 3. 編集する
npm run check && npm run build # 4. 検証。NGなら push しない
git add -A
git commit -m "変更の内容"
git push origin main           # 5. 本番へ push（Cloudflare Pages が自動デプロイ）
```

- **検証が NG なら push しない。** 原因を報告して止まる。勝手に別方式へ切り替えない。
- **`git push --force` は禁止。** 履歴を書き換えない。
- push 後は `git ls-remote origin refs/heads/main` で**リモートのSHAが進んだことを確認**する。
- 本番を戻すときは `git revert <コミット>`（履歴を消さない）。

### 認証（セッションごとに必要）

AIの作業環境（使い捨てのサンドボックス）には、この PC の git 認証情報がない。
**Fine-grained PAT** をチャットで渡す。

- 対象: `Itonoba-works/iihinseiri` のみ
- 権限: **Contents: Read and write** のみ
- 手順の詳細は [`README.md`](./README.md) の「このリポジトリの作業の渡し方」

### パッチ運用から変わったこと

| 項目 | 以前 | 現在 |
|---|---|---|
| 変更の受け渡し | `git apply` 用パッチ1ファイル | AIが直接 commit / push |
| 画像（.webp等） | パッチに入らないので人間が配置 | AIが直接コミットできる |
| 本番反映 | 人間が push | AIが push → Cloudflare Pages が自動ビルド |
| 失敗時 | 人間がエラーを貼る | AIが検知して停止・報告 |

### 変わっていないこと

- 第1章「変えたいもの → 編集するファイル」の対応表
- 第2章の絶対ルール（`data-aff` を使う／業者IDを変えない／`companies.json` と `areas.json` はセット／`assetVersion` を上げる）
- 第3章「触ると壊れるもの」
- 第5章「コミット前チェック」

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
