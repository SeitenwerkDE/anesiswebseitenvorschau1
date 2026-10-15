/* Echte Google-Bewertungen ersetzen die Platzhalter auf der Startseite.
   ENDPOINT: Adresse des Bewertungs-Dienstes. Auf GitHub Pages muss hier die
   veröffentlichte Lovable-Adresse stehen (…lovable.app/api/public/google-reviews). */
(function () {
  var ENDPOINT = window.ANESIS_REVIEWS_URL ||
    (location.hostname.indexOf('github.io') !== -1
      ? 'https://REPLACE-WITH-PUBLISHED-URL.lovable.app/api/public/google-reviews'
      : '/api/public/google-reviews');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function stars(n) {
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += '<svg width="20" height="20" viewBox="0 0 24 24" fill="' + (i <= n ? 'currentColor' : 'none') +
        '" stroke="currentColor" stroke-width="1.3"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>';
    }
    return '<div class="flex gap-0.5 text-primary" aria-label="' + n + ' von 5 Sternen">' + h + '</div>';
  }
  function card(r, hidden) {
    var text = r.text.length > 320 ? r.text.slice(0, 317).trim() + '…' : r.text;
    var ini = esc((r.author || '?').charAt(0).toUpperCase());
    var img = '<span class="gr-av" data-photo="' + esc(r.photo || '') + '" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:var(--primary);color:var(--primary-foreground);font-weight:600;overflow:hidden;flex:none">' + ini + '</span>';
    var name = r.authorUrl ? '<a href="' + esc(r.authorUrl) + '" target="_blank" rel="noopener" class="hover:underline">' + esc(r.author) + '</a>' : esc(r.author);
    return '<li aria-hidden="' + hidden + '" class="w-[82vw] max-w-sm shrink-0 border border-border bg-card p-7">' +
      '<div class="text-xs uppercase tracking-wider text-muted-foreground">Bewertung auf Google</div>' +
      '<div class="mt-4">' + stars(r.rating) + '</div>' +
      (text ? '<p class="mt-4 font-display text-xl leading-snug">„' + esc(text) + '“</p>' : '') +
      '<div class="mt-6 flex items-center gap-3">' + img + '<div><p class="text-sm font-medium">' + name +
      '</p><p class="text-xs text-muted-foreground">' + esc(r.time) + '</p></div></div></li>';
  }
  function render(data) {
    var list = document.querySelector('ul.marquee');
    if (!list || !data.reviews || !data.reviews.length) return;
    var a = data.reviews.map(function (r) { return card(r, false); }).join('');
    var b = data.reviews.map(function (r) { return card(r, true); }).join('');
    list.innerHTML = a + b;
    var box = list.parentElement;
    if (box && !document.getElementById('gr-summary')) {
      var s = document.createElement('p');
      s.id = 'gr-summary';
      s.className = 'mt-6 px-5 text-center text-sm text-muted-foreground';
      s.innerHTML = (data.rating ? esc(String(data.rating).replace('.', ',')) + ' von 5 Sternen · ' : '') +
        esc(data.count) + ' Bewertungen auf Google' +
        (data.url ? ' · <a href="' + esc(data.url) + '" target="_blank" rel="noopener" class="underline">Alle Bewertungen ansehen</a>' : '');
      box.insertAdjacentElement('afterend', s);
    }
    photos();
  }
  function allowed() {
    try { var c = JSON.parse(localStorage.getItem('anesis-cookie-consent')); return !!(c && c.preferences); } catch (e) { return false; }
  }
  /* Profilfotos kommen von Google-Servern: erst nach Zustimmung zu „Komfort“ laden. */
  function photos() {
    if (!allowed()) return;
    Array.prototype.forEach.call(document.querySelectorAll('.gr-av[data-photo]'), function (el) {
      var u = el.getAttribute('data-photo'); el.removeAttribute('data-photo');
      if (!u) return;
      var i = new Image(); i.alt = ''; i.width = 36; i.height = 36; i.referrerPolicy = 'no-referrer';
      i.style.cssText = 'width:36px;height:36px;object-fit:cover';
      i.onload = function () { el.textContent = ''; el.appendChild(i); };
      i.src = u;
    });
  }
  window.addEventListener('anesis-consent', photos);
  function start() {
    if (!document.querySelector('ul.marquee')) return;
    fetch(ENDPOINT).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) setTimeout(function () { render(d); }, 300); })
      .catch(function () {});
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
