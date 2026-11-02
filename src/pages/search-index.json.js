import pages from '../data/pages.json';
import companies from '../data/companies.json';

/* /search-index.json を静的生成する（TOPのサイト内検索で使う）。
   記事・比較ページ・レビューは pages.json、業者名と特徴は companies.json から自動で作る。
   ページや業者を追加すれば、検索の対象にも自動で入る。 */
const strip = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export function GET() {
  const byId = Object.fromEntries(companies.map((c) => [c.id, c]));
  const items = [];

  for (const p of pages) {
    if (p.type === 'article') {
      items.push({
        k: '記事',
        u: '/articles/' + p.slug + '.html',
        t: strip(p.h1 || p.title),
        d: strip(p.description),
        x: strip([p.catTag, ...(p.keyPoints || [])].join(' '))
      });
    } else if (p.type === 'ranking') {
      items.push({
        k: '比較',
        u: '/rankings/' + p.slug + '.html',
        t: strip(p.h1 || p.title),
        d: strip(p.description),
        x: companies.filter((c) => (c.categories || [c.category]).includes(p.slug)).map((c) => c.name).join(' ')
      });
    } else if (p.type === 'review') {
      const c = byId[p.slug];
      if (c && !c.hasReview) continue;
      items.push({
        k: '業者',
        u: '/reviews/' + p.slug + '.html',
        t: strip(p.h1 || p.title),
        d: strip(p.description),
        x: c ? strip([c.name, c.catch, c.shortFeature, c.shortPrice, c.area].join(' ')) : ''
      });
    }
  }

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
