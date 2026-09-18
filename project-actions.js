/* Project lifecycle actions: duplicate and export a saved brief. */
(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const local = () => { try { return JSON.parse(localStorage.getItem('cpm-last-project') || 'null'); } catch { return null; } };
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  async function load(id) {
    try { const r = await fetch(`${API}/projects/${encodeURIComponent(id)}`); if (!r.ok) throw new Error(); return await r.json(); }
    catch { const p = local(); return p && (!id || p.id === id) ? p : null; }
  }
  async function duplicate(id) {
    const project = await load(id); if (!project) return toast('Projet introuvable.');
    const copy = { ...project, id: undefined, name: `${project.name} — copie`, localOnly: undefined };
    try {
      const r = await fetch(`${API}/projects`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(copy) });
      if (!r.ok) throw new Error();
      toast('Projet dupliqué.'); window.CPMSavedProjects?.render();
    } catch { localStorage.setItem('cpm-last-project', JSON.stringify({ ...copy, localOnly:true })); toast('Copie enregistrée localement.'); window.CPMSavedProjects?.render(); }
  }
  async function exportBrief(id) {
    const project = await load(id); if (!project) return toast('Projet introuvable.');
    const blob = new Blob([JSON.stringify(project, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `${String(project.name || 'projet').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brief.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500); toast('Brief exporté.');
  }
  function addActions() {
    document.querySelectorAll('.saved-project-actions').forEach((container) => {
      if (container.querySelector('[data-project-duplicate]')) return;
      const open = container.querySelector('[data-project-open]'); const id = open?.dataset.projectOpen || '';
      container.insertAdjacentHTML('beforeend', `<button class="secondary-btn" data-project-duplicate="${id}">Dupliquer</button><button class="secondary-btn" data-project-export="${id}">JSON</button>`);
    });
  }
  document.addEventListener('click', (event) => {
    const duplicateButton = event.target.closest('[data-project-duplicate]');
    if (duplicateButton) { event.preventDefault(); duplicate(duplicateButton.dataset.projectDuplicate); }
    const exportButton = event.target.closest('[data-project-export]');
    if (exportButton) { event.preventDefault(); exportBrief(exportButton.dataset.projectExport); }
  });
  const observer = new MutationObserver(addActions);
  observer.observe(document.body, { childList:true, subtree:true });
})();
