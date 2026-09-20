/* CavaPasMarcher — functional dashboard shell. */
(function () {
  const app = document.getElementById('app');
  if (!app) return;
  const state = { page: 'overview' };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const toast = (message) => {
    const node = document.getElementById('toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    window.setTimeout(() => node.classList.remove('show'), 2800);
  };
  const prospects = () => Array.isArray(window.CPMProspects?.read?.()) ? window.CPMProspects.read() : [];
  const header = (eyebrow, title, subtitle, action = '') => `<header class="headline"><div><div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1><p class="page-subtitle">${subtitle}</p></div>${action}</header>`;
  const actionButton = (label, action, kind = 'primary') => `<button type="button" class="button ${kind}" data-action="${action}">${label}</button>`;
  const openGenerator = () => {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.dataset.action = 'new-site';
    trigger.hidden = true;
    document.body.appendChild(trigger);
    trigger.click();
    trigger.remove();
    window.setTimeout(() => {
      if (!document.querySelector('#gen-name, .generator-page, .generator-layout')) toast('Le générateur n’a pas pu être chargé. Vérifiez la console du navigateur.');
    }, 200);
  };
  const overview = () => {
    const list = prospects();
    const average = list.length ? Math.round(list.reduce((total, item) => total + Number(item.score || 0), 0) / list.length) : 0;
    return `<div class="page">${header('STUDIO WEB · ESPACE DE TRAVAIL', 'Votre studio, enfin sous contrôle.', 'Créez des sites, suivez vos opportunités et vérifiez chaque module depuis un espace clair.', actionButton('+ Créer un site web', 'new-site'))}
      <section class="welcome-banner"><div><span class="eyebrow">PRÊT À PRODUIRE</span><h2>Transformez une idée en site professionnel.</h2><p>Commencez par le générateur, puis contrôlez votre résultat avant export.</p></div><button class="button light" data-action="new-site">Lancer le générateur <span>→</span></button></section>
      <div class="summary-grid"><article class="summary-card card"><span class="summary-label">Prospects actifs</span><strong>${list.length}</strong><small>dans votre pipeline local</small></article><article class="summary-card card"><span class="summary-label">Score moyen</span><strong>${average}%</strong><small>potentiel des opportunités</small></article><article class="summary-card card"><span class="summary-label">Modules disponibles</span><strong>06</strong><small>à vérifier dans le centre de tests</small></article></div>
      <div class="dashboard-grid"><section class="panel card"><div class="panel-heading"><div><span class="eyebrow">PIPELINE</span><h2>Opportunités prioritaires</h2></div><button class="button ghost" data-page="prospects">Voir tout →</button></div><div class="mini-table">${list.slice(0, 5).map((item) => `<div class="mini-row"><div class="entity"><span class="dot">${escapeHtml(item.icon || '•')}</span><div><strong>${escapeHtml(item.name || 'Sans nom')}</strong><small>${escapeHtml(item.type || item.sector || 'Prospect')}</small></div></div><strong>${Number(item.score || 0)}%</strong></div>`).join('') || '<p class="empty-state">Aucun prospect pour le moment.</p>'}</div></section><section class="panel card"><div class="panel-heading"><div><span class="eyebrow">ACCÈS RAPIDE</span><h2>Que voulez-vous faire ?</h2></div></div><div class="quick-actions"><button class="quick-action" data-action="new-site"><span class="quick-icon">✦</span><span><b>Créer un site web</b><small>Brief, prix et aperçu HTML</small></span><span>→</span></button><button class="quick-action" data-page="tests"><span class="quick-icon">✓</span><span><b>Tester l’application</b><small>Vérifier tous les modules</small></span><span>→</span></button><button class="quick-action" data-page="sites"><span class="quick-icon">▣</span><span><b>Ouvrir mes projets</b><small>Galerie et versions sauvegardées</small></span><span>→</span></button></div></section></div></div>`;
  };
  const prospectsPage = () => `<div class="page">${header('PROSPECTION', 'Vos prospects', 'Organisez les entreprises à contacter et préparez vos prochaines actions.', actionButton('+ Ajouter un prospect', 'new-prospect'))}<section class="panel card"><div class="table-wrap"><table><thead><tr><th>ENTREPRISE</th><th>SECTEUR</th><th>SCORE</th><th>STATUT</th><th>OPPORTUNITÉ</th></tr></thead><tbody>${prospects().map((item) => `<tr><td><div class="entity"><span class="dot">${escapeHtml(item.icon || '•')}</span><div><strong>${escapeHtml(item.name || 'Sans nom')}</strong><small>${escapeHtml(item.city || '')}</small></div></div></td><td>${escapeHtml(item.type || item.sector || '—')}</td><td><b class="score-pill">${Number(item.score || 0)}%</b></td><td><span class="status">${escapeHtml(item.status || 'À qualifier')}</span></td><td>${escapeHtml(item.issue || 'À analyser')}</td></tr>`).join('') || '<tr><td colspan="5" class="empty-state">Aucun prospect enregistré.</td></tr>'}</tbody></table></div></section></div>`;
  const settingsPage = () => `<div class="page">${header('ESPACE', 'Réglages', 'Configurez votre agence et vos préférences.', actionButton('Enregistrer', 'save'))}<section class="panel card settings-panel"><div class="form-grid"><label>Nom de l’agence<input data-setting="agencyName" value="CavaPasMarcher"></label><label>Email de contact<input data-setting="email" type="email" placeholder="vous@agence.fr"></label><label>Pays principal<select data-setting="country"><option>France — EUR</option><option>Belgique — EUR</option><option>Maroc — MAD</option></select></label><label>Langue de l’interface<select data-setting="language"><option>Français</option><option>English</option></select></label><label class="wide">Signature commerciale<textarea data-setting="signature" rows="4" placeholder="Votre promesse commerciale"></textarea></label></div></section><section class="panel card backup-panel"><div><span class="eyebrow">DONNÉES LOCALES</span><h2>Sauvegarde gratuite</h2><p>Exportez vos projets et réglages avant de changer de navigateur.</p></div><div><button class="button secondary" data-cpm-backup>Exporter</button><label class="button secondary file-button">Importer<input id="cpm-backup-file" type="file" accept="application/json" hidden></label></div></section></div>`;
  const render = () => {
    if (state.page === 'tests') return window.CPMTestCenter?.render?.();
    if (state.page === 'sites') return window.CPMSavedProjects?.render?.();
    if (state.page === 'prospects') app.innerHTML = prospectsPage();
    else if (state.page === 'settings') app.innerHTML = settingsPage();
    else if (state.page === 'quotes') app.innerHTML = `<div class="page">${header('VENTES', 'Devis & offres', 'Préparez des offres professionnelles.', actionButton('+ Créer un devis', 'new-quote'))}<section class="empty-feature card"><span class="feature-icon">▱</span><h2>Vos devis seront centralisés ici.</h2><p>Le générateur de devis arrive dans la prochaine étape. Vos projets peuvent déjà être exportés en brief JSON.</p></section></div>`;
    else if (state.page === 'library') app.innerHTML = `<div class="page">${header('BIBLIOTHÈQUE', 'Univers visuels', 'Des directions artistiques prêtes à adapter.', actionButton('+ Créer un univers', 'new-universe'))}<section class="style-grid"><article class="style-tile dark"><span>01</span><h2>Signature</h2><p>Contraste, caractère, présence.</p></article><article class="style-tile green"><span>02</span><h2>Local premium</h2><p>Clair, rassurant, efficace.</p></article><article class="style-tile sand"><span>03</span><h2>Éditorial</h2><p>Rythme et élégance.</p></article></section></div>`;
    else app.innerHTML = overview();
    syncNav(); bindContent();
  };
  const syncNav = () => document.querySelectorAll('.nav-item').forEach((node) => node.classList.toggle('active', node.dataset.page === state.page));
  const navigate = (page) => { state.page = page; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const bindContent = () => {
    app.querySelectorAll('[data-page]').forEach((node) => node.addEventListener('click', (event) => { event.preventDefault(); navigate(node.dataset.page); }));
    app.querySelectorAll('[data-action]').forEach((node) => node.addEventListener('click', (event) => { event.preventDefault(); const action = node.dataset.action; if (action === 'new-site') openGenerator(); else if (action === 'new-prospect') toast('Ajout de prospect bientôt disponible.'); else if (action === 'save') toast('Réglages enregistrés localement.'); else toast('Cette fonctionnalité est en préparation.'); }));
  };
  document.querySelectorAll('.nav-item, .brand').forEach((node) => node.addEventListener('click', (event) => { event.preventDefault(); navigate(node.dataset.page || 'overview'); }));
  window.CPMApp = { render, toast, state, navigate, openGenerator };
  render();
})();
