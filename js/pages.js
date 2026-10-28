/* Header behaviour for the detail pages (menu, language, light/dark). Built from main.js by seo.py. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var nav = $('nav');
  var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 20); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Language translator: stores the choice in Google's "googtrans" cookie and reloads,
  // then Google Translate translates the page. English clears the cookie.
  (function () {
    var btn = $('langBtn'), menu = $('langMenu'), code = $('langCode'); if (!btn) return;
    var cur = (document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([\w-]+)/) || [])[1] || 'en';
    code.textContent = cur === 'zh-CN' ? '中文' : cur.toUpperCase();
    menu.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.lang === cur ? 'true' : 'false'); });
    var open = function (o) { menu.hidden = !o; btn.setAttribute('aria-expanded', o ? 'true' : 'false'); if (o) { var c = menu.querySelector('[aria-checked="true"]'); c && c.focus(); } };
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(menu.hidden); });
    document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) open(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); } });
    var setCookie = function (v) {
      var tail = v ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT', val = v ? '/en/' + v : '', host = location.hostname;
      document.cookie = 'googtrans=' + val + '; path=/' + tail;
      if (host.indexOf('.') > 0) document.cookie = 'googtrans=' + val + '; path=/; domain=.' + host + tail;
      if (!v) { var parts = host.split('.'); if (parts.length > 2) document.cookie = 'googtrans=; path=/; domain=.' + parts.slice(-2).join('.') + tail; }
    };
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-lang]'); if (!b) return;
      var l = b.dataset.lang; open(false); if (l === cur) return;
      setCookie(l === 'en' ? null : l);
      try { localStorage.setItem('wjr-lang', l); } catch (err) {}
      location.reload();
    });
    if (cur !== 'en') {
      var holder = document.createElement('div'); holder.id = 'google_translate_element'; document.body.appendChild(holder);
      window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'es,fr,de,it,pt,nl,zh-CN', autoDisplay: false }, 'google_translate_element');
      };
      var s = document.createElement('script'); s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'; s.async = true; document.body.appendChild(s);
    }
  })();

  // Charcoal / white version toggle
  var root = document.documentElement, tBtn = $('themeBtn');
  var syncBtn = function () { var l = root.getAttribute('data-theme') === 'light'; tBtn.setAttribute('aria-label', l ? 'Switch to the charcoal version' : 'Switch to the white version'); document.querySelector('meta[name="theme-color"]').content = l ? '#FFD3AC' : '#97CCF6'; };
  tBtn.addEventListener('click', function () {
    var l = root.getAttribute('data-theme') !== 'light';
    if (l) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('wjr-theme', l ? 'light' : 'dark'); } catch (e) {}
    syncBtn();
  });
  syncBtn();

  var menuBtn = $('menuBtn'), links = $('navlinks');
  menuBtn.addEventListener('click', function () { var o = links.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });
  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });

  // About page: photos and videos, refreshed from data/gallery.json (updated from the bookings page)
  var grid = $('galleryGrid'), lb = $('lightbox');
  function escH(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function draw(items) {
    grid.innerHTML = items.map(function (it) {
      var cap = escH(it.caption), media = it.type === 'video'
        ? '<video src="' + escH(it.src) + '" controls preload="metadata" playsinline></video>'
        : '<button type="button" class="gal-open" aria-label="View larger: ' + cap + '"><img src="' + escH(it.src) + '" alt="' + cap + '" loading="lazy"></button>';
      return '<figure class="gal-item glass">' + media + (cap ? '<figcaption>' + cap + '</figcaption>' : '') + '</figure>';
    }).join('');
  }
  if (grid) {
    fetch(grid.dataset.src + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.items && d.items.length) draw(d.items); }).catch(function () {});
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.gal-open'); if (!b || !lb || !lb.showModal) return;
      var img = b.querySelector('img'); lb.querySelector('img').src = img.src; lb.querySelector('img').alt = img.alt; lb.querySelector('p').textContent = img.alt; lb.showModal();
    });
  }
  if (lb) { lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); }); lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); }); }
})();
