"""記事のアイキャッチ（白地＋カテゴリ色の丸アイコン＋左下に短い見出し）を生成する。
使い方: npx astro preview を起動せずに単体で実行できる。 python3 scripts/make-thumbs.py
pages.json の各記事の "thumb"（2行の短い見出し）と catTag の先頭カテゴリから
public/images/articles/{slug}.webp（640x400）を作る。元の写真は public/images/articles-photo/ に保管。"""
import json, io
from playwright.sync_api import sync_playwright
from PIL import Image

_st = json.load(open('src/data/thumb-style.json'))
COLORS = _st['colors']
ICONS = _st['icons']
HTML = """<html><body style="margin:0"><div style="width:640px;height:400px;background:#F1F4F6;position:relative;overflow:hidden;font-family:'Noto Sans CJK JP','Noto Sans JP',sans-serif">
<svg style="position:absolute;right:-20px;bottom:-30px;opacity:.10" width="270" height="270" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{ic}</svg>
<div style="position:absolute;left:64px;top:48px;width:84px;height:84px;border-radius:50%;background:{c};display:flex;align-items:center;justify-content:center">
<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{ic}</svg></div>
<div style="position:absolute;left:64px;bottom:52px">
<div style="font-size:22px;color:#6B7883;font-weight:700;margin-bottom:6px">{cat}</div>
<div style="font-size:48px;font-weight:700;line-height:1.3;color:#333">{l1}<br>{l2}</div></div></div></body></html>"""

pages = json.load(open('src/data/pages.json'))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':640,'height':400})
    for x in pages:
        if x.get('type') != 'article' or not x.get('thumb'): continue
        cat = x.get('thumbCat') or x['catTag'].split('／')[0]
        pg.set_content(HTML.format(c=COLORS.get(cat,'#17546E'), cat=cat, l1=x['thumb'][0], l2=x['thumb'][1], ic=ICONS.get(cat,ICONS['実家じまい'])))
        png = pg.screenshot()
        Image.open(io.BytesIO(png)).convert('RGB').save(f"public/images/articles/{x['slug']}.webp", 'WEBP', quality=86)
        print('made', x['slug'])
    b.close()
