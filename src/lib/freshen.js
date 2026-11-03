/* 【〇年〇月最新】／【〇年最新】を、ビルドした月（日本時間）に置き換える。
   src/middleware.js（全HTML）と src/pages/search-index.json.js（サイト内検索）で使う。 */
const p = Object.fromEntries(
  new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric' })
    .formatToParts(new Date()).map((x) => [x.type, x.value])
);
export const buildYm = p.year + '年' + p.month + '月';
export const freshen = (s) => String(s).replace(/【\d{4}年(?:\d{1,2}月)?最新】/g, '【' + buildYm + '最新】');
