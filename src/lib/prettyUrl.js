/* Cloudflare Pages は /foo.html へのアクセスを /foo へ転送（308）する。
   サイト内リンク・canonical・og:url・構造化データ・サイトマップが .html のままだと、
   Google は「リダイレクトがあります」「代替ページ」と判断してインデックスしないため、
   出力するURLから .html を外す（ファイル名＝build.format 'file' はそのまま）。 */
const ORIGIN = 'https://iihinseiri.com';
export function prettyPath(p) {
  return p.replace(/(^|\/)index\.html(?=$|[#?])/, '$1').replace(/\.html(?=$|[#?])/, '');
}
export function prettify(html) {
  return html
    // 絶対URL（canonical・og:url・JSON-LD など）
    .replace(/https:\/\/iihinseiri\.com(\/[A-Za-z0-9_\-\/]*?)(index)?\.html(?=["#?'<\s])/g, (_m, p) => ORIGIN + p)
    // サイト内の相対リンク href="/xxx.html"
    .replace(/(href=["'])(\/[A-Za-z0-9_\-\/]*?)(index)?\.html(?=["#?'])/g, (_m, a, p) => a + p);
}
