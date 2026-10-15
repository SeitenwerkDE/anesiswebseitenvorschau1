/* ANESIS SOLTAU – Official DISH reservations, loaded once on demand. */
(function () {
  'use strict';
  if (window.anesisReservierung) return;
  var EID = 'hydra-52388a5c-6f80-462f-9a30-52fc939c60ac';
  var TAG = 'hors-' + EID;
  var overlay, previousFocus, scriptPromise;
  function close() {
    if (!overlay) return;
    overlay.classList.remove('rs-open');
    document.body.classList.remove('rs-lock');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  /* Das Formular passt sich der Höhe des Bildschirms an, damit nichts verdeckt wird. */
  function fit() {
    var frame = document.getElementById('reservationWidget');
    var modal = document.getElementById('rs-modal');
    if (!frame || !modal) return;
    var box = getComputedStyle(modal);
    var cap = parseFloat(box.maxHeight);
    if (!isFinite(cap) || cap <= 0) cap = window.innerHeight - 32;
    var used = parseFloat(box.paddingTop) + parseFloat(box.paddingBottom);
    Array.prototype.forEach.call(modal.children, function (child) {
      if (child === frame || child.contains(frame) || child.offsetParent === null) return;
      var s = getComputedStyle(child);
      if (s.position === 'absolute' || s.position === 'fixed') return;
      used += child.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom);
    });
    var room = cap - used;
    frame.style.height = Math.max(400, Math.min(560, Math.floor(room))) + 'px';
  }
  function loadWidget() {
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise(function (resolve, reject) {
      var colors = getComputedStyle(document.documentElement);
      function color(name) { return colors.getPropertyValue(name).trim(); }
      window._hors = [
        ['eid', EID], ['tagid', TAG], ['width', '100%'], ['height', '530'],
        ['foregroundColor', color('--foreground')], ['backgroundColor', color('--background')],
        ['linkColor', color('--primary')], ['errorColor', color('--foreground')],
        ['primaryButtonForegroundColor', color('--primary-foreground')],
        ['primaryButtonBackgroundColor', color('--primary')],
        ['secondaryButtonForegroundColor', color('--foreground')],
        ['secondaryButtonBackgroundColor', color('--background')]
      ];
      var script = document.getElementById('anesis-dish-script');
      if (script) { resolve(); return; }
      script = document.createElement('script');
      script.id = 'anesis-dish-script'; script.async = true;
      script.src = 'https://reservation.dish.co/widget.js';
      script.onload = function () {
        var frame = document.getElementById('reservationWidget');
        if (!frame) { reject(new Error('Widget unavailable')); return; }
        frame.title = 'Tischreservierung bei ANESIS SOLTAU über DISH';
        frame.addEventListener('load', function () {
          document.getElementById('rs-status').hidden = true;
          fit();
        });
        document.getElementById('rs-status').hidden = true;
        fit();
        resolve();
      };
      script.onerror = function () { script.remove(); scriptPromise = null; reject(new Error('DISH unavailable')); };
      document.head.appendChild(script);
    });
    return scriptPromise;
  }
  function build() {
    overlay = document.createElement('div'); overlay.id = 'rs-overlay';
    overlay.innerHTML = '<div id="rs-modal" role="dialog" aria-modal="true" aria-labelledby="rs-title">' +
      '<button id="rs-close" type="button" aria-label="Reservierung schließen">×</button>' +
      '<h2 id="rs-title">Tisch reservieren</h2>' +
      '<p class="rs-sub">Online-Reservierung über DISH</p>' +
      '<p id="rs-status" role="status">Reservierungsformular wird geladen …</p>' +
      '<div id="' + TAG + '"></div>' +
      '<p class="rs-hint">Für Ihre Reservierung werden Angaben an DISH übermittelt. <a href="https://cdn.reservation.dish.co/static-static/static/pp-tc/privacy_DE.pdf" target="_blank" rel="noopener noreferrer">Datenschutz bei DISH</a></p>' +
      '<a class="rs-btn rs-secondary" href="tel:+49519118700">Anrufen: +49 5191 18700</a></div>';
    document.body.appendChild(overlay);
    document.getElementById('rs-close').onclick = close;
    overlay.addEventListener('click', function (event) { if (event.target === overlay) close(); });
    document.addEventListener('keydown', function (event) {
      if (!overlay.classList.contains('rs-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        var items = overlay.querySelectorAll('button, iframe, a[href]');
        var first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }
  function open() {
    previousFocus = document.activeElement;
    if (!overlay) build();
    overlay.classList.add('rs-open'); document.body.classList.add('rs-lock');
    document.getElementById('rs-close').focus();
    fit();
    loadWidget().catch(function () {
      var status = document.getElementById('rs-status'); status.hidden = false;
      status.textContent = 'DISH ist momentan nicht erreichbar. Bitte schließen Sie das Fenster und versuchen Sie es erneut oder rufen Sie uns an.';
    });
  }
  window.anesisReservierung = open;
  document.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('a,button');
    if (!target || target.closest('#rs-overlay') || target.id === 'rs-fab') return;
    var text = target.textContent || '';
    // Echte Anruf-Links wie „Telefonisch reservieren“ oder „Anrufen“ wählen direkt die Nummer.
    if (/telefon|anruf/i.test(text)) return;
    if (/reserv/i.test(text)) { event.preventDefault(); event.stopPropagation(); open(); }
  }, true);
  /* Die untere Leiste auf dem Handy erscheint erst, wenn man ein Stück scrollt. */
  function barReveal() {
    var bar = document.querySelector('.fixed.inset-x-0.bottom-0');
    if (!bar || bar.dataset.barReveal) return;
    bar.dataset.barReveal = '1';
    var toggle = function () {
      var small = window.matchMedia('(max-width:767px)').matches;
      bar.classList.toggle('rs-bar-hidden', small && window.scrollY < Math.max(180, window.innerHeight * 0.4));
    };
    window.addEventListener('scroll', toggle, { passive: true });
    window.addEventListener('resize', toggle);
    toggle();
  }
  function init() {
    if (document.getElementById('rs-fab')) return;
    var button = document.createElement('button'); button.id = 'rs-fab'; button.type = 'button';
    button.innerHTML = '<span aria-hidden="true">🍽</span> Tisch reservieren'; button.onclick = open;
    document.body.appendChild(button);
    window.addEventListener('resize', fit);
    barReveal();
    if (location.hash === '#reservieren') open();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
