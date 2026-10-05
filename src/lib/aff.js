import companies from '../data/companies.json';

/* 生の HTML 文字列（src/content/**.html）に含まれる data-aff リンクを
   ビルド時に解決する。AffLink.astro と同じ優先順位：
     affLp[用途]（data-aff-lp がある場合）→ affUrl → officialUrl → サイト内ページ
   提携承認後は companies.json の affUrl を1箇所書き換えるだけで、
   記事・レビュー・3社カードの全リンクが一括で切り替わる。 */
export function resolveAff(html) {
  if (!html) return html;
  return html.replace(/<a\b([^>]*?)data-aff="([^"]+)"([^>]*)>/g, (tag, pre, id, post) => {
    const c = companies.find((x) => x.id === id);
    if (!c) throw new Error('[resolveAff] companies.json に未登録の企業ID: ' + id);

    /* data-aff-lp="disposal" などが付いていれば、companies.json の affLp から
       その用途のLPを使う（無ければ affUrl） */
    const lpm = (pre + post).match(/data-aff-lp="([^"]+)"/);
    const lpUrl = lpm && c.affLp ? c.affLp[lpm[1]] : '';
    const external = lpUrl || c.affUrl || c.officialUrl || '';
    /* URL の出所。GTM の aff_src としてGA4に送る（AffLink.astro と同一ロジック） */
    const src = lpUrl ? 'aff-lp' : c.affUrl ? 'aff' : c.officialUrl ? 'official' : 'internal';
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
    attrs.push('data-aff-src="' + src + '"');
    if (external) {
      attrs.push('data-aff-external="1"');
      attrs.push('rel="sponsored nofollow noopener"');
      attrs.push('target="_blank"');
    }
    return '<a ' + attrs.join(' ') + '>';
  });
}

/* ASP提携済み（affUrl / affLp あり）の企業を先頭、未提携を後ろに並べる。
   上位ほどクリックされやすいため、収益に直結する提携済み社を上位に固定する。
   同グループ内は元の並び順を維持する（安定ソート）。 */
export function affFirst(list) {
  const hasAff = (c) => !!(c.affUrl || (c.affLp && Object.keys(c.affLp).length));
  return list
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const d = (hasAff(a.c) ? 0 : 1) - (hasAff(b.c) ? 0 : 1);
      return d !== 0 ? d : a.i - b.i;
    })
    .map((x) => x.c);
}

