/* Cronometras hero paragraph test. No personal data; analytics consent required. */
(function () {
  'use strict';
  var experiment = 'cronometras_hero_copy_v1';
  var key = 'ab:' + experiment;
  var end = Date.parse('2027-01-05T23:59:59Z');
  var paragraph = document.getElementById('hero-copy-experiment');
  var control = paragraph ? paragraph.innerHTML : '';
  var alternative = 'Registra los tiempos de tu operación, aplica suplementos y exporta el informe a PDF o Excel.';
  var preview = new URLSearchParams(location.search).get('ab_preview');
  var isPreview = preview === 'A' || preview === 'B';
  var exposedThisPage = false;
  var assignment = null;
  function consent() {
    try {
      var saved = JSON.parse(localStorage.getItem('consent-choice-v2') || 'null');
      if (saved && typeof saved.analytics === 'boolean') return saved.analytics && saved.expires > Date.now();
      var legacy = JSON.parse(localStorage.getItem('cookie-preferences') || 'null');
      return !!(legacy && legacy.analytics === true);
    } catch (_) { return false; }
  }
  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && (value.variant === 'A' || value.variant === 'B') && value.expires === end ? value : null;
    } catch (_) { return null; }
  }
  function save(value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function event(name) {
    if (!assignment || isPreview || !consent() || Date.now() > end || typeof window.gtag !== 'function') return;
    window.gtag('event', name, {
      experiment_id: experiment,
      experiment_variant: assignment.variant,
      page_path: location.pathname,
      transport_type: 'beacon'
    });
  }
  function initialize() {
    if (isPreview) {
      if (paragraph) paragraph.innerHTML = preview === 'B' ? alternative : control;
      return;
    }
    if (!consent() || Date.now() > end) {
      assignment = null;
      if (paragraph) paragraph.innerHTML = control;
      return;
    }
    assignment = read();
    if (!assignment && paragraph) {
      var random = new Uint32Array(1);
      crypto.getRandomValues(random);
      var value = { variant: random[0] < 2147483648 ? 'A' : 'B', expires: end };
      if (save(value)) assignment = value;
    }
    if (!assignment || !paragraph) return;
    paragraph.innerHTML = assignment.variant === 'B' ? alternative : control;
    if (!exposedThisPage) { event('ab_hero_view'); exposedThisPage = true; }
  }
  initialize();
  window.addEventListener('analytics-consent-change', function (e) {
    if (!e.detail.analytics) {
      try { localStorage.removeItem(key); } catch (_) {}
      assignment = null;
    }
    initialize();
  });
  document.addEventListener('click', function (e) {
    var target = e.target.closest && e.target.closest('a,button');
    if (target && /demo/i.test(target.textContent || '')) event('ab_demo_click');
  });
  window.addEventListener('demo-request-saved', function () {
    // Emitted only after the API confirms a successful Firestore save.
    // Count converting users (not submissions) in the experiment report.
    event('ab_demo_success');
  });
}());
