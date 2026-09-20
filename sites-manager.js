/* Saved projects workspace with authenticated API requests and offline fallback. */
(function () {
  if (window.CPMProjectGallery) {
    window.CPMSavedProjects = window.CPMProjectGallery;
    return;
  }

  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const app = () => document.getElementById('app');
  const token = () => window.CPMAuth?.token?.() || window.CPM_API_TOKEN || localStorage.getItem('cpm-session-token') || '';
  const headers = () => ({ ...(token() ? { authorization: `Bearer ${token()}` } : {}) });
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  const listLocalProjects = () => {
    const out = new Map();
    const keys = ['cpm-projects', 'cpm-last-project'];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (!item || typeof item !== 'object') continue;
          const projectId = String(item.id || `local-${Math.random().toString(16).slice(2)}`);
          out.set(projectId, { ...item, id: projectId, name: item.name || 'Projet sans titre' });
        }
      } catch {
        // Ignore malformed local data and keep the gallery resilient.
      }
    }
    return [...out.values()];
  };

  async function fetchProjects() {
    const local = listLocalProjects();
    try {
      const response = await fetch(`${API}/projects`, { headers: headers() });
      if (!response.ok) return local;
      const data = await response.json().catch(() => ({ projects: [] }));
      const remote = Array.isArray(data.projects) ? data.projects : [];
      const merged = [...local, ...remote].map((project) => ({
        ...project,
        id: project.id || `local-${Math.random().toString(16).slice(2)}`,
        name: project.name || 'Projet sans titre',
        pricing: project.pricing || {},
        sector: project.sector || 'Non renseigné',
        country: project.country || 'FR',
        plan: project.plan || 'pro'
      }));
      const unique = new Map();
      for (const project of merged) unique.set(String(project.id), project);
      return [...unique.values()];
    } catch {
      return local;
    }
  }

  function card(project) {
    const pricing = project.pricing || {};
    const currency = pricing.currency || 'EUR';
    const amount = Number(pricing.total || project.price || 0);
    return `
      <article class="saved-project card" data-project-id="${esc(project.id || 'local')}">
        <div class="saved-project-cover">
          <span>${esc(project.sector || 'Site')}</span>
        </div>
        <div class="saved-project-body">
          <div class="saved-project-meta">${esc(project.country || 'FR')} · ${esc(project.plan || 'pro')}</div>
          <h3>${esc(project.name || 'Projet sans titre')}</h3>
          <p>${esc(project.description || 'Projet enregistré dans le studio local.')}</p>
          <div class="saved-project-footer">
            <strong>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)}</strong>
            <div class="saved-project-actions" data-project-id="${esc(project.id || 'local')}">
              <button type="button" class="button secondary" data-project-open="${esc(project.id || 'local')}">Ouvrir</button>
              <button type="button" class="button secondary" data-project-duplicate="${esc(project.id || 'local')}">Dupliquer</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  async function renderSavedProjects() {
    const root = app();
    if (!root) return;
    const projects = await fetchProjects();
    const items = projects.length
      ? projects.map((project) => card(project)).join('')
      : '<div class="project-list-empty">Aucun projet enregistré pour le moment.</div>';

    root.innerHTML = `
      <div class="page saved-projects-page">
        <div class="headline">
          <div>
            <div class="eyebrow">PRODUCTION</div>
            <h1 class="page-title">Sites enregistrés</h1>
            <p class="page-subtitle">Suivez vos projets, ouvrez-les, dupliquez-les et exportez leurs briefs.</p>
          </div>
          <button type="button" class="button primary" data-action="new-site">+ Nouveau site</button>
        </div>
        <div class="project-list-grid">${items}</div>
      </div>
    `;
  }

  function bindProjects() {
    const createButton = document.querySelector('[data-action="new-site"]');
    if (createButton) createButton.addEventListener('click', () => document.querySelector('[data-page="overview"]')?.click());
  }

  function handleProjectActions(event) {
    if (event.target.closest('[data-page="sites"]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderSavedProjects();
      return;
    }

    const openButton = event.target.closest('[data-project-open]');
    if (openButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.CPMOpenProject?.(openButton.dataset.projectOpen);
      return;
    }

    const duplicateButton = event.target.closest('[data-project-duplicate]');
    if (duplicateButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.CPMProjectActions?.duplicate?.(duplicateButton.dataset.projectDuplicate);
    }
  }

  document.addEventListener('click', handleProjectActions);
  window.addEventListener('cpm:auth-changed', renderSavedProjects);
  window.addEventListener('cpm:projects-changed', renderSavedProjects);

  bindProjects();
  window.CPMProjectGallery = { render: renderSavedProjects, fetchProjects, listLocalProjects };
  window.CPMSavedProjects = window.CPMProjectGallery;
})();
