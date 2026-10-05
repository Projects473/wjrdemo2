(function () {
  var WA = '14734037483', F = window.WJR_FARES, DEFAULT_AREA = 4;
  var $ = function (id) { return document.getElementById(id); };

  var tabs = document.querySelectorAll('[data-tab]');
  function showTab(name) {
    tabs.forEach(function (t) { var on = t.dataset.tab === name; t.setAttribute('aria-selected', on); $(t.getAttribute('aria-controls')).hidden = !on; });
    $('fareOut').hidden = name !== 'taxi';
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { showTab(t.dataset.tab); }); });

  var fromSel = $('txFrom'), toSel = $('txTo');
  F.origins.forEach(function (o, i) { var opt = new Option(o, i); if (i === DEFAULT_AREA) opt.selected = true; fromSel.add(opt); });
  var parishes = [];
  F.rows.forEach(function (r) { if (parishes.indexOf(r[1]) < 0) parishes.push(r[1]); });
  parishes.forEach(function (p) {
    var g = document.createElement('optgroup'); g.label = p;
    F.rows.forEach(function (r, i) { if (r[1] === p) g.appendChild(new Option(r[0], i)); });
    toSel.appendChild(g);
  });
  function rowIndex(name) { for (var i = 0; i < F.rows.length; i++) if (F.rows[i][0] === name) return i; return -1; }
  function fareFor(a, r) { return F.rows[r][2][a]; }
  function fareText(f) { if (f === 0) return 'Same area: ask for the rate'; if (!f) return 'Ask for the rate'; return 'EC$' + f[0] + ' / US$' + f[1]; }
  function updateFareOut() {
    var out = $('fareOut');
    if (toSel.value === '') { out.textContent = 'Choose a destination to see the rate'; return; }
    var f = fareFor(+fromSel.value, +toSel.value);
    if (f) out.innerHTML = '<span>Your rate</span><b>EC$' + f[0] + '</b><em>US$' + f[1] + '</em>';
    else out.textContent = f === 0 ? 'Same area: message us for the rate' : 'Message us for this rate';
  }
  fromSel.addEventListener('change', updateFareOut);
  toSel.addEventListener('change', updateFareOut);

  document.querySelectorAll('[data-dest]').forEach(function (card) {
    var i = rowIndex(card.dataset.dest); if (i < 0) return;
    var f = fareFor(DEFAULT_AREA, i);
    var par = F.rows[i][1];
    card.querySelector('.r').innerHTML = par + ' · ' + (f ? '<b>EC$' + f[0] + '</b> / US$' + f[1] : 'Ask for the rate');
    card.addEventListener('click', function () {
      showTab('taxi'); fromSel.value = DEFAULT_AREA; toSel.value = i; updateFareOut();
      $('book').scrollIntoView({ behavior: 'smooth' });
    });
  });
  $('destCount').textContent = F.rows.length;

  var sc = $('scroller');
  var step = function () { var c = sc.querySelector('.dest'); return c ? c.getBoundingClientRect().width + 24 : 300; };
  $('prev').addEventListener('click', function () { sc.scrollBy({ left: -step(), behavior: 'smooth' }); });
  $('next').addEventListener('click', function () { sc.scrollBy({ left: step(), behavior: 'smooth' }); });

  $('booker').addEventListener('submit', function (e) {
    e.preventDefault();
    var tab = document.querySelector('[data-tab][aria-selected="true"]').dataset.tab, lines;
    var v = function (id) { return $(id).value.trim() || '-'; };
    var when = function (id) {
      var val = $(id).value; if (!val) return '-';
      var d = new Date(val.length === 10 ? val + 'T00:00' : val);
      var o = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      if (val.length > 10) { o.hour = 'numeric'; o.minute = '2-digit'; o.hour12 = true; }
      return d.toLocaleString('en-GB', o);
    };
    if (tab === 'taxi') {
      lines = ['Hello WJR Taxi Tours & Auto Rentals, I would like to book a taxi.', 'From: ' + F.origins[+fromSel.value], 'To: ' + (toSel.value === '' ? '-' : F.rows[+toSel.value][0])];
      if (toSel.value !== '') lines.push('Rate shown: ' + fareText(fareFor(+fromSel.value, +toSel.value)));
      lines.push('Pickup: ' + when('txWhen'), 'Guests: ' + v('txGuests'));
    } else if (tab === 'tours') {
      lines = ['Hello WJR Taxi Tours & Auto Rentals, I would like to ask about a tour.', 'Tour: ' + v('toTour'), 'Date: ' + when('toDate'), 'Pickup from: ' + v('toPickup'), 'Guests: ' + v('toGuests')];
    } else {
      lines = ['Hello WJR Taxi Tours & Auto Rentals, I would like to rent a car.', 'Vehicle: ' + v('reCar'), 'Pick-up date: ' + when('reStart'), 'Return date: ' + when('reEnd'), 'Pickup location: ' + v('rePlace')];
    }
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
  updateFareOut();

  document.querySelectorAll('[data-car]').forEach(function (b) {
    b.addEventListener('click', function () { showTab('rentals'); $('reCar').value = b.dataset.car; $('book').scrollIntoView({ behavior: 'smooth' }); });
  });
  document.querySelectorAll('[data-tour]').forEach(function (a) {
    a.addEventListener('click', function () { showTab('tours'); $('toTour').value = a.dataset.tour; });
  });

  var now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  var today = now.toISOString().slice(0, 10);
  $('txWhen').min = today + 'T00:00';
  ['toDate', 'reStart', 'reEnd'].forEach(function (id) { $(id).min = today; });
  $('reStart').addEventListener('change', function () { $('reEnd').min = this.value || today; if ($('reEnd').value && $('reEnd').value < this.value) $('reEnd').value = this.value; });
  document.querySelectorAll('.date-field input').forEach(function (inp) {
    var f = inp.closest('.date-field'), sync = function () { f.classList.toggle('filled', !!inp.value); };
    inp.addEventListener('input', sync); inp.addEventListener('change', sync); sync();
    inp.addEventListener('click', function () { try { if (inp.showPicker) inp.showPicker(); } catch (e) {} });
  });

  // Duplicate gallery photos so the strip loops smoothly
  var mq = document.querySelector('.marquee'); mq.innerHTML += mq.innerHTML;

  var nav = $('nav');
  var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 20); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  // Highlight the menu link for the section on screen
  var navA = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) navA.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['destinations', 'tours', 'rentals', 'contact'].forEach(function (id) { var el = $(id); if (el) spy.observe(el); });
    var heroEl = document.querySelector('.hero');
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) navA.forEach(function (a) { a.classList.remove('active'); }); }, { rootMargin: '-45% 0px -50% 0px' }).observe(heroEl);
  }

  // Windows-style reveal light that follows the pointer across the menu bar
  var bar = document.querySelector('.bar');
  bar.addEventListener('pointermove', function (e) { var r = bar.getBoundingClientRect(); bar.style.setProperty('--mx', (e.clientX - r.left) + 'px'); bar.style.setProperty('--my', (e.clientY - r.top) + 'px'); });

  var menuBtn = $('menuBtn'), links = $('navlinks');
  menuBtn.addEventListener('click', function () { var o = links.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });
  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    document.querySelectorAll('.rv').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });
  } else document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
})();
