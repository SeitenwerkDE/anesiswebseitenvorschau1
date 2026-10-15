/* ANESIS SOLTAU – Cookie-Hinweis (DSGVO-konform)
   - Keine Cookies/Tracking vor Einwilligung
   - Auswahl wird 12 Monate in localStorage gespeichert
   - Widerruf jederzeit über Link im Footer / Datenschutz */
(function () {
  "use strict";
  var KEY = "anesis-cookie-consent";
  var BASE = "/anesiswebseitenvorschau1/";

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function setConsent(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        necessary: true,
        preferences: !!value.preferences,
        statistics: !!value.statistics,
        marketing: !!value.marketing,
        date: new Date().toISOString()
      }));
    } catch (e) {}
    try { window.dispatchEvent(new Event('anesis-consent')); } catch (e) {}
  }

  function build() {
    var overlay = document.createElement("div");
    overlay.id = "cb-overlay";

    var banner = document.createElement("div");
    banner.id = "cb-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "cb-title");
    banner.innerHTML =
      '<h2 id="cb-title">Wir respektieren Ihre Privatsphäre</h2>' +
      '<p>Wir verwenden Cookies, um unsere Website optimal zu gestalten und die Zugriffe zu analysieren. ' +
      'Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten. ' +
      'Weitere Informationen finden Sie in unserer <a href="' + BASE + 'datenschutz/">Datenschutzerklärung</a>.</p>' +
      '<div class="cb-buttons">' +
      '<button type="button" class="cb-btn cb-btn-accept" id="cb-accept">Alle akzeptieren</button>' +
      '<button type="button" class="cb-btn cb-btn-decline" id="cb-decline">Nur notwendige</button>' +
      '<button type="button" class="cb-btn cb-btn-settings" id="cb-toggle">Einstellungen</button>' +
      '</div>' +
      '<div class="cb-details" id="cb-details">' +
      '<label class="cb-cat"><input type="checkbox" checked disabled>' +
      '<span><strong>Notwendig</strong><small>Technisch erforderlich für den Betrieb der Website. Kann nicht deaktiviert werden.</small></span></label>' +
      '<label class="cb-cat"><input type="checkbox" id="cb-preferences">' +
      '<span><strong>Komfort</strong><small>Speichert Ihre Einstellungen, z.&nbsp;B. bevorzugte Darstellung.</small></span></label>' +
      '<label class="cb-cat"><input type="checkbox" id="cb-statistics">' +
      '<span><strong>Statistik</strong><small>Hilft uns, die Nutzung der Website anonym zu verstehen und zu verbessern.</small></span></label>' +
      '<label class="cb-cat"><input type="checkbox" id="cb-marketing">' +
      '<span><strong>Marketing</strong><small>Ermöglicht personalisierte Inhalte und Werbung.</small></span></label>' +
      '<div class="cb-buttons"><button type="button" class="cb-btn cb-btn-accept" id="cb-save">Auswahl speichern</button></div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      overlay.classList.add("cb-show");
      banner.classList.add("cb-show");
    });

    function close() {
      overlay.classList.remove("cb-show");
      banner.classList.remove("cb-show");
      setTimeout(function () {
        overlay.remove();
        banner.remove();
      }, 300);
    }

    banner.querySelector("#cb-accept").addEventListener("click", function () {
      setConsent({ preferences: true, statistics: true, marketing: true });
      close();
    });
    banner.querySelector("#cb-decline").addEventListener("click", function () {
      setConsent({ preferences: false, statistics: false, marketing: false });
      close();
    });
    banner.querySelector("#cb-save").addEventListener("click", function () {
      setConsent({
        preferences: banner.querySelector("#cb-preferences").checked,
        statistics: banner.querySelector("#cb-statistics").checked,
        marketing: banner.querySelector("#cb-marketing").checked
      });
      close();
    });
    banner.querySelector("#cb-toggle").addEventListener("click", function () {
      banner.querySelector("#cb-details").classList.toggle("cb-open");
    });
  }

  // Widerruf: window.openCookieSettings() oder Link mit data-cookie-settings
  window.openCookieSettings = function () {
    if (document.getElementById("cb-banner")) return;
    build();
  };
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-cookie-settings]");
    if (t) { e.preventDefault(); window.openCookieSettings(); }
  });

  if (!getConsent()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", build);
    } else {
      build();
    }
  }
})();
