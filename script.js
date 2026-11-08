/* YuzerAcc site runtime: theme, language (TR/EN), navigation, motion, lightbox. */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'yuzeracc-theme';
  var LANG_KEY = 'yuzeracc-lang';

  /* ---------------- Theme ---------------- */
  var ICON_SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v2M12 20.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.5 12h2M20.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  var ICON_MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#06060c' : '#f6f6fb');
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(savedTheme || 'dark');

  /* ---------------- Language ---------------- */
  // Turkish is authored in the HTML. English strings live in window.I18N_EN (i18n.js).
  // Original Turkish values are cached on first switch so toggling back is lossless.
  var cache = new WeakMap();
  var ATTRS = [['data-i18n-alt', 'alt'], ['data-i18n-aria', 'aria-label'], ['data-i18n-title', 'title'], ['data-i18n-content', 'content'], ['data-i18n-placeholder', 'placeholder']];

  function detectLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'tr') return q;
    try { var s = localStorage.getItem(LANG_KEY); if (s === 'en' || s === 'tr') return s; } catch (e) {}
    var nav = (navigator.language || 'tr').toLowerCase();
    return nav.indexOf('tr') === 0 ? 'tr' : 'en';
  }

  function remember(el) {
    if (cache.has(el)) return cache.get(el);
    var rec = { html: el.innerHTML, attrs: {} };
    ATTRS.forEach(function (p) { if (el.hasAttribute(p[0])) rec.attrs[p[1]] = el.getAttribute(p[1]); });
    cache.set(el, rec);
    return rec;
  }

  function applyLang(lang) {
    var dict = window.I18N_EN || {};
    root.setAttribute('lang', lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var rec = remember(el);
      var key = el.getAttribute('data-i18n');
      el.innerHTML = (lang === 'en' && dict[key] != null) ? dict[key] : rec.html;
    });
    ATTRS.forEach(function (p) {
      document.querySelectorAll('[' + p[0] + ']').forEach(function (el) {
        var rec = remember(el);
        var key = el.getAttribute(p[0]);
        var val = (lang === 'en' && dict[key] != null) ? dict[key] : rec.attrs[p[1]];
        if (val != null) el.setAttribute(p[1], val);
      });
    });
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute('content', lang === 'en' ? 'en_US' : 'tr_TR');
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
  window.YA = { applyLang: applyLang, lang: function () { return root.getAttribute('lang'); } };

  /* ---------------- Events ---------------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-theme-toggle]')) {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      return;
    }
    var langBtn = e.target.closest('.lang-switch button');
    if (langBtn) { applyLang(langBtn.getAttribute('data-lang')); return; }

    var toggle = e.target.closest('.menu-toggle');
    if (toggle) {
      var nav = document.querySelector('.nav-links');
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      return;
    }
    if (e.target.closest('.nav-links a')) {
      document.querySelector('.nav-links').classList.remove('open');
      var mt = document.querySelector('.menu-toggle');
      if (mt) { mt.classList.remove('active'); mt.setAttribute('aria-expanded', 'false'); }
    }

    var anchor = e.target.closest('a[href^="#"]');
    if (anchor && anchor.getAttribute('href').length > 1) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.pageYOffset - 84;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', anchor.getAttribute('href'));
      }
    }
  });

  /* ---------------- Lightbox ---------------- */
  var lb, lbImg, group = [], idx = 0;
  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<button class="icon-btn lb-close" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="icon-btn lb-prev" aria-label="Previous"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<img alt="">' +
      '<button class="icon-btn lb-next" aria-label="Next"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.lb-prev')) return step(-1);
      if (e.target.closest('.lb-next')) return step(1);
      if (e.target === lb || e.target.closest('.lb-close')) close();
    });
  }
  function show() { var el = group[idx]; lbImg.src = el.getAttribute('data-lightbox'); lbImg.alt = el.getAttribute('aria-label') || ''; }
  function step(d) { idx = (idx + d + group.length) % group.length; show(); }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-lightbox]');
    if (!t) return;
    e.preventDefault();
    if (!lb) buildLightbox();
    var g = t.getAttribute('data-group') || 'default';
    group = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox][data-group="' + g + '"]'));
    if (!group.length) group = [t];
    idx = Math.max(0, group.indexOf(t));
    show();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  /* ---------------- On ready ---------------- */
  function ready() {
    applyTheme(root.getAttribute('data-theme') || 'dark');
    applyLang(detectLang());

    var nav = document.querySelector('.navbar');
    function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    }

    // Cursor spotlight on cards (desktop pointers only)
    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', function (e) {
        var card = e.target.closest('.card');
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }

    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
