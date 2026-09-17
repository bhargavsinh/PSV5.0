/**
 * Pushti Sahitya V5.1 — Content guidance & source attribution
 *
 * Production protection without trapping the reader:
 *  - no DevTools detection
 *  - no keyboard traps / copy-ban on scripture
 *  - no right-click hijack of the whole page
 *
 * What it does:
 *  - stops accidental image drag (UX, not a security boundary)
 *  - marks images as non-draggable
 *  - appends a source line when a substantial excerpt is copied
 *  - adds a print-time archive notice
 *  - one-time console attribution
 *
 * Relies on CSP + legal notices for real protection.
 */
(function () {
  'use strict';
  if (window.__PS_PROTECT_V51__) return;
  window.__PS_PROTECT_V51__ = true;

  var SOURCE = 'https://www.pushtisahitya.org';
  var NOTICE =
    '\n\n— Source: Pushti Sahitya (' + SOURCE +
    ') — Free non-profit digital repository. This portal is NOT the official website of the Puṣṭi Sampradāya.';

  function isFormField(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function isImageLike(el) {
    if (!el) return false;
    if (el.tagName === 'IMG') return true;
    if (el.closest && el.closest('img, .portrait-wrap, .gallery-card, .gallery-grid, figure')) {
      return !!(el.tagName === 'IMG' || (el.closest && el.closest('img')));
    }
    return false;
  }

  document.addEventListener(
    'dragstart',
    function (e) {
      var t = e.target;
      if (t && (t.tagName === 'IMG' || (t.closest && t.closest('img')))) {
        e.preventDefault();
      }
    },
    true
  );

  document.addEventListener(
    'copy',
    function (e) {
      try {
        if (isFormField(document.activeElement)) return;
        var sel = window.getSelection && window.getSelection();
        if (!sel || sel.isCollapsed) return;
        var text = String(sel.toString() || '');
        if (text.replace(/\s+/g, ' ').trim().length < 80) return;
        if (!e.clipboardData) return;
        e.clipboardData.setData('text/plain', text.replace(/\s+$/, '') + NOTICE);
        e.preventDefault();
      } catch (err) {
        /* never break copy entirely */
      }
    },
    true
  );

  function markImages(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var imgs = scope.querySelectorAll ? scope.querySelectorAll('img') : [];
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.getAttribute('draggable')) img.setAttribute('draggable', 'false');
    }
  }

  function injectProtectStyle() {
    if (document.getElementById('ps-protect-style')) return;
    var style = document.createElement('style');
    style.id = 'ps-protect-style';
    style.textContent =
      'img{-webkit-user-drag:none}' +
      '@media print{#ps-print-source{display:block!important;margin-top:1.5rem;font-size:11px;color:#333}}';
    (document.head || document.documentElement).appendChild(style);
  }

  function onPrint() {
    if (document.getElementById('ps-print-source')) return;
    var p = document.createElement('p');
    p.id = 'ps-print-source';
    p.textContent =
      'Printed from Pushti Sahitya — ' +
      SOURCE +
      ' — Free non-profit archive. This portal is NOT the official website of the Puṣṭi Sampradāya.';
    var main = document.querySelector('main') || document.body;
    if (main) main.appendChild(p);
  }

  function boot() {
    injectProtectStyle();
    markImages(document);
    if (document.body && !document.body.dataset.psProtectObs) {
      document.body.dataset.psProtectObs = '1';
      try {
        var mo = new MutationObserver(function (muts) {
          for (var i = 0; i < muts.length; i++) {
            var nodes = muts[i].addedNodes;
            for (var j = 0; j < nodes.length; j++) {
              var n = nodes[j];
              if (n && n.nodeType === 1) markImages(n);
            }
          }
        });
        mo.observe(document.body, { childList: true, subtree: true });
      } catch (err) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('beforeprint', onPrint);

  try {
    if (!sessionStorage.getItem('ps-protect-notice')) {
      sessionStorage.setItem('ps-protect-notice', '1');
      console.info(
        'Pushti Sahitya — archival content. Please cite the source and respect copyright of editions and publishers. ' +
          SOURCE
      );
    }
  } catch (err) {}

  /* silence unused in some minifiers */
  void isImageLike;
})();
