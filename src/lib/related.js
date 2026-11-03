/* 関連記事を選ぶ。
   1) pages.json の記事に "related": [slug, ...] があればその順
   2) 無ければ、タグ（catTag を「／」で分けたもの）が重なる記事
   3) それでも足りなければ新しい記事から補う
   レビューは業者のカテゴリで記事を選ぶ（REVIEW_RELATED）。 */
import pages from '../data/pages.json';

const articles = pages.filter((p) => p.type === 'article');
const bySlug = Object.fromEntries(articles.map((p) => [p.slug, p]));
const tags = (p) => String(p.catTag || '').split('／').map((t) => t.trim()).filter(Boolean);

const REVIEW_RELATED = {
  ihin: ['ihin-price', 'trouble', 'jikka-enkaku', 'gomiyashiki'],
  cleaning: ['taikyo-cleaning', 'combo', 'huyouhin', 'gomiyashiki'],
  hakkoudo: ['ihin-price', 'souzoku-houki', 'trouble', 'jikka-enkaku']
};

export function relatedArticles(page, { category = '', max = 4 } = {}) {
  const me = page && page.slug;
  let list = [];
  if (page && page.type === 'review') {
    list = (REVIEW_RELATED[me] || REVIEW_RELATED[category] || []).map((s) => bySlug[s]).filter(Boolean);
  } else if (page && Array.isArray(page.related)) {
    list = page.related.map((s) => bySlug[s]).filter(Boolean);
  }
  if (list.length < max && page) {
    const mine = new Set(tags(page));
    const scored = articles
      .filter((p) => p.slug !== me && !list.includes(p))
      .map((p, i) => ({ p, s: tags(p).filter((t) => mine.has(t)).length * 10 + i }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);
    list = list.concat(scored);
  }
  return list.filter((p) => p.slug !== me).slice(0, max);
}
