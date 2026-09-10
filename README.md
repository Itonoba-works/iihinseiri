# くらしの整理ナビ

遺品整理・不用品回収・ハウスクリーニングのサービス比較情報メディア。各社の公式サイトの公表情報をもとに、料金・対応エリア・特徴を整理して紹介するアフィリエイト目的のサイトです。

## サイト構成

### ページ一覧（14ページ）

| URL | ページ | 説明 |
|-----|--------|------|
| `/` | トップページ | サイト全体の入口。3案切替可能なTweaks付き |
| `/rankings/ihin.html` | 遺品整理・不用品回収 比較 | 6社の詳細比較記事 |
| `/rankings/cleaning.html` | ハウスクリーニング 比較 | 5社の詳細比較記事 |
| `/reviews/ihinnoseiriyasan.html` | 遺品の整理屋さん レビュー | 個別業者レビュー |
| `/reviews/777fukujin.html` | ゴミ屋敷片付け七福神 レビュー | 個別業者レビュー |
| `/reviews/liferesetro.html` | ライフリセット レビュー | 個別業者レビュー |
| `/reviews/migakuru.html` | ミガクる レビュー | 個別業者レビュー |
| `/reviews/osoujikakumei.html` | おそうじ革命 レビュー | 個別業者レビュー |
| `/reviews/osoujihonpo.html` | おそうじ本舗 レビュー | 個別業者レビュー |
| `/articles/akutoku.html` | 悪徳業者の見分け方 | 情報記事 |
| `/articles/ihin-price.html` | 遺品整理の料金相場 | 情報記事 |
| `/articles/seizen.html` | 50代からの生前整理 | 情報記事 |
| `/articles/huyouhin.html` | 不用品回収の相場 | 情報記事 |
| `/articles/gomiyashiki.html` | ゴミ屋敷の片付け費用 | 情報記事 |

### ディレクトリ構造

```
/
├── index.html                      # トップページ
├── assets/
│   ├── styles.css                  # 共通CSS
│   ├── app.jsx                     # トップページのReactロジック（Tweaks A/B/C）
│   └── tweaks_panel.jsx            # TweaksパネルUI
├── rankings/                       # カテゴリ別比較ランキング
│   ├── ihin.html                   # 遺品整理・不用品回収 6社
│   └── cleaning.html               # ハウスクリーニング 5社
├── reviews/                        # 個別業者レビュー（6本）
│   ├── ihinnoseiriyasan.html
│   ├── 777fukujin.html
│   ├── liferesetro.html
│   ├── migakuru.html
│   ├── osoujikakumei.html
│   └── osoujihonpo.html
├── articles/                       # 情報記事（5本）
│   ├── akutoku.html
│   ├── ihin-price.html
│   ├── seizen.html
│   ├── huyouhin.html
│   └── gomiyashiki.html
├── _headers                        # CloudFlare Pagesヘッダー設定
├── _redirects                      # CloudFlare Pagesリダイレクト設定
├── .gitignore
├── README.md                       # このファイル
└── AFFILIATE_LINKS.md              # AFFリンク挿入ガイド
```

## デザインシステム

### カラー
- **Primary**：`#4FB4D8`（水色）、`#2E8AB0`（濃い水色）
- **Accent**：`#FF8B5A`（オレンジ・CTA）
- **Text**：`#2C3E50`（濃紺）、`#556A76`（サブ）
- **Background**：`#FBF9F5`（アイボリー）

### タイポグラフィ
- 本文：Noto Sans JP（500 weight・16px）
- 見出し：Zen Maru Gothic

### 主要コンポーネント
- ヘッダー（スティッキー、水色×白）
- 業者ランキングカード（金/銀/銅バッジ、料金表、CTA）
- サイドバー（ランキング + 関連記事 + 公式サイトブロック）
- 追従下部CTA
- 情報ボックス、Q&Aアコーディオン、吹き出し

## CloudFlare Pages にデプロイ

### 前提
- GitHubアカウント
- CloudFlareアカウント

### 手順

1. **GitHubにpush**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:{USER}/{REPO}.git
   git push -u origin main
   ```

2. **CloudFlare Pages でプロジェクト作成**
   - CloudFlare ダッシュボード → Pages → Create a project → Connect to Git
   - リポジトリを選択
   - **ビルド設定**：
     - Framework preset: `None`
     - Build command: 空欄（静的サイトなので不要）
     - Build output directory: `/`（プロジェクトルート）

3. **カスタムドメイン設定**
   - Pages プロジェクト → Custom domains → Set up a domain
   - CloudFlare 管理下のドメインを追加

4. **確認事項**
   - `_redirects` / `_headers` が自動で読み込まれる
   - `docs/` `_backup/` などは `.gitignore` で除外済み
   - 各種`href="#"` は `AFFILIATE_LINKS.md` を参照してASP計測URLに差し替え

## 開発フロー

### ローカル編集
1. GitHubからclone
2. お好きなエディタで直接HTML/CSS/JSX編集
3. VSCode Live Server 等で `index.html` をローカルで確認
4. git commit / push で自動デプロイ

### AI（Claude Code、Cursor 等）で編集する場合
1. リポジトリをcloneまたはWebアクセスさせる
2. `README.md` および `AFFILIATE_LINKS.md` を参照
3. サイトツリーはREADMEに記載の構造に沿って変更

### コンテンツ更新チェックリスト
- [ ] 料金・対応エリア・特徴：**各社公式サイトを最終確認**
- [ ] 「最終確認日」を更新（現在: 2026年9月8日）
- [ ] AFFリンクの計測タグが有効か確認（ASP管理画面）
- [ ] 全ページで免責文が表示されているか確認

## AFFリンク管理

**`AFFILIATE_LINKS.md`** に、各ページのAFFリンク挿入位置一覧と、ASP契約手順を記載しています。実装時は必ずこのファイルを参照してください。

主な対象業者（11社）：
- 遺品整理・不用品回収（6社）：遺品の整理屋さん、ゴミ屋敷片付け七福神、ライフリセット、遺品整理110番、みんなの遺品整理、EMEAO
- ハウスクリーニング（5社）：ミガクる、おそうじ革命、おそうじ本舗、ユアマイスター、カジタク

各HTMLの `<body>` タグ直下に AFFリンク挿入箇所リストのコメントが埋め込まれています。

## コンテンツポリシー

本サイトの掲載内容は **すべて各社公式サイトの公表情報をベース** としており、以下を厳守しています：

- ★スコアなど推定評価は表示しない
- 「編集部が実際に問い合わせ」等の架空表現は使用しない
- 料金は必ず「公式サイト掲載の参考価格」であることを明示
- 各ページ最上部・末尾に「最終確認日：2026年9月8日」を明記
- 料金・特徴が変動する旨と、依頼前の公式確認を推奨する免責文を全ページに掲載

## ライセンス・アフィリエイト表記

- 本サイトはアフィリエイトプログラムに参加しています。
- 掲載情報は執筆時点のもので、依頼前に必ず公式サイトで最新情報をご確認ください。

## 連絡先

サイト運営者情報・お問い合わせページは今後追加予定です（現状 `href="#"` のプレースホルダー）。
