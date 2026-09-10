/* ============================================================
   assets/affiliates.js
   ★ アフィリエイトリンクの差し替えは このファイルだけ ★

   使い方:
     HTML側は企業名を  <a data-aff="ihinnoseiriyasan">遺品の整理屋さん</a>  と書く。
     url が "" のあいだは自動で review（自社レビュー記事）へ内部リンクされ、
     rel/target は付きません。ASP審査が通ったら url に計測URLを1行入れるだけで、
     全ページの該当企業名が一斉に計測リンクへ切り替わります。
============================================================ */

window.AFFILIATES = {
  /* ---------- 遺品整理・不用品回収 ---------- */
  ihinnoseiriyasan: { name: "遺品の整理屋さん",       cat: "ihin",     asp: "",  url: "", review: "/reviews/ihinnoseiriyasan.html" },
  "777fukujin":     { name: "ゴミ屋敷片付け七福神",   cat: "ihin",     asp: "",  url: "", review: "/reviews/777fukujin.html" },
  liferesetro:      { name: "ライフリセット",         cat: "huyouhin", asp: "",  url: "", review: "/reviews/liferesetro.html" },
  ihin110:          { name: "遺品整理110番",          cat: "ihin",     asp: "",  url: "", review: "/rankings/ihin.html#ihin110" },
  minnano:          { name: "みんなの遺品整理",       cat: "ihin",     asp: "",  url: "", review: "/rankings/ihin.html#minnano" },
  emeao:            { name: "EMEAO",                  cat: "matome",   asp: "",  url: "", review: "/rankings/ihin.html#emeao" },

  /* ---------- ハウスクリーニング ---------- */
  migakuru:         { name: "ミガクる",               cat: "cleaning", asp: "",  url: "", review: "/reviews/migakuru.html" },
  osoujikakumei:    { name: "おそうじ革命",           cat: "cleaning", asp: "",  url: "", review: "/reviews/osoujikakumei.html" },
  osoujihonpo:      { name: "おそうじ本舗",           cat: "cleaning", asp: "",  url: "", review: "/reviews/osoujihonpo.html" },
  yourmystar:       { name: "ユアマイスター",         cat: "cleaning", asp: "",  url: "", review: "/rankings/cleaning.html#yourmystar" },
  kajitaku:         { name: "カジタク",               cat: "cleaning", asp: "",  url: "", review: "/rankings/cleaning.html#kajitaku" }

  /* 追加はこの下に1行ずつ。20社まで表・カード・絞り込みが自動追従します。
     newcompany:    { name: "○○",  cat: "ihin",  asp: "A8",  url: "https://...", review: "" },
  */
};

/* サイト全体の見積もりフォーム（追従CTA・ヘッダーCTAの遷移先）
   一括見積系ASPの計測URLを入れる。空ならページ内 #estimate へ */
window.ESTIMATE_URL = "";
