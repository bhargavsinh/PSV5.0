/**
 * Pushti Sahitya — Real Progress Loader
 * Uses PerformanceObserver + readyState for honest progress.
 * No fake random jumps.
 */
(function () {
  'use strict';

  var L = document.getElementById('ps-loader');
  if (!L) return;

  var F = document.getElementById('ps-fill');
  var N = document.getElementById('ps-pct-num');
  var done = false;
  var t25 = null;

  var seen = false;
  try {
    seen = sessionStorage.getItem('ps-loader-seen') === '1';
  } catch (e) {}

  // Critical resources we care about most (approximate weight)
  var criticalHints = [
    'style.css',
    'script.js',
    'loader.js',
    'protection.js',
    'digital-granthapal',
    'fonts.googleapis',
    'fonts.gstatic',
    'logo',
    'icon'
  ];

  var totalWeight = 0;
  var loadedWeight = 0;
  var resourceMap = {};

  function set(v) {
    v = Math.max(0, Math.min(100, Math.round(v)));
    if (F) F.style.width = v + '%';
    if (N) N.textContent = v;
    L.setAttribute('aria-valuenow', v);
  }

  function finish() {
    if (done) return;
    done = true;
    clearTimeout(t25);
    set(100);

    try {
      sessionStorage.setItem('ps-loader-seen', '1');
    } catch (e) {}

    var hold = seen ? 60 : 420;
    setTimeout(function () {
      L.classList.add('ps-hide');
      setTimeout(function () {
        if (L && L.parentNode) L.parentNode.removeChild(L);
      }, 480);
    }, hold);
  }

  function calcProgress() {
    if (done) return;

    var base = 0;
    if (document.readyState === 'interactive') base = 55;
    if (document.readyState === 'complete') base = 92;

    var resourcePct = 0;
    if (totalWeight > 0) {
      resourcePct = (loadedWeight / totalWeight) * 40; // max 40% from resources
    }

    var final = Math.min(98, base + resourcePct);
    set(final);

    if (document.readyState === 'complete' && loadedWeight >= totalWeight * 0.85) {
      finish();
    }
  }

  // Track real resources
  try {
    var obs = new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (entry.entryType !== 'resource') return;
        var name = entry.name || '';
        if (resourceMap[name]) return;
        resourceMap[name] = true;

        var weight = 1;
        for (var i = 0; i < criticalHints.length; i++) {
          if (name.indexOf(criticalHints[i]) !== -1) {
            weight = 3;
            break;
          }
        }

        totalWeight += weight;
        loadedWeight += weight;
        calcProgress();
      });
    });
    obs.observe({ type: 'resource', buffered: true });
  } catch (e) {
    // older browsers → fallback to readyState only
  }

  // readyState milestones
  function onReadyState() {
    calcProgress();
    if (document.readyState === 'complete') {
      setTimeout(finish, seen ? 80 : 280);
    }
  }

  document.addEventListener('readystatechange', onReadyState);
  window.addEventListener('load', function () {
    setTimeout(finish, seen ? 40 : 200);
  });

  // Safety timeout (same as before)
  t25 = setTimeout(function () {
    if (done) return;
    if (document.readyState === 'interactive' || document.readyState === 'complete' ||
        document.getElementById('main') || document.getElementById('site-header')) {
      finish();
      return;
    }
    window.location.href = '/offline.html';
  }, 25000);

  // Initial
  set(seen ? 18 : 4);
  calcProgress();

  // If already complete (very fast cache)
  if (document.readyState === 'complete') {
    finish();
  }
})();