/* ============================================================
   assets/site.js  —  依存なしのバニラJS。全ページで読み込む。
     1) 最終確認日の自動更新
     2) スマホドロワー開閉
     3) ヘッダー圧縮 / 追従CTAの出し入れ
     4) スクロールリビール（1回だけ）
     5) data-aff → アフィリリンク解決 + rel/target 自動付与 + GA4計測
============================================================ */
(function () {
  "use strict";
  var d = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1) 最終確認日 ---------- */
  function stampDate() {
    var n = new Date();
    var jp = n.getFullYear() + "年" + (n.getMonth() + 1) + "月" + n.getDate() + "日";
    var iso = n.toISOString().slice(0, 10);
    Array.prototype.forEach.call(d.querySelectorAll("[data-today]"), function (el) {
      var p = el.getAttribute("data-today");        // "" | "prefix:最終確認："
      el.textContent = (p ? p : "") + jp;
      if (el.tagName === "TIME") el.setAttribute("datetime", iso);
    });
  }

  /* ---------- 2) ドロワー ---------- */
  function drawer() {
    var btn = d.querySelector(".nav-toggle");
    var dr = d.querySelector(".nav-drawer");
    if (!btn || !dr) return;
    function set(open) {
      dr.classList.toggle("is-open", open);
      d.body.classList.toggle("drawer-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () {
      set(!dr.classList.contains("is-open"));
    });
    dr.addEventListener("click", function (e) {
      if (e.target === dr || e.target.closest(".nav-drawer-close") || e.target.closest("a")) set(false);
    });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  }

  /* ---------- 3) ヘッダー圧縮 / 追従CTA ---------- */
  function onScroll() {
    var header = d.querySelector(".site-header");
    var cta = d.querySelector(".sticky-cta");
    var last = -1;
    function tick() {
      var y = window.pageYOffset;
      if (y === last) return;
      last = y;
      if (header) header.classList.toggle("is-scrolled", y > 80);
      if (cta) {
        var nearBottom = y + window.innerHeight > d.body.scrollHeight - 240;
        cta.classList.toggle("is-visible", y > 400 && !nearBottom);
      }
    }
    tick();
    window.addEventListener("scroll", function () { window.requestAnimationFrame(tick); }, { passive: true });
  }

  /* ---------- 4) スクロールリビール ---------- */
  function reveal() {
    var targets = d.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (reduce || !("IntersectionObserver" in window)) return;   // JS/OS設定次第で即表示
    d.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var i = Number(el.getAttribute("data-reveal")) || 0;
        el.style.transitionDelay = Math.min(i, 6) * 60 + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- 5) アフィリリンク解決 ---------- */
  function affiliates() {
    var MAP = window.AFFILIATES || {};
    var page = location.pathname;
    Array.prototype.forEach.call(d.querySelectorAll("a[data-aff]"), function (a, idx) {
      var id = a.getAttribute("data-aff");
      var c = MAP[id];
      if (!c) { console.warn("[aff] 未登録の企業ID:", id); return; }
      if (!a.textContent.trim()) a.textContent = c.name;

      if (c.url) {                        // ASP契約済み → 外部計測リンク
        a.href = c.url;
        a.setAttribute("rel", "sponsored nofollow noopener");
        a.setAttribute("target", "_blank");
        a.setAttribute("data-aff-external", "1");
      } else {                            // 未契約 → 自社レビューへ内部リンク（リンク切れ回避）
        a.href = c.review || "#";
        a.removeAttribute("rel");
        a.removeAttribute("target");
        a.removeAttribute("data-aff-external");
      }

      a.addEventListener("click", function () {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "affiliate_click",
          company_id: id,
          company_name: c.name,
          category: c.cat || "",
          has_link: !!c.url,
          page_path: page,
          position: a.getAttribute("data-aff-pos") || "body-" + idx
        });
      });
    });

    // 見積もりCTA
    if (window.ESTIMATE_URL) {
      Array.prototype.forEach.call(d.querySelectorAll("[data-estimate]"), function (a) {
        a.href = window.ESTIMATE_URL;
        a.setAttribute("rel", "sponsored nofollow noopener");
        a.setAttribute("target", "_blank");
      });
    }
  }

  /* ---------- 読み込みプログレスバー ---------- */
  function progress() {
    if (reduce) return;
    var bar = d.createElement("div");
    bar.className = "page-progress";
    d.body.appendChild(bar);
    requestAnimationFrame(function () { bar.style.width = "70%"; });
    window.addEventListener("load", function () {
      bar.style.width = "100%";
      setTimeout(function () { bar.style.opacity = "0"; }, 200);
    });
  }

  function init() { stampDate(); drawer(); onScroll(); reveal(); affiliates(); progress(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
