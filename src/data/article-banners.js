/* ============================================================
   記事中段の広告（A8.net）  PC用 468×60 / SP用 234×60
   ─────────────────────────────────────────────────────────
   ▼差し替えたいときは、下の PC_AD / SP_AD を、A8.netの管理画面から
     コピーしたコードで上書きするだけで、お役立ち情報の10記事すべてに反映される。
   ▼リンク（a8mat）はPC用とSP用で別々なので、クリックは素材ごとに計測される。
   ▼画面幅480px以下ではSP用、それより広い場合はPC用を表示する。
   ▼このファイルは .js なので scripts/check-aff-links.mjs の走査対象外
     （同スクリプトの仕様：「.html / .astro のみ。.js は式なので対象外」）。
   ============================================================ */

/* PC用 468×60 */
export const PC_AD = `<a href="https://px.a8.net/svt/ejp?a8mat=4BCGFP+61B8KY+3UHU+644DT" rel="nofollow">
<img border="0" width="468" height="60" alt="" src="https://www28.a8.net/svt/bgt?aid=260921653365&wid=001&eno=01&mid=s00000017949001027000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4BCGFP+61B8KY+3UHU+644DT" alt="">`;

/* SP用 234×60 */
export const SP_AD = `<a href="https://px.a8.net/svt/ejp?a8mat=4BCGFP+61B8KY+3UHU+61C2P" rel="nofollow">
<img border="0" width="234" height="60" alt="" src="https://www23.a8.net/svt/bgt?aid=260921653365&wid=001&eno=01&mid=s00000017949001014000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4BCGFP+61B8KY+3UHU+61C2P" alt="">`;

/* ============================================================
   サイドバー用（240×120）  カードとカードの間に入る枠
   ─────────────────────────────────────────────────────────
   ▼リンクは companies.json の該当社の affUrl を使う（ここにはURLを書かない）。
     企業を変えるときは SIDE_AD_AFF_ID を書き換える。
   ▼画像は public/images/ads/ に置く。表示は 240×120 固定。
   ============================================================ */
export const SIDE_AD_AFF_ID = '777fukujin';                        // ゴミ屋敷片付け 七福神
export const SIDE_AD_IMG    = '/images/ads/777fukujin_sidebar.webp';
