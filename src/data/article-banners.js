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
   ▼下の2行を埋めると表示される。両方そろわない限り何も出ない（安全）。
     SIDE_AD_HREF  … A8のクリックURL（<a href="…"> の中身だけを貼る）
     SIDE_AD_PIXEL … A8の1×1計測タグのURL（無ければ空のままで可）
   ▼画像は public/images/ads/sidebar-240x120.png に置く（240×120で表示）。
   ============================================================ */
export const SIDE_AD_HREF = '';
export const SIDE_AD_PIXEL = '';
export const SIDE_AD_IMG = '/images/ads/sidebar-240x120.png';
