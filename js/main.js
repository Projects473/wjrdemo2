(function () {
  var WA = '14734037483', F = window.WJR_FARES, DEFAULT_AREA = 4;
  var $ = function (id) { return document.getElementById(id); };

  var tabs = document.querySelectorAll('[data-tab]');
  function showTab(name) {
    tabs.forEach(function (t) { var on = t.dataset.tab === name; t.setAttribute('aria-selected', on); $(t.getAttribute('aria-controls')).hidden = !on; });
    $('fareOut').hidden = false;
    currentTab = name; if (typeof updateFareOut === 'function' && fromSel) updateFareOut();
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { showTab(t.dataset.tab); }); });

  // ---------- Taxi rates ----------
  // Wayne's list gives fares from 6 pickup areas (columns) to every destination (rows). The same fare
  // applies in reverse, so any listed place can be the pickup or the drop-off. "MBIA airport / Royalton"
  // is split so the EC$10 airport pickup charge only applies to pickups at the airport itself.
  var AIRPORT_FEE = 10, EXTRA_PAX_FEE = 10, PAX_INCLUDED = 2, OTHER = 'other';
  var fromSel = $('txFrom'), toSel = $('txTo'), paxSel = $('txPax');
  // destinations that sit inside a pickup area use that area's column too
  var AREA_OF = { 'MBIA (Airport)': 4, 'Royalton Hotel': 4, "St. George's": 5, 'Secret Harbour': 1, 'Mahogany Run': 2, 'Calliste / Lavo Lanes': 3, 'Umbrellas': 0, 'Siesta Hotel': 0, 'Real Value IGA Supermarket': 0 };
  var AREA_ROW = { 'MBIA airport': 'MBIA (Airport)', 'Royalton': 'Royalton Hotel', "St. George's": "St. George's", 'Secret Harbour': 'Secret Harbour', 'Mahogany Run / BBC Beach': 'Mahogany Run', 'Lavo Lanes / Calliste': 'Calliste / Lavo Lanes' };
  function rowOf(name) { for (var i = 0; i < F.rows.length; i++) if (F.rows[i][0] === name) return i; return null; }
  var PLACES = [];
  F.origins.forEach(function (o, col) {
    var add = function (label, airport) { var r = AREA_ROW[label]; PLACES.push({ label: label, col: col, row: r ? rowOf(r) : null, airport: !!airport, group: 'Pickup areas' }); };
    if (col === 4) { add('MBIA airport', true); add('Royalton'); } else add(o.replace(/\s*\/\s*/g, ' / '));
  });
  F.rows.forEach(function (r, i) { var c = AREA_OF[r[0]]; PLACES.push({ label: r[0], col: c === undefined ? null : c, row: i, airport: r[0] === 'MBIA (Airport)', group: r[1] }); });
  var AIRPORT = 0;
  PLACES.forEach(function (pl, i) { if (pl.airport && pl.group === 'Pickup areas') AIRPORT = i; });
  function fillPlaces(sel) {
    var groups = {};
    PLACES.forEach(function (p, i) {
      var g = groups[p.group];
      if (!g) { g = groups[p.group] = document.createElement('optgroup'); g.label = p.group === 'Pickup areas' ? p.group : p.group + ' (parish)'; sel.appendChild(g); }
      g.appendChild(new Option(p.label, i));
    });
    var og = document.createElement('optgroup'); og.label = 'Not on the list?'; og.appendChild(new Option('Other place (type it in)', OTHER)); sel.appendChild(og);
  }
  fillPlaces(fromSel); fillPlaces(toSel); fromSel.value = AIRPORT;
  function rowIndex(name) { for (var i = 0; i < PLACES.length; i++) if (PLACES[i].group !== 'Pickup areas' && PLACES[i].label === name) return i; return -1; }
  // US$ for an EC$ amount, following the conversions used in the rate list (EC$60 = US$25, otherwise 40%)
  function usFor(ec) { return ec === 60 ? 25 : Math.round(ec * 0.4); }
  // Price for a trip: listed rate (1 to 2 passengers) + EC$10 airport pickup + EC$10 per extra passenger
  function quote(f, t, pax) {
    if (f === OTHER || t === OTHER || f === '' || t === '') return { base: null };
    var a = PLACES[f], b = PLACES[t], base = null;
    if (f === t) base = 0;
    else if (a.col !== null && b.row !== null) base = F.rows[b.row][2][a.col];
    else if (b.col !== null && a.row !== null) base = F.rows[a.row][2][b.col];
    if (!base) return { base: base };
    var air = a.airport ? AIRPORT_FEE : 0, extra = Math.max(0, pax - PAX_INCLUDED) * EXTRA_PAX_FEE;
    var ec = base[0] + air + extra;
    return { base: base, ec: ec, us: (air || extra) ? usFor(ec) : base[1], air: air, extra: extra, extraPax: Math.max(0, pax - PAX_INCLUDED) };
  }
  function quoteText(q) {
    if (q.base === 0) return 'Same area: ask for the rate';
    if (!q.base) return 'Quote needed';
    return 'EC$' + q.ec + ' / US$' + q.us;
  }
  // "Other place": swap the list for a text box, with a button to go back to the list
  function placeName(sel, inp) { return sel.value === OTHER ? (inp.value.trim() || '(not given)') : (sel.value === '' ? '-' : PLACES[+sel.value].label); }
  var fromOther = $('txFromOther'), toOther = $('txToOther');
  [[fromSel, fromOther], [toSel, toOther]].forEach(function (pair) {
    var sel = pair[0], inp = pair[1], field = sel.closest('.field');
    sel.addEventListener('change', function () { if (sel.value === OTHER) { field.classList.add('is-other'); inp.focus(); } });
    field.querySelector('.other-back').addEventListener('click', function () { field.classList.remove('is-other'); sel.value = sel === fromSel ? AIRPORT : ''; inp.value = ''; updateFareOut(); sel.focus(); });
    inp.addEventListener('input', updateFareOut);
  });
  var currentTab = 'taxi', rideBtn = document.querySelector('#p-taxi button[type="submit"]');
  function updateFareOut() {
    var out = $('fareOut');
    if (currentTab === 'rentals') { updateRentalOut(); return; }
    if (currentTab === 'tours') { updateTourOut(); return; }
    var other = fromSel.value === OTHER || toSel.value === OTHER;
    if (toSel.value === '' ) { out.textContent = 'Choose where you are going to see the rate'; rideBtn.textContent = 'Book this ride'; return; }
    var q = quote(fromSel.value, toSel.value, +paxSel.value);
    if (q.ec) { out.innerHTML = '<span>Your rate</span><b>EC$' + q.ec + '</b><em>US$' + q.us + '</em>'; rideBtn.textContent = 'Book this ride'; }
    else {
      out.textContent = q.base === 0 ? 'Same area: message us for the rate' : (other ? 'Not on our list? Send us the trip and WJR Taxi Tours & Auto Rentals will reply with a quote on WhatsApp.' : 'This trip is not on our rate list yet. Send it to us for a quote.');
      rideBtn.textContent = 'Request a quote';
    }
  }
  [fromSel, toSel, paxSel].forEach(function (el) { el.addEventListener('change', updateFareOut); });

  document.querySelectorAll('[data-dest]').forEach(function (card) {
    var i = rowIndex(card.dataset.dest); if (i < 0) return;
    card.querySelector('.r').textContent = PLACES[i].group;
    card.addEventListener('click', function () {
      showTab('taxi'); fromSel.closest('.field').classList.remove('is-other'); toSel.closest('.field').classList.remove('is-other');
      fromSel.value = AIRPORT; toSel.value = i; updateFareOut();
      $('book').scrollIntoView({ behavior: 'smooth' });
    });
  });
  $('destCount').textContent = F.rows.length;

  // ---------- Tour prices: half day or whole day for 1 to 2 people, plus EC$26 / US$10 per extra person ----------
  var TOUR = { half: { label: 'Half day (4 hours)', ec: 370, us: 140 }, full: { label: 'Whole day (7 hours)', ec: 650, us: 245 }, extraEc: 26, extraUs: 10, included: 2 };
  function tourQuote() {
        var len = TOUR[$('toLen').value], extra = Math.max(0, +$('toGuests').value - TOUR.included);
    return { ec: len.ec + extra * TOUR.extraEc, us: len.us + extra * TOUR.extraUs, len: len };
  }
  function updateTourOut() {
    var out = $('fareOut'), q = tourQuote();
    out.innerHTML = '<span>Tour price</span><b>EC$' + q.ec + '</b><em>US$' + q.us + '</em>';
  }
  ['toTour', 'toLen', 'toGuests'].forEach(function (id) { $(id).addEventListener('change', updateFareOut); });

  // ---------- Rentals: rates, booked dates and calendar ----------
  var R = window.WJR_RENTALS, DAY = 86400000;
  function carByOption(opt) { for (var i = 0; i < R.cars.length; i++) if (R.cars[i].option === opt) return R.cars[i]; return null; }
  function dnum(str) { var p = str.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / DAY; }   // day number
  function dstr(n) { return new Date(n * DAY).toISOString().slice(0, 10); }
  function isBooked(carId, n) {
    var list = R.booked[carId] || [];
    for (var i = 0; i < list.length; i++) if (n >= dnum(list[i][0]) && n <= dnum(list[i][1])) return true;
    return false;
  }
  function rangeFree(carId, a, b) { for (var n = a; n <= b; n++) if (isBooked(carId, n)) return false; return true; }
  function rentalQuote(car, a, b) {
    var days = Math.max(1, b - a), weekly = days >= 7, rate = weekly ? car.weekly : car.daily;
    return { days: days, weekly: weekly, rate: rate, total: days * rate };
  }
  function nice(n, withYear) { var o = { weekday: 'short', day: 'numeric', month: 'short' }; if (withYear) o.year = 'numeric'; return new Date(n * DAY).toLocaleDateString('en-GB', Object.assign(o, { timeZone: 'UTC' })); }
  function updateRentalOut() {
    var out = $('fareOut'), car = carByOption($('reCar').value), s = $('reStart').value, e = $('reEnd').value;
    if (!s || !e) { out.innerHTML = car ? '<span>' + car.name + '</span><b>EC$' + car.daily + '</b><em>per day</em><small>EC$' + car.weekly + ' per day for 7 days or more. Choose your dates for a total.</small>' : 'Rates from EC$130 per day. Choose a car and dates for a total.'; return; }
    var a = dnum(s), b = dnum(e);
    if (b < a) { out.textContent = 'The return date is before the pick-up date.'; return; }
    if (!car) {
      var free = R.cars.filter(function (c) { return rangeFree(c.id, a, b); }).map(function (c) { return c.name; });
      out.innerHTML = free.length ? '<span>Free on these dates</span><em>' + free.join(', ') + '</em><small>Choose a car to see the total.</small>' : '<span class="warn">All cars are booked on some of these dates.</span>';
      return;
    }
    var q = rentalQuote(car, a, b);
    var warn = rangeFree(car.id, a, b) ? '' : '<small class="warn">This car is booked on some of these dates. See the availability calendar below.</small>';
    out.innerHTML = '<span>Estimated total</span><b>EC$' + q.total + '</b><em>' + q.days + ' day' + (q.days > 1 ? 's' : '') + ' × EC$' + q.rate + '</em><small>' + (q.weekly ? 'Weekly rate (7 days or more).' : 'Daily rate (less than 7 days). 7 days or more is EC$' + car.weekly + ' per day.') + '</small>' + warn;
  }
  ['reCar', 'reStart', 'reEnd'].forEach(function (id) { $(id).addEventListener('change', function () { if (currentTab === 'rentals') updateRentalOut(); if (id === 'reCar') { var c = carByOption(this.value); if (c) calSetCar(c.id); } }); });

  // Calendar
  var todayN = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / DAY);
  var cal = { car: R.cars[0].id, start: null, end: null, month: 0 };
  var firstMonth = (function () { var d = new Date(todayN * DAY); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; })();
  var MAX_MONTHS = 12;
  var calCars = $('calCars');
  R.cars.forEach(function (c) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = c.name; b.dataset.id = c.id;
    b.setAttribute('aria-pressed', c.id === cal.car);
    b.addEventListener('click', function () { calSetCar(c.id); });
    calCars.appendChild(b);
  });
  function calSetCar(id) {
    cal.car = id;
    calCars.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id); });
    if (cal.start !== null && !rangeFree(id, cal.start, cal.end === null ? cal.start : cal.end)) { cal.start = cal.end = null; }
    renderCal();
  }
  function monthHTML(y, m) {
    var first = Date.UTC(y, m, 1) / DAY, days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    var lead = (new Date(first * DAY).getUTCDay() + 6) % 7;   // weeks start on Monday
    var h = '<div class="cal-month"><h4>' + new Date(first * DAY).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }) + '</h4><div class="cal-days">';
    ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(function (d) { h += '<span class="dow">' + d + '</span>'; });
    for (var i = 0; i < lead; i++) h += '<span class="cal-day empty"></span>';
    for (var d = 0; d < days; d++) {
      var n = first + d, cls = 'cal-day', dis = '', label = nice(n, true);
      if (n < todayN) { cls += ' past'; dis = ' disabled'; }
      else if (isBooked(cal.car, n)) { cls += ' booked'; dis = ' disabled'; label += ', booked'; }
      if (n === todayN) cls += ' today';
      if (cal.start !== null) {
        var e = cal.end === null ? cal.start : cal.end;
        if (n === cal.start) cls += ' start';
        if (n === e && cal.end !== null) cls += ' end';
        if (n > cal.start && n < e) cls += ' in';
      }
      h += '<button type="button" class="' + cls + '" data-n="' + n + '" aria-label="' + label + '"' + dis + '>' + (d + 1) + '</button>';
    }
    return h + '</div></div>';
  }
  function renderCal() {
    var y = firstMonth.y, m = firstMonth.m + cal.month, html = '';
    for (var k = 0; k < 2; k++) { var mm = m + k; html += monthHTML(y + Math.floor(mm / 12), ((mm % 12) + 12) % 12); }
    $('calGrid').innerHTML = html;
    $('calPrev').disabled = cal.month <= 0; $('calNext').disabled = cal.month >= MAX_MONTHS - 2;
    renderSum();
  }
  function renderSum() {
    var car = R.cars.filter(function (c) { return c.id === cal.car; })[0], h = '<h4>' + car.name + '</h4>';
    if (cal.start === null) {
      h += '<p>EC$' + car.daily + ' per day for 1 to 6 days, or EC$' + car.weekly + ' per day for 7 days or more.</p><p class="fine">Tap your pick-up date to start.</p>';
    } else if (cal.end === null) {
      h += '<dl><dt>Pick-up</dt><dd>' + nice(cal.start) + '</dd></dl><p class="fine">Now tap your return date.</p>';
    } else {
      var q = rentalQuote(car, cal.start, cal.end);
      h += '<dl><dt>Pick-up</dt><dd>' + nice(cal.start) + '</dd><dt>Return</dt><dd>' + nice(cal.end) + '</dd><dt>Rental</dt><dd>' + q.days + ' day' + (q.days > 1 ? 's' : '') + '</dd><dt>Rate</dt><dd>EC$' + q.rate + ' per day' + (q.weekly ? ' (weekly)' : '') + '</dd></dl>'
        + '<div class="total"><span>Estimated total</span><b>EC$' + q.total + '</b></div>'
        + '<button class="btn btn-peach" type="button" id="calBook">Request on WhatsApp</button>'
        + '<button class="btn btn-ghost" type="button" id="calUse">Add to booking bar</button>'
        + '<p class="fine">Your dates are held once WJR Taxi Tours &amp; Auto Rentals confirms them on WhatsApp.</p>';
    }
    $('calSum').innerHTML = h;
    if ($('calBook')) {
      $('calBook').addEventListener('click', function () {
        var q = rentalQuote(car, cal.start, cal.end);
        sendWA(['Hello WJR Taxi Tours & Auto Rentals, I would like to rent a car.', 'Vehicle: ' + car.option, 'Pick-up date: ' + nice(cal.start, true), 'Return date: ' + nice(cal.end, true), 'Rental: ' + q.days + ' day' + (q.days > 1 ? 's' : '') + ' at EC$' + q.rate + ' per day', 'Estimated total: EC$' + q.total]);
      });
      $('calUse').addEventListener('click', function () {
        $('reCar').value = car.option; $('reStart').value = dstr(cal.start); $('reEnd').value = dstr(cal.end);
        ['reStart', 'reEnd'].forEach(function (id) { $(id).dispatchEvent(new Event('change')); });
        showTab('rentals'); $('book').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }
  $('calGrid').addEventListener('click', function (e) {
    var b = e.target.closest('.cal-day'); if (!b || b.disabled || !b.dataset.n) return;
    var n = +b.dataset.n;
    if (cal.start === null || cal.end !== null || n < cal.start) { cal.start = n; cal.end = null; }
    else if (n === cal.start) cal.end = n;
    else if (rangeFree(cal.car, cal.start, n)) cal.end = n;
    else { cal.start = n; cal.end = null; }
    renderCal();
  });
  $('calPrev').addEventListener('click', function () { if (cal.month > 0) { cal.month--; renderCal(); } });
  $('calNext').addEventListener('click', function () { if (cal.month < MAX_MONTHS - 2) { cal.month++; renderCal(); } });
  document.querySelectorAll('[data-cal]').forEach(function (b) {
    b.addEventListener('click', function () { var c = carByOption(b.dataset.cal); if (c) calSetCar(c.id); $('availability').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  });
  renderCal();
  // Live booked dates: read the bookings file Wayne updates on admin.html.
  // GitHub's API gives the newest copy straight away; the copy on the website itself is the fallback.
  (function () {
    var G = R.github || {}, file = R.bookingsFile || 'data/bookings.json';
    function use(d) {
      if (!d || !d.bookings) return;
      R.booked = {}; R.cars.forEach(function (c) { R.booked[c.id] = []; });
      d.bookings.forEach(function (bk) { if (R.booked[bk.car]) R.booked[bk.car].push([bk.start, bk.end]); });
      if (cal.start !== null && !rangeFree(cal.car, cal.start, cal.end === null ? cal.start : cal.end)) cal.start = cal.end = null;
      renderCal(); updateFareOut();
    }
    function fromSite() { return fetch(file + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }); }
    if (!window.fetch) return;
    var api = G.owner ? fetch('https://api.github.com/repos/' + G.owner + '/' + G.repo + '/contents/' + file + '?ref=' + (G.branch || 'main'), { headers: { Accept: 'application/vnd.github.raw+json' }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); }) : Promise.reject();
    api.catch(fromSite).then(use).catch(function () {});
  })();

  var sc = $('scroller');
  var step = function () { var c = sc.querySelector('.dest'); return c ? c.getBoundingClientRect().width + 24 : 300; };
  $('prev').addEventListener('click', function () { sc.scrollBy({ left: -step(), behavior: 'smooth' }); });
  $('next').addEventListener('click', function () { sc.scrollBy({ left: step(), behavior: 'smooth' }); });

  (function () {
    var tl = $('tourList'); if (!tl) return;
    var cards = tl.querySelectorAll('.tour'), pv = $('tPrev'), nx = $('tNext');
    var stepT = function () { return cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(tl).columnGap || 24); };
    var upd = function () {
      var max = tl.scrollWidth - tl.clientWidth - 2;
      pv.disabled = tl.scrollLeft <= 2; nx.disabled = tl.scrollLeft >= max;
      pv.parentNode.style.visibility = max > 0 ? '' : 'hidden';
    };
    pv.addEventListener('click', function () { tl.scrollBy({ left: -stepT(), behavior: 'smooth' }); });
    nx.addEventListener('click', function () { tl.scrollBy({ left: stepT(), behavior: 'smooth' }); });
    tl.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd); upd();
  })();

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
      var q = quote(fromSel.value, toSel.value, +paxSel.value);
      lines = [q.ec ? 'Hello WJR Taxi Tours & Auto Rentals, I would like to book a taxi.' : 'Hello WJR Taxi Tours & Auto Rentals, could you send me a quote for a taxi?', 'From: ' + placeName(fromSel, fromOther), 'To: ' + placeName(toSel, toOther), 'Passengers: ' + paxSel.value];
      if (q.ec) lines.push('Rate shown: ' + quoteText(q));
      lines.push('Pickup: ' + when('txWhen'));
    } else if (tab === 'tours') {
      var tq = tourQuote();
      lines = ['Hello WJR Taxi Tours & Auto Rentals, I would like to book a tour.', 'Tour: ' + v('toTour'), 'Length: ' + TOUR[$('toLen').value].label, 'Date: ' + when('toDate'), 'Pickup from: ' + v('toPickup'), 'Guests: ' + $('toGuests').value];
      if (tq) lines.push('Price shown: EC$' + tq.ec + ' / US$' + tq.us);
    } else {
      lines = ['Hello WJR Taxi Tours & Auto Rentals, I would like to rent a car.', 'Vehicle: ' + v('reCar'), 'Pick-up date: ' + when('reStart'), 'Return date: ' + when('reEnd'), 'Pickup location: ' + v('rePlace')];
      var rc = carByOption($('reCar').value);
      if (rc && $('reStart').value && $('reEnd').value && $('reEnd').value >= $('reStart').value) { var rq = rentalQuote(rc, dnum($('reStart').value), dnum($('reEnd').value)); lines.push('Rental: ' + rq.days + ' day' + (rq.days > 1 ? 's' : '') + ' at EC$' + rq.rate + ' per day', 'Estimated total: EC$' + rq.total); }
    }
    sendWA(lines);
  });
  function sendWA(lines) { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener'); }
  updateFareOut();

  document.querySelectorAll('[data-car]').forEach(function (b) {
    b.addEventListener('click', function () { $('reCar').value = b.dataset.car; showTab('rentals'); $('book').scrollIntoView({ behavior: 'smooth' }); });
  });
  document.querySelectorAll('[data-tour]').forEach(function (a) {
    a.addEventListener('click', function () { $('toTour').value = a.dataset.tour; showTab('tours'); });
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
  var fg = document.querySelector('.f-glass');
  fg.addEventListener('pointermove', function (e) { var r = fg.getBoundingClientRect(); fg.style.setProperty('--mx', (e.clientX - r.left) + 'px'); fg.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  bar.addEventListener('pointermove', function (e) { var r = bar.getBoundingClientRect(); bar.style.setProperty('--mx', (e.clientX - r.left) + 'px'); bar.style.setProperty('--my', (e.clientY - r.top) + 'px'); });

  var menuBtn = $('menuBtn'), links = $('navlinks');
  menuBtn.addEventListener('click', function () { var o = links.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });
  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });

  /* Reveal on scroll. Content is visible by default; it is only hidden once this script runs,
     and a scroll check backs up the observer so nothing can stay hidden (e.g. inside previews or iframes). */
  var rvs = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window && rvs.length) {
    var show = function (el) { el.classList.add('in'); };
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: .05 });
    rvs.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
    var check = function () { var vh = window.innerHeight || document.documentElement.clientHeight; rvs.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.95) show(el); }); };
    window.addEventListener('scroll', check, { passive: true }); window.addEventListener('resize', check); window.addEventListener('load', check);
    setTimeout(check, 300);
    setTimeout(function () { rvs.forEach(show); }, 4000);
  }
})();
