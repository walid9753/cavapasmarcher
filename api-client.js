/* CavaPasMarcher — frontend/API bridge.
   Keeps the static prototype usable while persisting generated briefs when the Node API is running.
*/
(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const $ = (id) => document.getElementById(id);
  const toast = (message) => {
    const el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2800);
  };
  const value = (id) => $(id)?.value?.trim() || '';
  async function saveCurrentProject() {
    const name = value('gen-name');
    const sector = value('gen-sector');
    if (!name || !sector) return;
    const project = {
      name,
      sector,
      country: value('gen-country') || 'FR',
      city: value('gen-city'),
      plan: value('gen-plan') || 'pro',
      language: value('gen-language') || 'fr',
      languages: [...document.querySelectorAll('#language-checks input:checked')].map((input) => input.value),
      description: value('gen-description')
    };
    try {
      const response = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const saved = await response.json();
      localStorage.setItem('cpm-last-project', JSON.stringify(saved));
      toast('Site généré et projet enregistré.');
    } catch (error) {
      // Opening index.html directly has no API server; generation still works locally.
      localStorage.setItem('cpm-last-project', JSON.stringify({ ...project, localOnly: true }));
      toast('Site généré — mode local, API non connectée.');
    }
  }
  document.addEventListener('click', (event) => {
    if (event.target.closest('#generate-site')) window.setTimeout(saveCurrentProject, 120);
  });
  window.CPMProjects = {
    async all() {
      const response = await fetch(`${API}/projects`);
      if (!response.ok) throw new Error(`API ${response.status}`);
      return (await response.json()).projects || [];
    },
    async remove(id) {
      const response = await fetch(`${API}/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`API ${response.status}`);
    }
  };
})();
