/* ============================================================
   companies.json と areas.json の整合チェック
   使い方： node scripts/check-areas.mjs
   サイトの表示には影響しません（確認専用）。
============================================================ */
import { readFileSync } from 'node:fs';

const companies = JSON.parse(readFileSync(new URL('../src/data/companies.json', import.meta.url), 'utf8'));
const areas = JSON.parse(readFileSync(new URL('../src/data/areas.json', import.meta.url), 'utf8'));

const PREFS = new Set(areas.regions.flatMap((r) => r.prefs));
const TYPES = ['all', 'list', 'consult'];
const errors = [];
const warns = [];

if (PREFS.size !== 47) errors.push(`regions の都道府県が ${PREFS.size} 件です（47件のはず）`);

const ids = new Set();
for (const c of companies) {
  if (ids.has(c.id)) errors.push(`companies.json に同じ id が2件あります: ${c.id}`);
  ids.add(c.id);
  if (!/^[a-z0-9-]+$/.test(c.id)) errors.push(`id に使えない文字があります: ${c.id}`);
  if (!['ihin', 'cleaning'].includes(c.category)) errors.push(`${c.id}: category は ihin か cleaning です（今は "${c.category}"）`);

  const a = areas.companies[c.id];
  if (!a) { errors.push(`${c.id}（${c.name}）: areas.json に対応エリアがありません`); continue; }
  if (!TYPES.includes(a.type)) errors.push(`${c.id}: type は all / list / consult のどれかです（今は "${a.type}"）`);
  if (!a.source) errors.push(`${c.id}: source（確認したページのURL）がありません`);
  if (a.type === 'list') {
    if (!Array.isArray(a.prefs) || a.prefs.length === 0) errors.push(`${c.id}: type が list なのに prefs が空です`);
    for (const p of a.prefs || []) if (!PREFS.has(p)) errors.push(`${c.id}: 都道府県名が正しくありません: "${p}"（例：東京都・大阪府・北海道）`);
  }
  for (const p of a.core || []) if (!PREFS.has(p)) errors.push(`${c.id}: core の都道府県名が正しくありません: "${p}"`);
  if (a.outside && a.outside !== 'consult') errors.push(`${c.id}: outside は "consult" だけ使えます`);
  if (a.verified === false) warns.push(`${c.id}（${c.name}）: 対応エリアが未確認（verified: false）`);
}
for (const id of Object.keys(areas.companies)) {
  if (!ids.has(id)) warns.push(`areas.json の ${id} は companies.json にありません（削除した業者なら areas.json からも消してください）`);
}

for (const cat of ['ihin', 'cleaning']) {
  const list = companies.filter((c) => c.category === cat);
  if (list.length > 5) warns.push(`${cat}: ${list.length}社あります。TOPには並び順で上から5社（条件に合う業者）まで表示されます`);
}

warns.forEach((w) => console.log('注意: ' + w));
if (errors.length) {
  errors.forEach((e) => console.log('エラー: ' + e));
  console.log(`\nNG（エラー ${errors.length} 件）`);
  process.exit(1);
}
console.log(`\nOK（${companies.length}社）`);
