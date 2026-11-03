/* 中国語の簡体字・繁体字など、日本語で使わない漢字が混ざっていないかを調べる。
   判定：日本語の文字コード（Shift_JIS／Windows-31J）に含まれない漢字はNG。
   例：「买」（簡体字）→ NG、「買」→ OK
   npm run check / npm run build で自動実行。NGが出たらその文字を日本語の漢字に直す。 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const targets = ['src/content', 'src/data', 'src/pages', 'src/components', 'src/layouts'];
const exts = new Set(['.html', '.json', '.astro', '.js', '.md']);

/* Shift_JIS の2バイト領域をすべてデコードして、日本語で使える漢字の一覧を作る */
const ok = new Set();
const dec = new TextDecoder('shift_jis');
for (let a = 0x81; a <= 0xfc; a++) {
  if (a > 0x9f && a < 0xe0) continue;
  for (let b = 0x40; b <= 0xfc; b++) {
    if (b === 0x7f) continue;
    const ch = dec.decode(new Uint8Array([a, b]));
    if (ch && ch !== '�') ok.add(ch);
  }
}

const isKanji = (cp) =>
  (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x4e00 && cp <= 0x9fff) ||
  (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0x20000 && cp <= 0x3134f);

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? walk(p) : exts.has(path.extname(d.name)) ? [p] : [];
      })
    : [];

let ng = 0;
for (const file of targets.flatMap((t) => walk(path.join(root, t)))) {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const ch of line) {
      const cp = ch.codePointAt(0);
      if (isKanji(cp) && !ok.has(ch)) {
        ng++;
        const at = line.indexOf(ch);
        console.log(`  NG: ${path.relative(root, file)}:${i + 1} 「${ch}」(U+${cp.toString(16).toUpperCase()}) … ${line.slice(Math.max(0, at - 12), at + 12).trim()}`);
      }
    }
  });
}

if (ng) {
  console.log(`\n日本語で使わない漢字が ${ng} 件あります。日本語の漢字に直してください。`);
  process.exit(1);
}
console.log('漢字チェック: OK（日本語で使わない漢字はありません）');
