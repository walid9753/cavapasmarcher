/* Interactive local verification center. No external service required. */
(function () {
  const tests = [
    ['storage', 'Stockage local', () => Boolean(window.CPMStorage)],
    ['prospects', 'Prospects locaux', () => Array.isArray(window.CPMProspects?.read?.())],
    ['generator', 'Générateur de site', () => Boolean(window.CPMGeneratedSite || document.querySelector('#generate-site, [data-action="new-site"]'))],
    ['quality', 'Contrôle qualité', () => Boolean(window.CPMSiteQuality?.validate)],
    ['backup', 'Sauvegarde locale', () => Boolean(window.CPMLocalBackup?.collect)],
    ['api', 'API locale', async () => {
      try { const response = await fetch(`${window.CPM_API_URL || 'http://localhost:8787/api'}/health`); return response.ok; } catch { return false; }
    }]
  ];
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const toast = (message) => window.CPMApp?.toast?.(message);

  async function runOne(id) {
    const test = tests.find(([key]) => key === id);
    if (!test) return false;
    const result = await test[2]();
    const row = document.querySelector(`[data-test-row="${id}"]`);
    if (row) { row.dataset.status = result ? 'passed' : 'failed'; row.querySelector('.test-state').textContent = result ? 'Réussi' : 'À vérifier'; }
    return result;
  }

  async function runAll() {
    let passed = 0;
    for (const [id] of tests) if (await runOne(id)) passed += 1;
    const summary = document.querySelector('[data-test-summary]');
    if (summary) { summary.textContent = `${passed}/${tests.length} tests réussis`; summary.dataset.status = passed === tests.length ? 'passed' : 'failed'; }
    toast(`${passed}/${tests.length} tests terminés`);
    return { passed, total: tests.length };
  }

  function render() {
    const root = document.getElementById('app');
    if (!root) return;
    root.innerHTML = `<div class="page test-center-page">
      <div class="test-hero"><div><div class="eyebrow">QUALITÉ & VALIDATION</div><h1 class="page-title">Centre de tests</h1><p class="page-subtitle">Vérifiez chaque module du studio avant de créer et livrer un site.</p></div><div class="test-hero-actions"><button class="button primary" data-test-all>Tester tout</button><button class="button secondary" data-test-create>Créer un site web</button></div></div>
      <section class="test-summary card"><div><strong data-test-summary>Prêt à tester</strong><span>Contrôles locaux sans installation supplémentaire</span></div><span class="test-badge">Node.js 20+</span></section>
      <section class="test-grid">${tests.map(([id, label]) => `<article class="test-row card" data-test-row="${esc(id)}" data-status="pending"><span class="test-icon">✓</span><div><strong>${esc(label)}</strong><small>Vérification du module</small></div><span class="test-state">En attente</span><button class="button ghost" data-test-one="${esc(id)}">Tester</button></article>`).join('')}</section>
      <section class="test-help card"><strong>Parcours recommandé</strong><p>1. Lancez l’API avec <code>npm start</code>. 2. Cliquez sur <b>Tester tout</b>. 3. Cliquez sur <b>Créer un site web</b> pour vérifier le générateur.</p></section>
    </div>`;
    root.querySelector('[data-test-all]').onclick = runAll;
    root.querySelector('[data-test-create]').onclick = () => { document.querySelector('[data-page="overview"]')?.click(); setTimeout(() => document.querySelector('[data-action="new-site"]')?.click(), 80); };
    root.querySelectorAll('[data-test-one]').forEach((button) => { button.onclick = () => runOne(button.dataset.testOne); });
  }

  window.CPMTestCenter = { tests, render, runAll, runOne };
  window.addEventListener('cpm:show-tests', render);
})();
