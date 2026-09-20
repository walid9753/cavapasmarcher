/* Project list and free local project management. */
(function () {
  if (window.CPMProjectGallery) {
    window.CPMProjectList = window.CPMProjectGallery;
    return;
  }

  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || window.CPM_API_TOKEN || localStorage.getItem('cpm-session-token') || '';
  const headers = () => ({ ...(token() ? { authorization: `Bearer ${token()}` } : {}) });

  const readStoredProjects = () => {
    try {
      const raw = localStorage.getItem('cpm-projects');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  function getLocalProject() {
    try {
      const last = JSON.parse(localStorage.getItem('cpm-last-project') || 'null');
      if (last) return last;
    } catch { /* noop */ }
    return readStoredProjects()[0] || null;
  }

  async function fetchProjects() {
    const fallback = getLocalProject() ? [getLocalProject()] : readStoredProjects();
    try {
      const response = await fetch(`${API}/projects`, { headers: headers() });
      if (!response.ok) return fallback;
      const data = await response.json().catch(() => ({ projects: [] }));
      const remote = Array.isArray(data.projects) ? data.projects : [];
      const merged = [...fallback, ...remote];
      const deduped = new Map();
      for (const project of merged) if (project?.id) deduped.set(String(project.id), project);
      return [...deduped.values()];
    } catch {
      return fallback;
    }
  }

  function renderCards(projects) {
    if (!projects.length) return '<div class="project-list-empty">Aucun projet enregistré pour le moment.</div>';
    return projects.map((project) => `
      <article class="saved-project card" data-project-id="${String(project.id || 'local')}">
        <div class="saved-project-cover"><span>${String(project.sector || 'Site')}</span></div>
        <div class="saved-project-body">
          <div class="saved-project-meta">${String(project.country || 'FR')} · ${String(project.plan || 'pro')}</div>
          <h3>${String(project.name || 'Projet sans titre')}</h3>
          <p>${String(project.description || 'Projet enregistré dans le studio local.')}</p>
          <div class="saved-project-footer">
            <strong>${String(project.price || project.pricing?.total || 0)} €</strong>
            <div class="saved-project-actions" data-project-id="${String(project.id || 'local')}">
              <button type="button" class="button secondary" data-project-open="${String(project.id || 'local')}">Ouvrir</button>
              <button type="button" class="button secondary" data-project-duplicate="${String(project.id || 'local')}">Dupliquer</button>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  async function refresh() {
    const root = document.getElementById('project-list-root');
    if (!root) return;
    const query = (document.getElementById('project-search')?.value || '').trim().toLowerCase();
    const projects = (await fetchProjects()).filter((project) => {
      if (!query) return true;
      const terms = [project.name, project.sector, project.country, project.plan].filter(Boolean).join(' ').toLowerCase();
      return terms.includes(query);
    });
    root.innerHTML = renderCards(projects);
  }

  function ensureNode() {
    const appElement = document.getElementById('app');
    if (!appElement || document.getElementById('project-list-root')) return;
    const panel = document.createElement('div');
    panel.id = 'project-list-root';
    panel.className = 'project-list-root';
    appElement.appendChild(panel);
  }

  document.addEventListener('click', async (event) => {
    const loadButton = event.target.closest('[data-project-load]');
    if (loadButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      await refresh();
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
  });

  ensureNode();
  refresh();
  window.CPMProjectList = { render: refresh, fetchProjects, readStoredProjects };
})();
