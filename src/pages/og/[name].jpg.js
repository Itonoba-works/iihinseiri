/* OGP画像（SNS・Copilot・Bingの引用カードで表示される画像）を、ビルド時に 1200×630 のJPGで作る。
   元画像は public/images/ の既存画像。元画像を差し替えれば、次のビルドでOGP画像も自動で変わる。
   - 記事     /articles/{slug}.html   → images/articles/{slug}.webp
   - 比較     /rankings/ihin|cleaning → images/articles/ihin-price.webp / cleaning.webp
   - レビュー /reviews/{id}.html      → images/companies/{id}.webp（無ければヒーロー画像）
   - その他                            → images/hero.webp
   ページ側の参照は Base.astro の og:image（URLのパスから /og/{名前}.jpg を作る） */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import pages from '../../data/pages.json';
import companies from '../../data/companies.json';

const img = (p) => path.join(process.cwd(), 'public/images', p);
const exists = (p) => fs.existsSync(img(p));
const HERO = 'hero.webp';

export function getStaticPaths() {
  const list = [
    { name: 'home', src: HERO },
    { name: 'articles', src: HERO },
    { name: 'about', src: HERO },
    { name: 'contact', src: HERO },
    { name: 'privacy', src: HERO },
    { name: 'checklist', src: HERO },
    { name: 'kigen', src: HERO },
    { name: 'rankings-ihin', src: 'articles/ihin-price.webp' },
    { name: 'rankings-cleaning', src: 'articles/cleaning.webp' },
    ...pages.filter((p) => p.type === 'article').map((p) => ({ name: 'articles-' + p.slug, src: 'articles/' + p.slug + '.webp' })),
    ...companies.map((c) => ({ name: 'reviews-' + c.id, src: 'companies/' + c.id + '.webp' }))
  ];
  return list.map((x) => ({ params: { name: x.name }, props: { src: exists(x.src) ? x.src : HERO } }));
}

export async function GET({ props }) {
  const buf = await sharp(img(props.src))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(buf, { headers: { 'Content-Type': 'image/jpeg' } });
}
