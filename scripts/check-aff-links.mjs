/* ============================================================
   AFFリンク・IDの整合チェック
   使い方： node scripts/check-aff-links.mjs

   検出するもの（NG = exit 1）:
     1. data-aff="X" の X が companies.json に存在しない
     2. 本文にASPのURLが直書きされている（data-aff を経由していない）
     3. companies.json の affUrl / affLp にURL形式でない値が入っている

   検出するもの（警告のみ）:
     4. href="#" なのに data-aff が無いリンク（未実装のリンク）

   サイトの表示には影響しません（確認専用）。
============================================================ */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

/* 直書きを検出したいASPのドメイン（必要に応じて追加） */
const ASP_DOMAINS = [
  'a8.net', 'afi-b.com', 'valuecommerce', 'accesstrade',
  'afb.ne.jp', 'moshimo', 'rentracks', 'felmat', 'linksynergy', 'janet'
];
const ASP_RE = new RegExp('(' + ASP_DOMAINS.join('|') + ')', 'i');

const companies = JSON.parse(readFileSync(join(ROOT, 'src/data/companies.json'), 'utf8'));
const ids = new Set(companies.map((c) => c.id));

const errors = [];
const warns = [];

/* --- 1 & 3. companies.json 自体のチェック --- */
for (const c of companies) {
  if (!c.id) errors.push(`companies.json: id が空の業者があります`);
  if (c.affUrl && !/^https?:\/\//.test(c.affUrl))
    errors.push(`companies.json: ${c.id} の affUrl がURL形式ではありません: ${c.affUrl}`);
  for (const [k, url] of Object.entries(c.affLp || {})) {
    if (!/^https?:\/\//.test(url))
      errors.push(`companies.json: ${c.id} の affLp.${k} がURL形式ではありません: ${url}`);
  }
}

/* --- ファイル走査（.html / .astro のみ。.js は式なので対象外） --- */
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|astro)$/.test(p)) files.push(p);
  }
})(SRC);

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const rel = relative(ROOT, f);
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;

    /* 1. data-aff の業者IDが存在するか */
    for (const m of line.matchAll(/data-aff="([^"]+)"/g)) {
      if (!ids.has(m[1])) errors.push(`${at} 未登録の業者ID: data-aff="${m[1]}"`);
    }

    /* 2. ASPのURLが直書きされていないか（data-aff が無いリンク） */
    if (ASP_RE.test(line) && /href=/.test(line) && !/data-aff/.test(line)) {
      errors.push(`${at} ASPのURLが直書きされています（data-aff を使ってください）: ${line.trim().slice(0, 100)}`);
    }

    /* 4. href="#" なのに data-aff が無い（未実装リンクの見落とし） */
    if (/href="#"/.test(line) && !/data-aff/.test(line)) {
      warns.push(`${at} href="#" のリンクに data-aff がありません`);
    }
  });
}

/* --- 結果 --- */
if (warns.length) {
  console.log('△ 警告（動作には影響しません）');
  for (const w of warns) console.log('   ' + w);
  console.log('');
}

if (errors.length) {
  console.log('NG: 修正が必要な箇所があります');
  for (const e of errors) console.log('   ✗ ' + e);
  process.exit(1);
}

console.log(`OK: data-aff / ASPリンクの整合性に問題ありません（${files.length}ファイルを確認 / 業者${companies.length}社）`);
