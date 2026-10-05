/* ============================================================
   企業画像 public/images/companies/<id>.webp の配置チェック
   使い方： node scripts/check-company-images.mjs [--strict]
   - 既定は確認専用。未配置・サイズ違いは「警告」（build は止めない）
   - --strict を付けると未配置・寸法違いを「エラー」（exit 1）
   規格： ファイル名 = companies.json の id と同じ（public/images/companies/<id>.webp）
         寸法は 300x250（6:5）。高解像度版は 600x500 でも可（枠は 300x250 の原寸表示）
============================================================ */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const strict = process.argv.includes('--strict');
const companies = JSON.parse(readFileSync(new URL('../src/data/companies.json', import.meta.url), 'utf8'));
const dir = fileURLToPath(new URL('../public/images/companies/', import.meta.url));

const warns = [];
const errors = [];

/* WebP のヘッダから幅・高さを読む（外部ライブラリ不要） */
function webpSize(buf) {
  if (buf.length < 30) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fourcc = buf.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') {
    return { w: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)), h: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)) };
  }
  if (fourcc === 'VP8 ') {
    if (!(buf[23] === 0x9d && buf[24] === 0x01 && buf[25] === 0x2a)) return null;
    return { w: (buf[26] | (buf[27] << 8)) & 0x3fff, h: (buf[28] | (buf[29] << 8)) & 0x3fff };
  }
  if (fourcc === 'VP8L') {
    if (buf[20] !== 0x2f) return null;
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}

for (const c of companies) {
  const rel = 'public/images/companies/' + c.id + '.webp';
  const abs = dir + c.id + '.webp';
  if (!existsSync(abs)) {
    (strict ? errors : warns).push(c.id + '（' + c.name + '）: ' + rel + ' がありません → プレースホルダー表示になります');
    continue;
  }
  const buf = readFileSync(abs);
  const size = webpSize(buf);
  if (!size) {
    warns.push(c.id + ': ' + rel + ' を WebP として読めませんでした');
    continue;
  }
  const ratio = size.w / size.h;
  /* 6:5(1.2) の 300x250 か、その2倍の 600x500 を想定 */
  const ok = (size.w === 300 && size.h === 250) || (size.w === 600 && size.h === 500);
  if (!ok && Math.abs(ratio - 1.2) > 0.04) {
    warns.push(c.id + ': ' + rel + ' は ' + size.w + 'x' + size.h + '（' + ratio.toFixed(2) + ':1）。300x250（6:5）にしてください');
  } else if (!ok) {
    warns.push(c.id + ': ' + rel + ' は ' + size.w + 'x' + size.h + '。300x250 ちょうど（または 600x500）にしてください');
  }
  const kb = Math.round(buf.length / 1024);
  if (kb > 300) warns.push(c.id + ': ' + rel + ' が ' + kb + 'KB と大きめです（既存は 52-114KB）');
}

console.log('企業画像チェック: 対象 ' + companies.length + ' 社');
for (const w of warns) console.log('  警告: ' + w);
for (const e of errors) console.log('  エラー: ' + e);
if (!warns.length && !errors.length) console.log('  OK: 全社の画像が所定の名前・寸法で揃っています');
console.log(warns.length + ' 件の警告 / ' + errors.length + ' 件のエラー');
if (errors.length) process.exit(1);
