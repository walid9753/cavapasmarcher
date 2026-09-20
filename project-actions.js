/* Project lifecycle actions with the active authenticated session. */
(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || window.CPM_API_TOKEN || localStorage.getItem('cpm-session-token') || '';
  const headers = (json = false) => ({
    ...(json ? { 'content-type': 'application/json' } : {}),
    ...(token() ? { authorization: `Bearer ${token()}` } : {})
  });
  const toast = (message) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2600);
  };
  async function load(id) {
    if (!id || id === 'local') {
      try { return JSON.parse(localStorage.getItem('cpm-last-project') || 'null'); } catch { return null; }
    }
    try {
      const response = await fetch(`${API}/projects/${encodeURIComponent(id)}`, { headers: headers() });
      if (!response.ok) throw new Error();
      return response.json();
    } catch { return null; }
  }
  async function duplicate(id) {
    const project = await load(id);
    if (!project) return toast('Projet introuvable.');
    const { id: ignoredId, ownerId: ignoredOwner, versionCount: ignoredCount, localOnly: ignoredLocal, ...copy } = project;
    copy.name = `${project.name || 'Projet'} — copie`;
    try {
      const response = await fetch(`${API}/projects`, { method: 'POST', headers: headers(true), body: JSON.stringify(copy) });
      if (!response.ok) throw new Error();
      toast('Projet dupliqué.');
      window.dispatchEvent(new Event('cpm:projects-changed'));
      window.CPMSavedProjects?.render();
    } catch {
      localStorage.setItem('cpm-last-project', JSON.stringify({ ...copy, localOnly: true }));
      toast('Copie enregistrée localement.');
      window.CPMSavedProjects?.render();
    }
  }
  function exportBrief(id) {
    load(id).then((project) => {
      if (!project) return toast('Projet introuvable.');
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${String(project.name || 'projet').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'projet'}-brief.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }
  function addActions() {
    document.querySelectorAll('.saved-project-actions').forEach((container) => {
      if (container.querySelector('[data-project-duplicate]')) return;
      const id = container.closest('[data-project-id]')?.dataset.projectId || container.dataset.projectId;
      if (!id) return;
      container.insertAdjacentHTML('beforeend', `<button type="button" class="button secondary" data-project-duplicate="${id}">Dupliquer</button><button type="button" class="button secondary" data-project-export="${id}">Exporter</button>`);
    });
  }
  document.addEventListener('click', (event) => {
    const duplicateButton = event.target.closest('[data-project-duplicate]');
    if (duplicateButton) { event.preventDefault(); duplicate(duplicateButton.dataset.projectDuplicate); return; }
    const exportButton = event.target.closest('[data-project-export]');
    if (exportButton) { event.preventDefault(); exportBrief(exportButton.dataset.projectExport); }
  });
  if (document.body) new MutationObserver(addActions).observe(document.body, { childList: true, subtree: true });
  window.CPMProjectActions = { duplicate, exportBrief };
})();
