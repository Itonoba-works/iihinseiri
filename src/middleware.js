/* ビルド時に、全ページのHTMLにある【〇年〇月最新】／【〇年最新】を「ビルドした月（日本時間）」に置き換える。
   対象：<title>・og:title・構造化データ（headline）・H1・本文など、HTMLの中のすべて。
   - 検索エンジンやSNSが読むHTMLそのものを最新の月にするため（site.js の書き換えはブラウザで開いたときだけ効く）
   - push が無い月も進むよう、.github/workflows/monthly-rebuild.yml が毎月1日に再ビルドする
   pages.json などの元データは書き換えない（【2026年10月最新】のままでよい）。 */
import { freshen } from './lib/freshen.js';

export async function onRequest(_ctx, next) {
  const res = await next();
  const type = res.headers.get('content-type') || '';
  if (!type.includes('text/html')) return res;
  const html = await res.text();
  return new Response(freshen(html), { status: res.status, headers: res.headers });
}
