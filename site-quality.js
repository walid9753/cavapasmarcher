/* Generated-site quality gate. It validates the artifact before export or delivery. */
(function () {
  const required = ['<!doctype html', '<meta name="viewport"', '<title>', '<meta name="description"', '<style>', 'href="#contact"'];
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); window.setTimeout(() => el.classList.remove('show'), 2800); };
  const validate = (html) => {
    const source = String(html || '').toLowerCase();
    const checks = required.map((token) => ({ token, passed: source.includes(token) }));
    const unsafe = /<script\s+src=|javascript:/i.test(String(html || ''));
    const parsed = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const report = {
      passed: checks.every((check) => check.passed) && !unsafe && Boolean(parsed.querySelector('h1')),
      checks,
      unsafe,
      hasHeading: Boolean(parsed.querySelector('h1')),
      hasContact: Boolean(parsed.querySelector('#contact')),
      generatedAt: new Date().toISOString()
    };
    return report;
  };
  const showResult = (report) => {
    const preview = document.getElementById('site-preview');
    if (!preview?.parentNode) return;
    let badge = document.getElementById('site-quality-result');
    if (!badge) { badge = document.createElement('div'); badge.id = 'site-quality-result'; badge.className = 'site-quality-result'; preview.parentNode.insertBefore(badge, preview); }
    badge.dataset.status = report.passed ? 'passed' : 'failed';
    badge.textContent = report.passed ? '✓ Contrôle qualité réussi — site prêt à prévisualiser' : '⚠ Contrôle qualité incomplet — vérifiez le contenu généré';
  };
  window.addEventListener('cpm:site-generated', (event) => {
    const report = validate(event.detail?.html);
    window.CPMGeneratedSite = { ...window.CPMGeneratedSite, quality: report };
    showResult(report);
    if (!report.passed) toast('Le contrôle qualité a détecté un problème dans le site.');
  });
  window.CPMSiteQuality = { validate };
})();
