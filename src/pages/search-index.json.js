import pages from '../data/pages.json';
import companies from '../data/companies.json';
import { freshen } from '../lib/freshen.js';
import fs from 'node:fs';
import path from 'node:path';

/* 検索結果のサムネイル（無ければヒーロー画像） */
const pic = (p) => (fs.existsSync(path.join(process.cwd(), 'public/images', p)) ? '/images/' + p : '/images/hero.webp');

/* /search-index.json を静的生成する（TOPのサイト内検索で使う）。
   記事・比較ページ・レビューは pages.json、業者名と特徴は companies.json から自動で作る。
   ページや業者を追加すれば、検索の対象にも自動で入る。 */
const strip = (s) => freshen(String(s || '')).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export function GET() {
  const byId = Object.fromEntries(companies.map((c) => [c.id, c]));
  const items = [
    { k: 'ツール', i: '/images/hero.webp', u: '/kigen.html', t: '期限カレンダー｜親が亡くなった後の手続きの期限を一覧で', d: '亡くなった日を入れるだけで、死亡届・国民健康保険・相続放棄・準確定申告・相続税・相続登記の期限の目安日と残り日数を表示します。', x: '期限 死亡届 7日 14日 3か月 4か月 10か月 相続放棄 準確定申告 相続税 相続登記 葬祭費 埋葬料 高額療養費 生命保険金 未支給年金 遺族年金 手続き カレンダー' },
    { k: 'ツール', i: '/images/hero.webp', u: '/checklist.html', t: '実家じまいチェックリスト｜親が元気なうちに確認したい30項目【印刷用】', d: '親が元気なうちに確認しておきたい項目を、お金・家・モノ・人・段取り・契約とデジタルの6つに分けたチェックリスト。印刷して親と一緒に埋められます。', x: '生前整理 実家じまい 借金 通帳 権利証 認知症 一人っ子 スマホ パスコード サブスク 解約 チェックリスト 印刷' }
  ];

  for (const p of pages) {
    if (p.type === 'article') {
      items.push({
        k: String(p.catTag || '記事').split('／')[0],
        i: pic('articles/' + p.slug + '.webp'),
        u: '/articles/' + p.slug + '.html',
        t: strip(p.h1 || p.title),
        d: strip(p.description),
        x: strip([p.catTag, ...(p.keyPoints || [])].join(' '))
      });
    } else if (p.type === 'ranking') {
      items.push({
        k: '比較',
        i: pic(p.slug === 'ihin' ? 'articles/ihin-price.webp' : 'articles/cleaning.webp'),
        u: '/rankings/' + p.slug + '.html',
        t: strip(p.h1 || p.title),
        d: strip(p.description),
        x: companies.filter((c) => (c.categories || [c.category]).includes(p.slug)).map((c) => c.name).join(' ')
      });
    } else if (p.type === 'review') {
      const c = byId[p.slug];
      if (c && !c.hasReview) continue;
      items.push({
        k: '業者の解説',
        i: pic('companies/' + p.slug + '.webp'),
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
