"""記事のアイキャッチ（白地＋カテゴリ色の丸アイコン＋左下に短い見出し）を生成する。
使い方: npx astro preview を起動せずに単体で実行できる。 python3 scripts/make-thumbs.py
pages.json の各記事の "thumb"（2行の短い見出し）と catTag の先頭カテゴリから
public/images/articles/{slug}.webp（1376x768）を作る。元の写真は public/images/articles-photo/ に保管。"""
import json, io
from playwright.sync_api import sync_playwright
from PIL import Image

COLORS = {'お悩み解決':'#17546E','料金相場':'#8A5A2B','生前整理':'#6B4E8A','実家じまい':'#17546E',
          '相続':'#17546E','賃貸':'#3E6B48','不用品回収':'#DE7A6C','生活':'#2F6F8F','手続き':'#6B4E8A'}
ICONS = {
 'お悩み解決':'<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 '料金相場':'<circle cx="12" cy="12" r="8.5"/><path d="M9 8l3 4 3-4M12 12v6M9 13.5h6M9 16h6"/>',
 '生前整理':'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 11l2 2 4-4M8.5 17h7"/>',
 '実家じまい':'<path d="M4 10l8-6 8 6v10H4z"/><path d="M10 20v-6h4v6"/>',
 '相続':'<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h4"/>',
 '賃貸':'<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
 '不用品回収':'<path d="M2 7h11v9H2zM13 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
 '手続き':'<path d="M6 3h9l3 3v15H6z"/><path d="M9 11l2 2 4-4M9 17h6"/>',
 '生活':'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
}
HTML = """<html><body style="margin:0"><div style="width:1376px;height:768px;background:#F1F4F6;position:relative;overflow:hidden;font-family:'Noto Sans CJK JP','Noto Sans JP',sans-serif">
<svg style="position:absolute;right:-40px;bottom:-60px;opacity:.10" width="560" height="560" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{ic}</svg>
<div style="position:absolute;left:150px;top:100px;width:170px;height:170px;border-radius:50%;background:{c};display:flex;align-items:center;justify-content:center">
<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{ic}</svg></div>
<div style="position:absolute;left:150px;bottom:100px">
<div style="font-size:42px;color:#7A8791;font-weight:700;margin-bottom:10px">{cat}</div>
<div style="font-size:92px;font-weight:700;line-height:1.3;color:#333">{l1}<br>{l2}</div></div></div></body></html>"""

pages = json.load(open('src/data/pages.json'))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1376,'height':768})
    for x in pages:
        if x.get('type') != 'article' or not x.get('thumb'): continue
        cat = x.get('thumbCat') or x['catTag'].split('／')[0]
        pg.set_content(HTML.format(c=COLORS.get(cat,'#17546E'), cat=cat, l1=x['thumb'][0], l2=x['thumb'][1], ic=ICONS.get(cat,ICONS['実家じまい'])))
        png = pg.screenshot()
        Image.open(io.BytesIO(png)).convert('RGB').save(f"public/images/articles/{x['slug']}.webp", 'WEBP', quality=86)
        print('made', x['slug'])
    b.close()
