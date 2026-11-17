import { prettyPath } from '../lib/prettyUrl.js';
import pages from '../data/pages.json';
import companies from '../data/companies.json';

/* /sitemap.xml を静的生成する。ページを追加したら pages.json / companies.json
   に載せるだけでサイトマップにも自動で反映される。 */
export function GET({ site }) {
  const base = String(site).replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);

  const entries = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    ...pages
      .filter((p) => p.type === 'ranking')
      .map((p) => ({ loc: '/rankings/' + p.slug, priority: '0.9', changefreq: 'weekly' })),
    ...pages
      .filter((p) => p.type === 'article')
      .map((p) => ({ loc: '/articles/' + p.slug, priority: '0.8', changefreq: 'monthly' })),
    { loc: '/articles', priority: '0.8', changefreq: 'weekly' },
    { loc: '/checklist', priority: '0.8', changefreq: 'monthly' },
    { loc: '/kigen', priority: '0.8', changefreq: 'monthly' },
    /* レビュー本文を持つ社だけ。hasReview=false の社は外部リンク専用で内部からも
       リンクしていないため、サイトマップにも載せない */
    ...companies
      .filter((c) => c.hasReview)
      .map((c) => ({ loc: '/reviews/' + c.id, priority: '0.7', changefreq: 'monthly' })),
    { loc: '/about', priority: '0.3', changefreq: 'yearly' },
    { loc: '/contact', priority: '0.3', changefreq: 'yearly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly' }
  ];

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map(
        (e) =>
          '  <url>\n' +
          '    <loc>' + base + e.loc + '</loc>\n' +
          '    <lastmod>' + lastmod + '</lastmod>\n' +
          '    <changefreq>' + e.changefreq + '</changefreq>\n' +
          '    <priority>' + e.priority + '</priority>\n' +
          '  </url>'
      )
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
