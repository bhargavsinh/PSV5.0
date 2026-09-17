/* Pushti Sahitya V5.1 — Service Worker
   HTML/JSON network-first, images cache-first, JS/CSS stale-while-revalidate.
   No bulk PDF precache. Same-origin only.
*/
const CACHE_VERSION = 'pushti-sahitya-v5.3-live';
const PRECACHE = [
  './index.html',
  './offline.html',
  './404.html',
  './granthas.html',
  './about.html',
  './shodash-granthas.html',
  './contact.html',
  './header.html',
  './footer.html',
  './style.css',
  './colors.css',
  './script.js',
  './protection.js',
  './loader.js',
  './digital-granthapal-v61.js',
  './digital-granthapal-v61.css',
  './digital-granthapal-v62.js',
  './digital-granthapal-v62.css',
  './data/granthas.json',
  './manifest.webmanifest',
  './favicon.ico',
  './favicon.svg',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  './images/icons/apple-touch-icon.png',
  './images/logo-96.jpg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return Promise.all(
        PRECACHE.map(function (u) {
          return cache.add(new Request(u, { cache: 'reload' })).catch(function () { return null; });
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

function sameOrigin(url) {
  try {
    return new URL(url, self.location.href).origin === self.location.origin;
  } catch (e) {
    return false;
  }
}

function isJSON(url) {
  return /granthas\.json|nav-map\.json|\.json(\?|$)/i.test(url);
}
function isImage(url) {
  return /\.(png|jpg|jpeg|webp|svg|ico|gif|avif)(\?|$)/i.test(url);
}
function isCode(url) {
  return /\.(css|js)(\?|$)/i.test(url);
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = req.url;
  if (!sameOrigin(url)) return;

  if (isJSON(url)) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var clone = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, clone); });
        }
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  if (isImage(url)) {
    event.respondWith(
      caches.match(req).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var clone = res.clone();
            caches.open(CACHE_VERSION).then(function (c) { c.put(req, clone); });
          }
          return res;
        });
      })
    );
    return;
  }

  if (isCode(url)) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var clone = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, clone); });
        }
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var clone = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(req, clone); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        return cached || caches.match('./offline.html');
      });
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
