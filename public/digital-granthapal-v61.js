/**
 * Digital Granthapal — V4.0
 * Virtual Librarian for the Pushti Sahitya Digital Granthalaya.
 * ADD-ONLY module · vanilla JS · no external dependencies · XSS-safe DOM APIs.
 */
(function () {
  'use strict';

  if (window.__DG_V61_LOADED) return;
  window.__DG_V61_LOADED = true;

  /** Site-root prefix for nested paths (e.g. policies/) */
  function siteRoot() {
    try {
      var path = window.location.pathname || '';
      var parts = path.split('/').filter(Boolean);
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

  function loadCss() {
    if (document.getElementById('dg-v61-css')) return;
    var link = document.createElement('link');
    link.id = 'dg-v61-css';
    link.rel = 'stylesheet';
    link.href = rootUrl('digital-granthapal-v61.css');
    document.head.appendChild(link);
  }

  /** SVG avatar — scholarly librarian with book (inline, lightweight) */
  function buildAvatarSvg() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'dg-stage');
    svg.setAttribute('viewBox', '0 0 64 80');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    // Soft ground shadow
    var shadow = document.createElementNS(ns, 'ellipse');
    shadow.setAttribute('cx', '32');
    shadow.setAttribute('cy', '76');
    shadow.setAttribute('rx', '18');
    shadow.setAttribute('ry', '3.5');
    shadow.setAttribute('fill', 'rgba(0,0,0,0.18)');
    svg.appendChild(shadow);

    // Torso group (breathing)
    var torso = document.createElementNS(ns, 'g');
    torso.setAttribute('class', 'dg-torso');

    // Robe / body
    var body = document.createElementNS(ns, 'path');
    body.setAttribute('d', 'M18 42 Q16 58 14 72 L50 72 Q48 58 46 42 Z');
    body.setAttribute('fill', '#0D0D3A');
    body.setAttribute('stroke', '#111');
    body.setAttribute('stroke-width', '1.2');
    torso.appendChild(body);

    // Sash
    var sash = document.createElementNS(ns, 'path');
    sash.setAttribute('d', 'M17 52 Q32 48 47 52 L46 56 Q32 52 18 56 Z');
    sash.setAttribute('fill', '#FF0080');
    sash.setAttribute('stroke', '#111');
    sash.setAttribute('stroke-width', '0.8');
    torso.appendChild(sash);

    // Collar
    var collar = document.createElementNS(ns, 'path');
    collar.setAttribute('d', 'M22 42 L32 48 L42 42 L40 44 L32 49 L24 44 Z');
    collar.setAttribute('fill', '#FFE566');
    collar.setAttribute('stroke', '#111');
    collar.setAttribute('stroke-width', '0.8');
    torso.appendChild(collar);

    svg.appendChild(torso);

    // Left arm (pointing)
    var armL = document.createElementNS(ns, 'g');
    armL.setAttribute('class', 'dg-arm-left');
    var armLPath = document.createElementNS(ns, 'path');
    armLPath.setAttribute('d', 'M46 44 Q54 48 56 58');
    armLPath.setAttribute('fill', 'none');
    armLPath.setAttribute('stroke', '#0D0D3A');
    armLPath.setAttribute('stroke-width', '5');
    armLPath.setAttribute('stroke-linecap', 'round');
    armL.appendChild(armLPath);
    var handL = document.createElementNS(ns, 'circle');
    handL.setAttribute('cx', '56');
    handL.setAttribute('cy', '58');
    handL.setAttribute('r', '3.2');
    handL.setAttribute('fill', '#F5D0A9');
    handL.setAttribute('stroke', '#111');
    handL.setAttribute('stroke-width', '0.8');
    armL.appendChild(handL);
    svg.appendChild(armL);

    // Right arm (wave)
    var armR = document.createElementNS(ns, 'g');
    armR.setAttribute('class', 'dg-arm-right');
    var armRPath = document.createElementNS(ns, 'path');
    armRPath.setAttribute('d', 'M18 44 Q10 48 9 56');
    armRPath.setAttribute('fill', 'none');
    armRPath.setAttribute('stroke', '#0D0D3A');
    armRPath.setAttribute('stroke-width', '5');
    armRPath.setAttribute('stroke-linecap', 'round');
    armR.appendChild(armRPath);
    var handR = document.createElementNS(ns, 'circle');
    handR.setAttribute('cx', '9');
    handR.setAttribute('cy', '56');
    handR.setAttribute('r', '3.2');
    handR.setAttribute('fill', '#F5D0A9');
    handR.setAttribute('stroke', '#111');
    handR.setAttribute('stroke-width', '0.8');
    armR.appendChild(handR);
    svg.appendChild(armR);

    // Book
    var book = document.createElementNS(ns, 'g');
    book.setAttribute('class', 'dg-book');
    var bookBody = document.createElementNS(ns, 'rect');
    bookBody.setAttribute('x', '24');
    bookBody.setAttribute('y', '54');
    bookBody.setAttribute('width', '16');
    bookBody.setAttribute('height', '12');
    bookBody.setAttribute('rx', '1.2');
    bookBody.setAttribute('fill', '#FF3B1F');
    bookBody.setAttribute('stroke', '#111');
    bookBody.setAttribute('stroke-width', '1');
    book.appendChild(bookBody);
    var bookSpine = document.createElementNS(ns, 'rect');
    bookSpine.setAttribute('x', '24');
    bookSpine.setAttribute('y', '54');
    bookSpine.setAttribute('width', '3');
    bookSpine.setAttribute('height', '12');
    bookSpine.setAttribute('fill', '#D10000');
    bookSpine.setAttribute('stroke', '#111');
    bookSpine.setAttribute('stroke-width', '0.6');
    book.appendChild(bookSpine);
    var bookLine = document.createElementNS(ns, 'line');
    bookLine.setAttribute('x1', '30');
    bookLine.setAttribute('y1', '58');
    bookLine.setAttribute('x2', '37');
    bookLine.setAttribute('y2', '58');
    bookLine.setAttribute('stroke', '#FFE566');
    bookLine.setAttribute('stroke-width', '1.2');
    book.appendChild(bookLine);
    var bookLine2 = document.createElementNS(ns, 'line');
    bookLine2.setAttribute('x1', '30');
    bookLine2.setAttribute('y1', '61');
    bookLine2.setAttribute('x2', '36');
    bookLine2.setAttribute('y2', '61');
    bookLine2.setAttribute('stroke', '#FFE566');
    bookLine2.setAttribute('stroke-width', '1');
    book.appendChild(bookLine2);
    svg.appendChild(book);

    // Head group
    var head = document.createElementNS(ns, 'g');
    head.setAttribute('class', 'dg-head');

    // Face
    var face = document.createElementNS(ns, 'ellipse');
    face.setAttribute('cx', '32');
    face.setAttribute('cy', '28');
    face.setAttribute('rx', '13');
    face.setAttribute('ry', '14');
    face.setAttribute('fill', '#F5D0A9');
    face.setAttribute('stroke', '#111');
    face.setAttribute('stroke-width', '1.2');
    head.appendChild(face);

    // Turban / scholarly headwrap
    var turban = document.createElementNS(ns, 'path');
    turban.setAttribute('d', 'M19 24 Q20 12 32 10 Q44 12 45 24 Q40 18 32 17 Q24 18 19 24 Z');
    turban.setAttribute('fill', '#1A1A6E');
    turban.setAttribute('stroke', '#111');
    turban.setAttribute('stroke-width', '1.1');
    head.appendChild(turban);
    var turbanBand = document.createElementNS(ns, 'path');
    turbanBand.setAttribute('d', 'M20 23 Q32 19 44 23');
    turbanBand.setAttribute('fill', 'none');
    turbanBand.setAttribute('stroke', '#FFE566');
    turbanBand.setAttribute('stroke-width', '2');
    head.appendChild(turbanBand);
    var turbanJewel = document.createElementNS(ns, 'circle');
    turbanJewel.setAttribute('cx', '32');
    turbanJewel.setAttribute('cy', '14');
    turbanJewel.setAttribute('r', '2.2');
    turbanJewel.setAttribute('fill', '#FF0080');
    turbanJewel.setAttribute('stroke', '#111');
    turbanJewel.setAttribute('stroke-width', '0.7');
    head.appendChild(turbanJewel);

    // Eyes
    var eyeL = document.createElementNS(ns, 'ellipse');
    eyeL.setAttribute('class', 'dg-eye');
    eyeL.setAttribute('cx', '27');
    eyeL.setAttribute('cy', '28');
    eyeL.setAttribute('rx', '2.1');
    eyeL.setAttribute('ry', '2.4');
    eyeL.setAttribute('fill', '#111');
    head.appendChild(eyeL);
    var eyeR = document.createElementNS(ns, 'ellipse');
    eyeR.setAttribute('class', 'dg-eye');
    eyeR.setAttribute('cx', '37');
    eyeR.setAttribute('cy', '28');
    eyeR.setAttribute('rx', '2.1');
    eyeR.setAttribute('ry', '2.4');
    eyeR.setAttribute('fill', '#111');
    head.appendChild(eyeR);

    // Gentle smile
    var smile = document.createElementNS(ns, 'path');
    smile.setAttribute('d', 'M27 35 Q32 39 37 35');
    smile.setAttribute('fill', 'none');
    smile.setAttribute('stroke', '#8B4513');
    smile.setAttribute('stroke-width', '1.2');
    smile.setAttribute('stroke-linecap', 'round');
    head.appendChild(smile);

    // Glasses (scholarly)
    var glassL = document.createElementNS(ns, 'circle');
    glassL.setAttribute('cx', '27');
    glassL.setAttribute('cy', '28');
    glassL.setAttribute('r', '4.2');
    glassL.setAttribute('fill', 'none');
    glassL.setAttribute('stroke', '#111');
    glassL.setAttribute('stroke-width', '1.1');
    head.appendChild(glassL);
    var glassR = document.createElementNS(ns, 'circle');
    glassR.setAttribute('cx', '37');
    glassR.setAttribute('cy', '28');
    glassR.setAttribute('r', '4.2');
    glassR.setAttribute('fill', 'none');
    glassR.setAttribute('stroke', '#111');
    glassR.setAttribute('stroke-width', '1.1');
    head.appendChild(glassR);
    var bridge = document.createElementNS(ns, 'line');
    bridge.setAttribute('x1', '31.2');
    bridge.setAttribute('y1', '28');
    bridge.setAttribute('x2', '32.8');
    bridge.setAttribute('y2', '28');
    bridge.setAttribute('stroke', '#111');
    bridge.setAttribute('stroke-width', '1');
    head.appendChild(bridge);

    svg.appendChild(head);
    return svg;
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') node.className = attrs[k];
        else if (k === 'textContent') node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (text != null) node.textContent = text;
    return node;
  }

  var state = {
    open: false,
    mode: 'idle',
    timers: []
  };

  function clearTimers() {
    state.timers.forEach(function (t) { clearTimeout(t); });
    state.timers = [];
  }

  function setMode(btn, mode) {
    btn.classList.remove('dg-idle', 'dg-greet', 'dg-read', 'dg-search', 'dg-nav');
    btn.classList.add('dg-' + mode);
    state.mode = mode;
  }

  function openPanel(panel, btn) {
    panel.classList.add('dg-open');
    btn.setAttribute('aria-expanded', 'true');
    state.open = true;
    setMode(btn, 'greet');
    var t = setTimeout(function () {
      if (state.open) setMode(btn, 'read');
    }, 1800);
    state.timers.push(t);
    var closeBtn = panel.querySelector('#dg-close');
    if (closeBtn) closeBtn.focus();
  }

  function closePanel(panel, btn) {
    panel.classList.remove('dg-open');
    btn.setAttribute('aria-expanded', 'false');
    state.open = false;
    clearTimers();
    setMode(btn, 'idle');
    btn.focus();
  }

  function focusSearchIfPresent() {
    var input = document.getElementById('search-input');
    if (input) {
      try {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        input.focus();
      }
      return true;
    }
    return false;
  }

  function go(path) {
    window.location.href = rootUrl(path);
  }

  function buildUI() {
    if (document.getElementById('dg-host')) return;

    var host = el('div', { id: 'dg-host', role: 'complementary', 'aria-label': 'Digital Granthapal assistant' });

    // Panel
    var panel = el('div', {
      id: 'dg-panel',
      role: 'dialog',
      'aria-modal': 'false',
      'aria-labelledby': 'dg-panel-title',
      'aria-describedby': 'dg-panel-desc'
    });

    panel.appendChild(el('button', {
      id: 'dg-close',
      type: 'button',
      'aria-label': 'Close Digital Granthapal panel'
    }, '×'));

    panel.appendChild(el('p', { id: 'dg-panel-sub' }, 'V4.0'));
    panel.appendChild(el('h2', { id: 'dg-panel-title' }, 'Digital Granthapal'));
    panel.appendChild(el('p', { id: 'dg-panel-desc' },
      'A Virtual Librarian of the Pushti Sahitya Digital Granthalaya. I can help you find granthas and navigate the library.'));

    var actions = el('div', { id: 'dg-actions' });

    function addAction(label, iconText, onActivate, isLink, href) {
      var btn;
      if (isLink) {
        btn = el('a', {
          className: 'dg-action',
          href: rootUrl(href),
          role: 'button'
        });
      } else {
        btn = el('button', {
          className: 'dg-action',
          type: 'button'
        });
      }
      var icon = el('span', { className: 'dg-action-icon', 'aria-hidden': 'true' }, iconText);
      btn.appendChild(icon);
      btn.appendChild(document.createTextNode(label));
      if (onActivate) {
        btn.addEventListener('click', function (e) {
          if (!isLink) e.preventDefault();
          onActivate(e);
        });
      }
      actions.appendChild(btn);
      return btn;
    }

    addAction('Find a Grantha', '📖', function () {
      setMode(avatarBtn, 'search');
      if (!focusSearchIfPresent()) {
        go('granthas.html');
      } else {
        closePanel(panel, avatarBtn);
      }
    });

    addAction('Library Home', '🏠', function () {
      setMode(avatarBtn, 'nav');
      go('index.html');
    }, true, 'index.html');

    addAction('Search Grantha', '🔍', function () {
      setMode(avatarBtn, 'search');
      go('granthas.html');
    }, true, 'granthas.html');

    addAction('Ṣoḍaśa Granthas', '📿', function () {
      setMode(avatarBtn, 'nav');
      go('shodash-granthas.html');
    }, true, 'shodash-granthas.html');

    addAction('About the Library', 'ℹ️', function () {
      setMode(avatarBtn, 'nav');
      go('about.html');
    }, true, 'about.html');

    panel.appendChild(actions);
    panel.appendChild(el('p', { id: 'dg-panel-footer' },
      'Digital Granthapal · V4.0 · Guidance only — existing library content is unchanged.'));

    // Avatar button
    var avatarBtn = el('button', {
      id: 'dg-avatar-btn',
      type: 'button',
      className: 'dg-idle',
      'aria-expanded': 'false',
      'aria-controls': 'dg-panel',
      'aria-label': 'Open Digital Granthapal, virtual librarian'
    });
    avatarBtn.appendChild(buildAvatarSvg());

    avatarBtn.addEventListener('click', function () {
      if (state.open) closePanel(panel, avatarBtn);
      else openPanel(panel, avatarBtn);
    });

    // Keyboard: Escape closes
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) {
        e.preventDefault();
        closePanel(panel, avatarBtn);
      }
    });

    // Click outside closes
    document.addEventListener('click', function (e) {
      if (!state.open) return;
      if (!host.contains(e.target)) {
        closePanel(panel, avatarBtn);
      }
    });

    host.appendChild(panel);
    host.appendChild(avatarBtn);
    document.body.appendChild(host);

    // Occasional idle variation (gentle)
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(function () {
        if (state.open || state.mode !== 'idle') return;
        setMode(avatarBtn, 'read');
        var t = setTimeout(function () {
          if (!state.open) setMode(avatarBtn, 'idle');
        }, 2200);
        state.timers.push(t);
      }, 14000);
    }
  }

  function init() {
    loadCss();
    buildUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
