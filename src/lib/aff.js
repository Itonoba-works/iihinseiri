import companies from '../data/companies.json';

/* 生の HTML 文字列（src/content/**.html）に含まれる data-aff リンクを
   ビルド時に解決する。AffLink.astro と同じ優先順位：
     affUrl → officialUrl → サイト内ページ
   提携承認後は companies.json の affUrl を1箇所書き換えるだけで、
   記事・レビュー・3社カードの全リンクが一括で切り替わる。 */
export function resolveAff(html) {
  if (!html) return html;
  return html.replace(/<a\b([^>]*?)data-aff="([^"]+)"([^>]*)>/g, (tag, pre, id, post) => {
    const c = companies.find((x) => x.id === id);
    if (!c) throw new Error('[resolveAff] companies.json に未登録の企業ID: ' + id);

    const external = c.affUrl || c.officialUrl || '';
    const href = external || (c.hasReview
      ? '/reviews/' + c.id + '.html'
      : '/rankings/' + c.category + '.html#' + c.id);

    /* 既存の href / rel / target は破棄して付け直す */
    const rest = (pre + post)
      .replace(/\s(?:href|rel|target)="[^"]*"/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const attrs = ['href="' + href + '"'];
    if (rest) attrs.push(rest);
    attrs.push('data-aff="' + c.id + '"');
    if (external) {
      attrs.push('data-aff-external="1"');
      attrs.push('rel="sponsored nofollow noopener"');
      attrs.push('target="_blank"');
    }
    return '<a ' + attrs.join(' ') + '>';
  });
}
