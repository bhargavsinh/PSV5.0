(function () {
  /* Path-aware protection.js loader (works on /policies/ and nested pages) */
  try {
    var path = window.location.pathname || '';
    var parts = path.split('/').filter(Boolean);
    if (parts.length && parts[parts.length - 1].indexOf('.') !== -1) parts.pop();
    var prefix = (parts[0] === 'policies') ? '../' : '';
    var psProtect = document.createElement('script');
    psProtect.src = prefix + 'protection.js?v=5.3';
    psProtect.defer = true;
    document.head.appendChild(psProtect);
  } catch (e) {}
})();
 
  /* Canonical Grantha data accessors — normalize mixed-case JSON fields */
  function getGranthaId(g) { return g && (g.id || g.ID || '') || ''; }
  function getGranthaTitle(g) { return g && (g.TITLE || g.title || '') || ''; }
  function getGranthaAuthor(g) { return g && (g.AUTHOR || g.author || '') || ''; }
  function getGranthaLanguage(g) {
    if (!g) return '';
    var l = g.LANGUAGE || g.language || '';
    if (Array.isArray(l)) return l.join(' / ');
    return String(l);
  }
  function getGranthaDescription(g) {
    if (!g) return '';
    return g.DESCRIPTION || g.DISCRIPTION || g.description || '';
  }
  function getGranthaFile(g) { return g && (g.FILE || g.file || '') || ''; }
  function getGranthaEbook(g) { return g && (g['E-Book'] || g.ebook || g.EBOOK || '') || ''; }
  function getGranthaResources(g) {
    if (!g) return [];
    if (Array.isArray(g.resources)) return g.resources;
    var out = [];
    var eb = getGranthaEbook(g);
    if (eb) out.push({ title: 'E-Book / PDF', type: 'PDF', url: eb });
    var f = getGranthaFile(g);
    if (f && !f.endsWith('.html')) out.push({ title: 'File', type: 'File', url: f });
    return out;
  }

 /**
 * Pushti Sahitya V5.1
 * Header/Footer injection · Search · Filters · Detail · Mobile nav
 * Security: textContent-based DOM, escape helpers, no eval, no inline handlers
 * Performance: path-aware assets, SW cache v4.0, deferred non-critical work
 */
(function () {
  'use strict';

  /* ============================================================
     EARLY mobile accordion — document capture, runs before partials
     Fixes Android submenu when header is injected via innerHTML
     ============================================================ */
  (function earlyMobileAcc() {
    if (window.__PS_EARLY_ACC__) return;
    window.__PS_EARLY_ACC__ = true;

    function findPanel(btn) {
      var acc = btn.closest ? btn.closest('.acc') : null;
      if (acc) {
        for (var n = acc.firstElementChild; n; n = n.nextElementSibling) {
          if (n !== btn && n.classList && n.classList.contains('acc-panel')) return n;
        }
      }
      var next = btn.nextElementSibling;
      return (next && next.classList && next.classList.contains('acc-panel')) ? next : null;
    }

    function closeSiblings(btn) {
      var acc = btn.closest ? btn.closest('.acc') : null;
      var scope = (acc && acc.parentElement) ? acc.parentElement : document;
      var kids = scope.children || [];
      for (var i = 0; i < kids.length; i++) {
        var child = kids[i];
        if (!child.classList || !child.classList.contains('acc') || child === acc) continue;
        var ob = null, op = null;
        for (var n = child.firstElementChild; n; n = n.nextElementSibling) {
          if (n.classList && n.classList.contains('acc-btn') && !ob) ob = n;
          if (n.classList && n.classList.contains('acc-panel') && !op) op = n;
        }
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (op) {
          op.classList.remove('is-open');
          try { op.style.display = 'none'; } catch (e) {}
        }
      }
    }

    function toggleBtn(btn) {
      var panel = findPanel(btn);
      if (!panel) {
        console.warn('[PS nav] no panel for', btn && btn.textContent);
        return;
      }
      var open = btn.getAttribute('aria-expanded') !== 'true';
      closeSiblings(btn);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        panel.classList.add('is-open');
        panel.style.setProperty('display', 'flex', 'important');
        panel.style.setProperty('visibility', 'visible', 'important');
        panel.style.setProperty('height', 'auto', 'important');
        panel.style.setProperty('max-height', 'none', 'important');
        panel.style.setProperty('opacity', '1', 'important');
        panel.style.setProperty('overflow', 'visible', 'important');
      } else {
        panel.classList.remove('is-open');
        panel.style.setProperty('display', 'none', 'important');
      }
    }

    function onActivate(e) {
      var el = e.target;
      if (!el || !el.closest) return;
      var btn = el.closest('.acc-btn');
      if (!btn) return;
      // Prefer mobile nav; also allow standalone .acc
      if (!btn.closest('#mobile-nav') && !btn.closest('.nav-mobile') && !btn.closest('.acc')) return;
      e.preventDefault();
      e.stopPropagation();
      if (btn.__psLock) return;
      btn.__psLock = true;
      setTimeout(function () { btn.__psLock = false; }, 320);
      toggleBtn(btn);
    }

    // Use pointerup when available (modern Android Chrome); else click.
    // Avoid touchend+click double-toggle which opens then immediately closes.
    var supportsPointer = typeof window.PointerEvent !== 'undefined';
    if (supportsPointer) {
      document.addEventListener('pointerup', function (e) {
        if (e.pointerType === 'mouse') {
          // mouse: wait for click for accessibility (keyboard still uses click path below)
          return;
        }
        onActivate(e);
      }, true);
      document.addEventListener('click', function (e) {
        // mouse / keyboard activation
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== '') return;
        // If a touch pointer already handled, skip
        var btn = e.target && e.target.closest && e.target.closest('.acc-btn');
        if (btn && btn.__psLock) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onActivate(e);
      }, true);
    } else {
      document.addEventListener('click', onActivate, true);
    }
  })();



  /** Detect site root prefix when pages live in subfolders (e.g. policies/) */
  function siteRoot() {
    try {
      var path = window.location.pathname || '';
      if (path.indexOf('/policies/') !== -1 || /\/policies\//.test(path)) {
        return '../';
      }
      // depth based on path segments after host
      var parts = path.split('/').filter(Boolean);
      // if last part is a file, ignore it
      if (parts.length && parts[parts.length - 1].indexOf('.') !== -1) {
        parts.pop();
      }
      if (parts.length >= 1 && parts[0] === 'policies') {
        return '../';
      }
      return '';
    } catch (e) {
      return '';
    }
  }
  function rootUrl(rel) {
    return siteRoot() + rel;
  }

  const DATA_URL = rootUrl('data/granthas.json');
  const DATA_URL_FALLBACK = rootUrl('granthas.json');
  let granthas = [];
  let filtered = [];
  let lastQueryTerms = [];

  /** XSS-safe escape for HTML text contexts */
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Sanitize URL — relative paths, pushtisahitya.org, and http(s) file links */
  function safeHref(url) {
    if (!url) return '#';
    var s = String(url).trim();
    if (/^\s*(javascript|data|vbscript|file):/i.test(s)) return '#';
    if (s.indexOf('//') === 0) return '#';
    if (/^https?:\/\//i.test(s)) return s;
    return s;
  }


  var PARTIAL_CACHE = 'pushti-sahitya-v5.3-live-partials';
  var PARTIAL_TIMEOUT_MS = 12000;

  var FALLBACK_HEADER = "<a class=\"skip-link\" href=\"#main\">Skip to content</a>\n<header class=\"site-header\">\n  <div class=\"container header-inner\">\n    <a href=\"index.html\" class=\"logo\" aria-label=\"Pushti Sahitya Home\">\n      <img class=\"logo-img\" src=\"images/logo-96.jpg\" alt=\"Pushti Sahitya\" width=\"48\" height=\"48\">\n      <span class=\"logo-text\">Pushti Sahitya</span>\n      <span class=\"version-badge\">V5.1</span>\n    </a>\n\n    <nav id=\"primary-navigation\" class=\"nav-main nav-mobile\" aria-label=\"Primary\">\n      <a href=\"index.html\" data-nav=\"home\">Home</a>\n\n      <div class=\"nav-dropdown\">\n        <button type=\"button\" class=\"nav-drop-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Acharyas</button>\n        <div class=\"nav-drop-panel\" hidden>\n          <a href=\"acharya-vallabhacharyaji.html\">Shri Vallabhacharyaji (Shri Mahaprabhuji)</a>\n          <a href=\"acharya-gopinathji.html\">Shri Gopinathji</a>\n          <a href=\"acharya-vitthalnathji.html\">Shri Vitthalnathji (Shri Gusaiji)</a>\n        </div>\n      </div>\n\n      <!-- Scriptures: true multi-level -->\n      <div class=\"nav-dropdown\">\n        <button type=\"button\" class=\"nav-drop-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Scriptures</button>\n        <div class=\"nav-drop-panel nav-panel-nested\" hidden>\n          <a href=\"shodash-granthas.html\">Ṣoḍaśa Granthas</a>\n\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">TatvarthDeep Nibandh</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"shastrarth-prakaran.html\">Shastrarth Prakaran</a>\n              <a href=\"sarvanirnaya-prakaran.html\">Sarvanirnaya Prakaran</a>\n              <a href=\"bhagwatarth-prakaran.html\">Shree Bhagwatarth Prakaran</a>\n            </div>\n          </div>\n\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Bhasya Granthas</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"purva-mimamsa-bhasya.html\">Purva Mimamsa bhasya</a>\n              <a href=\"anubhasya.html\">Anubhasya</a>\n              <a href=\"gayatribhasya.html\">Gayatribhasya</a>\n              <a href=\"prasthaan-ratnaakar.html\">Prasthaan Ratnaakar</a>\n            </div>\n          </div>\n\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Bhagwat Commentaries</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"shuksma-tika.html\">Shuksma Tika</a>\n              <a href=\"shree-subodhini.html\">Shree Subodhini</a>\n              <a href=\"bhagwat-commentaries.html\">Shreemad Bhagwatam - Various commentaries</a>\n            </div>\n          </div>\n\n          <a href=\"geetopanishad-commentaries.html\">Geetopanishad Commentaries</a>\n\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Prakaran Granthas</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"pancha-shloki.html\">Pancha Shloki</a>\n              <a href=\"shiksha-shloki.html\">Shiksha Shloki</a>\n              <a href=\"shodash-granthas.html\">Shodash Granthas</a>\n            </div>\n          </div>\n\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Vaad Granthas</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"patravalambana.html\">Patravalambana</a>\n              <a href=\"avtarvadavali.html\">Avtarvadavali</a>\n              <a href=\"other-vaad-granthas.html\">Other Vaad Granthas</a>\n            </div>\n          </div>\n\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Prakirna Granthas</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"naam-patharth.html\">Naam Patharth</a>\n              <a href=\"rup-varanarth.html\">Rup Varanarth</a>\n              <a href=\"leela-chintanarth.html\">Leela Chintanarth</a>\n              <a href=\"tatva-chintanarth.html\">Tatva Chintanarth</a>\n              <a href=\"vaarta-sahitya.html\">Vaarta Sahitya</a>\n              <a href=\"vachanamruts.html\">Vachanamruts</a>\n              <a href=\"jeevan-charitra.html\">Jeevan Charitra</a>\n              <a href=\"seva-vidhi.html\">Seva Vidhi</a>\n              <a href=\"kirtan-granthas.html\">Kirtan Granthas</a>\n              <a href=\"samagri-paak.html\">Samagri-Paak</a>\n              <a href=\"vanshavali.html\">Vallabhacharyaji Vanshavali</a>\n              <a href=\"sampraday-pradeep.html\">Sampraday Pradeep</a>\n              <a href=\"harirai-vangmuktavali.html\">Harirai Vangmuktavali</a>\n            </div>\n          </div>\n\n          <a href=\"manuscripts.html\">Manuscripts</a>\n          <a href=\"magazines.html\">Pushtimargiya Magazines</a>\n        </div>\n      </div>\n\n      <div class=\"nav-dropdown\">\n        <button type=\"button\" class=\"nav-drop-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Shodash</button>\n        <div class=\"nav-drop-panel nav-drop-wide\" hidden>\n          <a href=\"yamunashtakam.html\">a. Shree Yamunashtakam</a>\n          <a href=\"balbodh.html\">b. Balbodh</a>\n          <a href=\"siddhant-muktavali.html\">c. Siddhant Muktavali</a>\n          <a href=\"pushti-pravaha-maryada.html\">d. Pushti Pravaha Maryada Bhed</a>\n          <a href=\"siddhant-rahasyam.html\">e. Siddhant Rahasyam</a>\n          <a href=\"navratnam.html\">f. Navratnam</a>\n          <a href=\"antahkaran-prabodh.html\">g. Antahkaran Prabodh</a>\n          <a href=\"vivek-dhairya-ashraya.html\">h. Vivek Dhairya Ashraya</a>\n          <a href=\"krishnashraya.html\">i. Krishnashraya Stotram</a>\n          <a href=\"chatuhshloki.html\">j. Chatuhshloki</a>\n          <a href=\"bhakti-vardhini.html\">k. Bhakti Vadhini</a>\n          <a href=\"jalbhed.html\">l. JalBhed</a>\n          <a href=\"panch-padhyani.html\">m. PanchPadhyani</a>\n          <a href=\"sanyas-nirnaya.html\">n. Sanyas Nirnaya</a>\n          <a href=\"nirodh-lakshanam.html\">o. Nirodh Lakshanam</a>\n          <a href=\"sevafalam.html\">p. Sevafalam</a>\n        </div>\n      </div>\n\n      <div class=\"nav-dropdown\">\n        <button type=\"button\" class=\"nav-drop-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">More</button>\n        <div class=\"nav-drop-panel\" hidden>\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Misc. Scriptures</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"vedic.html\">Vedic</a>\n              <a href=\"puranic.html\">Puranic</a>\n              <a href=\"darshanic.html\">Darshanic</a>\n              <a href=\"sanskrit.html\">Sanskrit</a>\n              <a href=\"vyakarana.html\">Vyakarana</a>\n              <a href=\"koshas.html\">Koshas</a>\n              <a href=\"misc-scriptures.html\">Miscellaneous</a>\n            </div>\n          </div>\n          <div class=\"nav-nested\">\n            <button type=\"button\" class=\"nav-nested-btn\" aria-expanded=\"false\" aria-haspopup=\"true\">Seva Sahitya</button>\n            <div class=\"nav-submenu\" hidden>\n              <a href=\"vastra-sahitya.html\">Vastra Sahitya</a>\n              <a href=\"shringar-sahitya.html\">Shringar Sahitya</a>\n              <a href=\"anya-sahitya.html\">Anya Sahitya</a>\n              <a href=\"utsav-bhavna.html\">Utsav Bhavna</a>\n            </div>\n          </div>\n          <a href=\"articles.html\">Articles</a>\n          <a href=\"vachanamruts.html\">Vachanamruts</a>\n          <a href=\"granthas.html\">Search Granth</a>\n          <a href=\"subscribe.html\">Subscribe</a>\n          <a href=\"contact.html\">Contact Us</a>\n        </div>\n      </div>\n    </nav>\n\n    <button type=\"button\" class=\"nav-toggle\" aria-label=\"Open menu\" aria-expanded=\"false\" aria-controls=\"primary-navigation\" id=\"nav-toggle-btn\">\n      <svg width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 6h16M4 12h16M4 18h16\"/></svg>\n    </button>\n  </div>\n</header>\n\n\n\n\n\n";

  var FALLBACK_FOOTER =
    '<footer class="site-footer"><div class="container">' +
    '<p>Pushti Sahitya — Free non-profit digital repository. V5.1</p>' +
    '<p><a href="contact.html">Contact</a> · <a href="about.html">About</a> · ' +
    '<a href="policies/privacy-policy.html">Privacy</a> · <a href="policies/terms-and-conditions.html">Terms</a> · ' +
    '<a href="policies/disclaimer.html">Disclaimer</a></p></div></footer>';

  function fetchWithTimeout(url, ms) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) try { ctrl.abort(); } catch (e) {}
    }, ms || PARTIAL_TIMEOUT_MS);
    var opts = { credentials: 'same-origin', cache: 'default' };
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(url, opts).finally(function () {
      clearTimeout(timer);
    });
  }

  function cacheGet(url) {
    if (!('caches' in window)) return Promise.resolve(null);
    return caches.open(PARTIAL_CACHE).then(function (c) {
      return c.match(url);
    }).then(function (res) {
      return res && res.ok ? res.text() : null;
    }).catch(function () { return null; });
  }

  function cachePut(url, text) {
    if (!('caches' in window) || !text) return Promise.resolve();
    return caches.open(PARTIAL_CACHE).then(function (c) {
      return c.put(url, new Response(text, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }));
    }).catch(function () {});
  }

  function renderPartial(slot, html) {
    if (!slot || !html) return false;
    // Trusted same-origin static partial only
    slot.innerHTML = html;
    return true;
  }

  async function loadPartial(url, slot, fallbackHtml) {
    if (!slot) return;
    var cached = await cacheGet(url);
    if (cached) {
      renderPartial(slot, cached);
    }
    try {
      var res = await fetchWithTimeout(url, PARTIAL_TIMEOUT_MS);
      if (res && res.ok) {
        var text = await res.text();
        if (text && text.length > 50) {
          renderPartial(slot, text);
          cachePut(url, text);
          return;
        }
      }
    } catch (e) {
      // network/timeout — keep cache if present
    }
    if (!slot.innerHTML || !slot.innerHTML.trim()) {
      renderPartial(slot, fallbackHtml);
    }
  }


  function rewriteLinksForDepth() {
    var prefix = siteRoot();
    if (!prefix) return;
    var roots = [document.getElementById('site-header'), document.getElementById('site-footer')];
    roots.forEach(function (root) {
      if (!root) return;
      root.querySelectorAll('a[href]').forEach(function (a) {
        var h = a.getAttribute('href');
        if (!h || h.charAt(0) === '#' || /^(https?:|mailto:|tel:)/i.test(h)) return;
        if (h.indexOf('../') === 0 || h.indexOf('/') === 0) return;
        a.setAttribute('href', prefix + h);
      });
      root.querySelectorAll('img[src]').forEach(function (img) {
        var s = img.getAttribute('src');
        if (!s || /^(https?:|data:)/i.test(s)) return;
        if (s.indexOf('../') === 0 || s.indexOf('/') === 0) return;
        img.setAttribute('src', prefix + s);
      });
    });
  }

  async function injectPartials() {
    var headerSlot = document.getElementById('site-header');
    var footerSlot = document.getElementById('site-footer');
    // Parallel — independent failure domains
    await Promise.all([
      loadPartial(rootUrl('header.html'), headerSlot, FALLBACK_HEADER),
      loadPartial(rootUrl('footer.html'), footerSlot, FALLBACK_FOOTER)
    ]);
    rewriteLinksForDepth();
    initNav();
  }

  function initImageResilience() {
    document.querySelectorAll('img').forEach(function (img) {
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      img.addEventListener('error', function onErr() {
        img.removeEventListener('error', onErr);
        img.classList.add('img-failed');
        img.alt = img.alt || 'Image unavailable';
        // Keep layout: replace with neutral placeholder via CSS class
        try {
          img.removeAttribute('srcset');
        } catch (e) {}
      });
    });
  }


  var deferredInstallPrompt = null;

  function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredInstallPrompt = e;
      showInstallBanner(true);
    });
    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      showInstallBanner(false);
      try { localStorage.setItem('ps-pwa-installed', '1'); } catch (err) {}
    });
    // Already installed or previously dismissed
    try {
      if (localStorage.getItem('ps-pwa-installed') === '1') return;
      if (window.matchMedia('(display-mode: standalone)').matches) return;
    } catch (err) {}
  }

  function showInstallBanner(show) {
    var existing = document.getElementById('ps-install-banner');
    if (!show) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    var bar = document.createElement('div');
    bar.id = 'ps-install-banner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Install app');
    bar.className = 'ps-install-banner';
    bar.innerHTML =
      '<span class="ps-install-text">Install Pushti Sahitya for offline access</span>' +
      '<button type="button" class="btn btn-primary ps-install-btn" id="ps-install-btn">Install</button>' +
      '<button type="button" class="ps-install-dismiss" id="ps-install-dismiss" aria-label="Dismiss">×</button>';
    document.body.appendChild(bar);
    // force reflow for animation
    void bar.offsetWidth;
    bar.classList.add('is-visible');
    document.getElementById('ps-install-btn').addEventListener('click', function () {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(function (choice) {
        deferredInstallPrompt = null;
        showInstallBanner(false);
        if (choice && choice.outcome === 'accepted') {
          try { localStorage.setItem('ps-pwa-installed', '1'); } catch (err) {}
        }
      });
    });
    document.getElementById('ps-install-dismiss').addEventListener('click', function () {
      showInstallBanner(false);
      try { localStorage.setItem('ps-pwa-install-dismissed', String(Date.now())); } catch (err) {}
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register(rootUrl('sw.js'), { scope: siteRoot() || './' }).then(function (reg) {
      function showUpdateBanner() {
        if (document.getElementById('ps-update-banner')) return;
        var bar = document.createElement('div');
        bar.id = 'ps-update-banner';
        bar.className = 'ps-update-banner';
        bar.setAttribute('role', 'status');
        bar.innerHTML = '<span>New version available.</span>' +
          '<button type="button" class="btn btn-primary" id="ps-update-btn">Refresh</button>';
        document.body.appendChild(bar);
        document.getElementById('ps-update-btn').addEventListener('click', function () {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        });
      }
      if (reg.waiting) showUpdateBanner();
      reg.addEventListener('updatefound', function () {
        var worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', function () {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }).catch(function () {});
  }



  function closeAllNested(root) {
    (root || document).querySelectorAll('.nav-nested').forEach(function (wrap) {
      wrap.classList.remove('is-open');
      var btn = wrap.querySelector('.nav-nested-btn');
      var sub = wrap.querySelector('.nav-submenu');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (sub) {
        sub.classList.remove('is-open');
        sub.setAttribute('hidden', '');
      }
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(function (wrap) {
      wrap.classList.remove('is-open');
      var btn = wrap.querySelector('.nav-drop-btn');
      var panel = wrap.querySelector('.nav-drop-panel');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) {
        panel.classList.remove('is-open');
        panel.setAttribute('hidden', '');
      }
    });
    closeAllNested(document);
  }

  function setPanelOpen(btn, panel, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var wrap = btn.closest('.nav-dropdown') || btn.closest('.nav-nested');
    if (open) {
      panel.classList.add('is-open');
      panel.removeAttribute('hidden');
      if (wrap) wrap.classList.add('is-open');
    } else {
      panel.classList.remove('is-open');
      panel.setAttribute('hidden', '');
      if (wrap) wrap.classList.remove('is-open');
    }
  }

  function initNav() {
    var nav = document.getElementById('primary-navigation') || document.querySelector('.nav-main');
    var toggle = document.getElementById('nav-toggle-btn') || document.querySelector('.nav-toggle');
    if (!nav) return;

    // Canonical navigation: the same DOM/menu is used on desktop, mobile and PWA.
    // CSS changes presentation only; navigation data never gets duplicated.
    function isMobileLayout() {
      return window.matchMedia && window.matchMedia('(max-width: 1099px)').matches;
    }

    function closePanel(button, panel) {
      if (!button || !panel) return;
      button.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      panel.setAttribute('hidden', '');
    }

    function openPanel(button, panel) {
      if (!button || !panel) return;
      button.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      panel.removeAttribute('hidden');
    }

    function closeNested(scope) {
      (scope || nav).querySelectorAll('.nav-nested').forEach(function (item) {
        var b = item.querySelector(':scope > .nav-nested-btn');
        var p = item.querySelector(':scope > .nav-submenu');
        if (b && p) closePanel(b, p);
        item.classList.remove('is-open');
      });
    }

    function closeDropdowns(except) {
      nav.querySelectorAll(':scope > .nav-dropdown').forEach(function (item) {
        if (item === except) return;
        var b = item.querySelector(':scope > .nav-drop-btn');
        var p = item.querySelector(':scope > .nav-drop-panel');
        if (b && p) closePanel(b, p);
        item.classList.remove('is-open');
        closeNested(item);
      });
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
      document.body.style.overflow = '';
      closeDropdowns();
    }

    function openMenu() {
      nav.classList.add('is-open');
      document.body.classList.add('nav-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
      }
      if (isMobileLayout()) document.body.style.overflow = 'hidden';
    }

    if (toggle && !toggle.__psNavBound) {
      toggle.__psNavBound = true;
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (nav.classList.contains('is-open')) closeMenu();
        else openMenu();
      });
    }

    if (!nav.__psNavBound) {
      nav.__psNavBound = true;
      nav.addEventListener('click', function (e) {
        var topButton = e.target.closest && e.target.closest('.nav-drop-btn');
        if (topButton && nav.contains(topButton)) {
          e.preventDefault();
          e.stopPropagation();
          var topItem = topButton.closest('.nav-dropdown');
          var panel = topItem && topItem.querySelector(':scope > .nav-drop-panel');
          if (!panel) return;
          var wasOpen = topButton.getAttribute('aria-expanded') === 'true';
          closeDropdowns(topItem);
          if (wasOpen) closePanel(topButton, panel);
          else {
            topItem.classList.add('is-open');
            openPanel(topButton, panel);
          }
          return;
        }

        var nestedButton = e.target.closest && e.target.closest('.nav-nested-btn');
        if (nestedButton && nav.contains(nestedButton)) {
          e.preventDefault();
          e.stopPropagation();
          var nestedItem = nestedButton.closest('.nav-nested');
          var sub = nestedItem && nestedItem.querySelector(':scope > .nav-submenu');
          if (!sub) return;
          var wasNestedOpen = nestedButton.getAttribute('aria-expanded') === 'true';
          var parentPanel = nestedItem.closest('.nav-drop-panel');
          if (parentPanel) closeNested(parentPanel);
          if (wasNestedOpen) closePanel(nestedButton, sub);
          else {
            nestedItem.classList.add('is-open');
            openPanel(nestedButton, sub);
          }
          return;
        }

        var link = e.target.closest && e.target.closest('a[href]');
        if (link && nav.contains(link) && isMobileLayout()) {
          var href = link.getAttribute('href') || '';
          if (href.charAt(0) !== '#') setTimeout(closeMenu, 0);
        }
      });
    }

    // Desktop: hover/focus is CSS-driven; click still works and is keyboard accessible.
    // Mobile/PWA: the exact same dropdown DOM becomes an accordion/drawer.
    function syncLayout() {
      if (!isMobileLayout()) {
        nav.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Open menu');
        }
      }
    }
    syncLayout();
    if (!nav.__psResizeBound) {
      nav.__psResizeBound = true;
      window.addEventListener('resize', syncLayout, { passive: true });
    }

    if (!nav.__psDocBound) {
    nav.__psDocBound = true;
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !e.target.closest('.nav-toggle')) {
        if (isMobileLayout() && nav.classList.contains('is-open')) closeMenu();
        else closeDropdowns();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (isMobileLayout() && nav.classList.contains('is-open')) {
        closeMenu();
        if (toggle) try { toggle.focus(); } catch (_) {}
      } else {
        closeDropdowns();
      }
    });
    }

    // Active page.
    var page = document.body.getAttribute('data-page') || '';
    nav.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) a.setAttribute('aria-current', 'page');
    });
  }

  function fillSelect(select, options) {
    if (!select) return;
    select.innerHTML = '';
    var all = document.createElement('option');
    all.value = '';
    all.textContent = 'All';
    select.appendChild(all);
    options.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      select.appendChild(o);
    });
  }


  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightText(text, terms) {
    var s = esc(text || '');
    if (!terms || !terms.length) return s;
    try {
      var re = new RegExp('(' + terms.map(escapeRegExp).join('|') + ')', 'ig');
      return s.replace(re, '<mark class="search-hit">$1</mark>');
    } catch (e) {
      return s;
    }
  }

  function rankScore(g, terms) {
    if (!terms.length) return 0;
    var title = String(g.TITLE || g.title || '').toLowerCase();
    var author = String(g.AUTHOR || g.author || '').toLowerCase();
    var lang = String(g.LANGUAGE || '').toLowerCase();
    var disc = String(g.DISCRIPTION || g.DESCRIPTION || '').toLowerCase();
    var score = 0;
    terms.forEach(function (t) {
      if (title === t) score += 100;
      else if (title.indexOf(t) === 0) score += 80;
      else if (title.indexOf(t) !== -1) score += 50;
      if (author.indexOf(t) !== -1) score += 25;
      if (lang.indexOf(t) !== -1) score += 10;
      if (disc.indexOf(t) !== -1) score += 5;
    });
    return score;
  }

  function cardHTML(g) {
    var title = g.TITLE || g.title || '';
    var author = g.AUTHOR || g.author || '#';
    var lang = g.LANGUAGE || (Array.isArray(g.language) ? g.language.join(' / ') : (g.language || '#'));
    var disc = g.DISCRIPTION || g.DESCRIPTION || g.description || '';
    var ebook = g['E-Book'] || g.ebook || '#';
    var file = g.FILE || g.file || ((g.id || '') + '.html');
    if (!file || file === '#') file = 'granthas.html';
    var fileHref = esc(safeHref(file));
    var ebookHtml = '#';
    if (ebook && ebook !== '#') {
      if (/^https?:\/\//i.test(ebook) || /\.pdf($|\?)/i.test(ebook)) {
        ebookHtml = '<a href="' + esc(safeHref(ebook)) + '" target="_blank" rel="noopener noreferrer">E-Book</a>';
      } else {
        ebookHtml = esc(ebook);
      }
    }
    var discShort = (disc || '').slice(0, 180) + ((disc || '').length > 180 ? '…' : '');
    return (
      '<article class="grantha-card" role="listitem">' +
        '<h3><a href="' + fileHref + '">' + highlightText(title, lastQueryTerms) + '</a></h3>' +
        '<div class="grantha-fields">' +
          '<span><strong>AUTHOR:</strong> ' + highlightText(author, lastQueryTerms) + '</span>' +
          '<span><strong>LANGUAGE:</strong> ' + highlightText(lang, lastQueryTerms) + '</span>' +
          '<span><strong>DISCRIPTION:</strong> ' + highlightText(discShort, lastQueryTerms) + '</span>' +
          '<span><strong>E-Book:</strong> ' + ebookHtml + '</span>' +
        '</div>' +
        '<div class="grantha-actions">' +
          '<a class="btn btn-primary" href="' + fileHref + '">Open Grantha</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderGrid() {
    var grid = document.getElementById('grantha-grid');
    var countEl = document.getElementById('result-count');
    if (!grid) return;
    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>No Granthas found</h3><p>Try a different search or clear filters.</p></div>';
      if (countEl) countEl.textContent = '0 results';
      return;
    }
    grid.innerHTML = filtered.map(cardHTML).join('');
    if (countEl) countEl.textContent = filtered.length + ' result' + (filtered.length === 1 ? '' : 's');
  }

  function hasEbook(g) {
    var e = String(g['E-Book'] || g.ebook || '').trim();
    if (!e) return false;
    var low = e.toLowerCase();
    if (low === 'na' || low === 'n/a' || low === '-' || low === 'none' || low === 'null') return false;
    return true;
  }

  function fieldLang(g) {
    return String(g.LANGUAGE || (Array.isArray(g.language) ? g.language.join(' ') : (g.language || '')) || '').trim();
  }

  function fieldAuthor(g) {
    return String(g.AUTHOR || g.author || '').trim();
  }

  function populateFilterOptions() {
    var langSel = document.getElementById('filter-language');
    var authSel = document.getElementById('filter-author');
    if (langSel) {
      var langs = {};
      granthas.forEach(function (g) {
        var L = fieldLang(g);
        if (L) langs[L] = true;
      });
      Object.keys(langs).sort(function (a, b) { return a.localeCompare(b); }).forEach(function (L) {
        var opt = document.createElement('option');
        opt.value = L;
        opt.textContent = L;
        langSel.appendChild(opt);
      });
    }
    if (authSel) {
      var authors = {};
      granthas.forEach(function (g) {
        var A = fieldAuthor(g);
        if (A) authors[A] = true;
      });
      Object.keys(authors).sort(function (a, b) { return a.localeCompare(b); }).forEach(function (A) {
        var opt = document.createElement('option');
        opt.value = A;
        opt.textContent = A;
        authSel.appendChild(opt);
      });
    }
  }

  function applyFilters() {
    var q = ((document.getElementById('search-input') || {}).value || '').trim().toLowerCase();
    var terms = q ? q.split(/\s+/).filter(Boolean) : [];
    var langF = ((document.getElementById('filter-language') || {}).value || '');
    var authF = ((document.getElementById('filter-author') || {}).value || '');
    var ebookF = ((document.getElementById('filter-ebook') || {}).value || '');

    lastQueryTerms = terms.slice();
    filtered = granthas.filter(function (g) {
      if (langF && fieldLang(g) !== langF) return false;
      if (authF && fieldAuthor(g) !== authF) return false;
      if (ebookF === 'yes' && !hasEbook(g)) return false;
      if (ebookF === 'no' && hasEbook(g)) return false;
      if (!terms.length) return true;
      var hay = g._hay || [
        g.TITLE || g.title || '',
        g.AUTHOR || g.author || '',
        fieldLang(g),
        g.DISCRIPTION || g.DESCRIPTION || g.description || '',
        g['E-Book'] || g.ebook || '',
        g.FILE || g.file || ''
      ].join(' ').toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    });
    if (terms.length) {
      filtered.sort(function (a, b) {
        var d = rankScore(b, terms) - rankScore(a, terms);
        if (d) return d;
        return String(a.TITLE || '').localeCompare(String(b.TITLE || ''));
      });
    }
    renderGrid();
  }

  async function initLibrary() {
    var grid = document.getElementById('grantha-grid');
    if (!grid) return;
    try {
      var res = await fetch(DATA_URL, { credentials: 'same-origin' });
      if (!res.ok) res = await fetch(DATA_URL_FALLBACK, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load data');
      granthas = await res.json();
      if (!Array.isArray(granthas)) granthas = [];
      // Normalize fields once for faster repeated search
      granthas.forEach(function (g) {
        if (!g) return;
        if (g.DESCRIPTION && !g.DISCRIPTION) g.DISCRIPTION = g.DESCRIPTION;
        if (g.DISCRIPTION && !g.DESCRIPTION) g.DESCRIPTION = g.DISCRIPTION;
        g._hay = [
          g.TITLE || g.title || '',
          g.AUTHOR || g.author || '',
          g.LANGUAGE || g.language || '',
          g.DISCRIPTION || g.DESCRIPTION || g.description || '',
          g['E-Book'] || g.ebook || '',
          g.FILE || g.file || '',
          g.id || ''
        ].join(' ').toLowerCase();
      });
      try { if (typeof Object.freeze === 'function') Object.freeze(granthas); } catch (e) {}
      filtered = granthas.slice();

      var search = document.getElementById('search-input');
      var debounceTimer;
      if (search) {
        search.addEventListener('input', function () {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(applyFilters, 150);
        });
        search.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            search.value = '';
            applyFilters();
          }
        });
      }
      var clearBtn = document.getElementById('search-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          if (search) { search.value = ''; search.focus(); }
          var fl = document.getElementById('filter-language');
          var fa = document.getElementById('filter-author');
          var fe = document.getElementById('filter-ebook');
          if (fl) fl.value = '';
          if (fa) fa.value = '';
          if (fe) fe.value = '';
          applyFilters();
        });
      }
      populateFilterOptions();
      ['filter-language', 'filter-author', 'filter-ebook'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
      });
      // Support ?q= from home search
      try {
        var params = new URLSearchParams(window.location.search);
        var qParam = params.get('q');
        if (qParam && search) {
          search.value = qParam;
        }
      } catch (err) {}
      applyFilters();
    } catch (e) {
      console.error(e);
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>Could not load repository</h3></div>';
    }
  }

  async function initDetail() {
    var root = document.getElementById('detail-root');
    if (!root) return;
    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      root.innerHTML = '<div class="empty-state"><h3>No Grantha selected</h3><a class="btn btn-primary" href="granthas.html">Back to library</a></div>';
      return;
    }
    try {
      var res = await fetch(DATA_URL, { credentials: 'same-origin' });
      if (!res.ok) res = await fetch(DATA_URL_FALLBACK, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load data');
      var data = await res.json();
      var matches = (data || []).filter(function (x) { return getGranthaId(x) === id; });
      var g = matches[0];
      if (!g) {
        root.innerHTML = '<div class="empty-state"><h3>Grantha not found</h3><a class="btn btn-primary" href="granthas.html">Back to library</a></div>';
        return;
      }
      var title = getGranthaTitle(g);
      var author = getGranthaAuthor(g);
      var lang = getGranthaLanguage(g);
      var desc = getGranthaDescription(g);
      var resources = getGranthaResources(g);
      // Aggregate resources from all records sharing this id (editions/volumes)
      if (matches.length > 1) {
        matches.forEach(function (m) {
          getGranthaResources(m).forEach(function (r) {
            if (!resources.some(function (x) { return x.url === r.url; })) resources.push(r);
          });
        });
      }
      var resourcesHTML = '';
      if (resources.length) {
        resourcesHTML = '<table class="resource-table"><thead><tr><th scope="col">Title</th><th scope="col">Type</th><th scope="col">Link</th></tr></thead><tbody>' +
          resources.map(function (r) {
            return '<tr><td>' + esc(r.title || r.name || 'Resource') + '</td><td>' + esc(r.type || '') + '</td><td>' +
              (r.url ? '<a href="' + esc(safeHref(r.url)) + '" rel="noopener noreferrer" target="_blank">Open</a>' : '—') +
              '</td></tr>';
          }).join('') + '</tbody></table>';
      } else {
        resourcesHTML = '<p class="text-muted">No digital resources listed.</p>';
      }
      var editionNote = matches.length > 1 ? '<p class="text-muted">This entry represents ' + matches.length + ' related records (editions / volumes).</p>' : '';
      root.innerHTML =
        '<header class="grantha-header">' +
          '<nav class="breadcrumb"><a href="index.html">Home</a><span>→</span><a href="granthas.html">Granthas</a><span>→</span><span>' + esc(title) + '</span></nav>' +
          '<h1>' + esc(title) + '</h1>' +
          '<div class="grantha-meta">' +
            (author ? '<span class="meta-tag">' + esc(author) + '</span>' : '') +
            (lang ? '<span class="meta-tag">' + esc(lang) + '</span>' : '') +
          '</div>' +
        '</header>' +
        '<section><h2>About this Grantha</h2><p>' + esc(desc || 'Description not available.') + '</p>' + editionNote + '</section>' +
        '<section class="resource-section"><h2>Available Resources</h2>' + resourcesHTML + '</section>';
    } catch (e) {
      console.error(e);
      root.innerHTML = '<div class="empty-state"><h3>Error loading Grantha</h3></div>';
    }
  }

  function initHomeSearch() {
    var form = document.getElementById('home-search-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = ((document.getElementById('home-search') || {}).value || '').trim();
      var safe = q.replace(/[<>"']/g, '');
      window.location.href = safe ? 'granthas.html?q=' + encodeURIComponent(safe) : 'granthas.html';
    });
  }

  function initBackToTop() {
    if (document.querySelector(".back-to-top")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.textContent = "\u2191";
    document.body.appendChild(btn);
    function toggle() {
      if (window.scrollY > 400) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    }
    window.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", function () {
      try { window.scrollTo({ top: 0, behavior: "smooth" }); }
      catch (e) { window.scrollTo(0, 0); }
    });
    toggle();
  }


  /* =========================================================
     V5.0 — Dynamic 3D Perspective Tilt (Pop Art)
     Reacts to mouse on cards, buttons, major UI surfaces
     ========================================================= */
  function initPop3DTilt() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window && window.innerWidth < 900) return; // skip heavy tilt on small touch

    var selector = [
      '.grantha-card',
      '.feature-card',
      '.card',
      '.hero-glass',
      '.home-glass',
      '.btn',
      '.btn-primary',
      '.search-panel',
      '.table-wrap',
      '.portrait-wrap',
      '.logo',
      '.meta-tag',
      '.back-to-top',
            '.data-table'
    ].join(',');

    var maxTilt = 4; // degrees — subtle only
    var perspective = 900;

    function attach(el) {
      if (el.dataset.pop3dAttached) return;
      el.dataset.pop3dAttached = '1';
      el.classList.add('pop-3d');
      el.style.transformStyle = 'preserve-3d';

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var midX = rect.width / 2;
        var midY = rect.height / 2;
        var rotateY = ((x - midX) / midX) * maxTilt;
        var rotateX = ((midY - y) / midY) * maxTilt;
        el.style.transform =
          'perspective(' + perspective + 'px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.03,1.03,1.03)';
        el.classList.add('is-tilting');
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(' + perspective + 'px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        el.classList.remove('is-tilting');
      });
    }

    function scan() {
      document.querySelectorAll(selector).forEach(attach);
    }

    scan();
    // Re-scan after dynamic content (library load etc.)
    var observer = new MutationObserver(function () {
      scan();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }


  document.addEventListener("DOMContentLoaded", function () {
    registerServiceWorker();
    initInstallPrompt();
    injectPartials().then(function () {
      initHomeSearch();
      initLibrary();
      initDetail();
      initImageResilience();
      initBackToTop();
      initPop3DTilt();
    }).catch(function () {
      initHomeSearch();
      initLibrary();
      initDetail();
      initImageResilience();
      initBackToTop();
      initPop3DTilt();
    });
  });
})();
/* =========================================================
   Digital Granthapal V5.0 (site V5.0) — ADD-ONLY loader
   Does not alter existing behavior; loads modular assistant.
   ========================================================= */
(function () {
  'use strict';
  try {
    if (window.__DG_V61_BOOT) return;
    window.__DG_V61_BOOT = true;
    var s = document.createElement('script');
    s.src = (function () {
      try {
        var path = window.location.pathname || '';
        var parts = path.split('/').filter(Boolean);
        if (parts.length && parts[parts.length - 1].indexOf('.') !== -1) parts.pop();
        if (parts.length >= 1 && parts[0] === 'policies') return '../digital-granthapal-v61.js?v=5.3';
        return 'digital-granthapal-v61.js?v=5.3';
      } catch (e) {
        return 'digital-granthapal-v61.js?v=5.3';
      }
    })();
    s.defer = true;
    s.setAttribute('data-dg-v61', '1');
    document.head.appendChild(s);
  } catch (err) {
    /* non-fatal */
  }
})();
/* =========================================================
   Digital Granthapal V5.0 (site V5.0) — ADD-ONLY real-time search bridge
   Existing Grantha search remains the single source of truth.
   ========================================================= */
(function () {
  'use strict';
  try {
    if (window.__DG_V62_BOOT) return;
    window.__DG_V62_BOOT = true;
    window.__DG_UNIFIED = true;
    var s = document.createElement('script');
    s.src = (function () {
      try {
        var path = window.location.pathname || '';
        var parts = path.split('/').filter(Boolean);
        if (parts.length && parts[parts.length - 1].indexOf('.') !== -1) parts.pop();
        if (parts.length >= 1 && parts[0] === 'policies') return '../digital-granthapal-v62.js?v=5.3';
        return 'digital-granthapal-v62.js?v=5.3';
      } catch (e) {
        return 'digital-granthapal-v62.js?v=5.3';
      }
    })();
    s.defer = true;
    s.setAttribute('data-dg-v62', '1');
    document.head.appendChild(s);
  } catch (err) {
    /* non-fatal */
  }
})();
