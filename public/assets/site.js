/* ============================================================
   public/assets/site.js  —  依存なしのバニラJS。全ページで読み込む。
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
    n.setDate(n.getDate() - 7);
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

  /* ---------- 5) アフィリエイトリンクのクリック計測 ----------
     href / rel / target はビルド時に確定済み（src/data/companies.json）。
     ここではGA4への送信だけを行う */
  function affiliates() {
    Array.prototype.forEach.call(d.querySelectorAll("a[data-aff]"), function (a, idx) {
      a.addEventListener("click", function () {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "affiliate_click",
          company_id: a.getAttribute("data-aff"),
          company_name: (a.textContent || "").trim(),
          has_link: a.hasAttribute("data-aff-external"),
          page_path: location.pathname,
          position: a.getAttribute("data-aff-pos") || "body-" + idx
        });
      });
    });
    Array.prototype.forEach.call(d.querySelectorAll("[data-estimate]"), function (a) {
      a.addEventListener("click", function () {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "estimate_click", page_path: location.pathname, position: a.getAttribute("data-aff-pos") || "header" });
      });
    });
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

  /* ---------- 表の横スクロール枠を自動付与 ---------- */
  function wrapTables() {
    Array.prototype.forEach.call(d.querySelectorAll("table"), function (t) {
      if (t.closest(".table-wrap, .table-scroll")) return;
      var w = d.createElement("div");
      w.className = "table-scroll";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  /* ---------- 画面を横に押し広げている要素を検出（開発用） ---------- */
  function overflowCheck() {
    if (!/[?&]debug/.test(location.search)) return;
    var w = d.documentElement.clientWidth;
    Array.prototype.forEach.call(d.querySelectorAll("*"), function (el) {
      var r = el.getBoundingClientRect();
      if (r.right > w + 1 || r.left < -1) {
        console.warn("[overflow]", Math.round(r.left) + "→" + Math.round(r.right), el);
      }
    });
  }

  function init() { stampDate(); drawer(); onScroll(); wrapTables(); reveal(); affiliates(); progress(); overflowCheck(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
