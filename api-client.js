/* CavaPasMarcher — frontend/API bridge. */
(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const $ = (id) => document.getElementById(id);
  const toast = (message) => { const el = $('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); window.setTimeout(() => el.classList.remove('show'), 2800); };
  const value = (id) => $(id)?.value?.trim() || '';
  const checkedLanguages = () => [...document.querySelectorAll('#language-checks input:checked')].map((input) => input.value);
  const getStored = () => { try { return JSON.parse(localStorage.getItem('cpm-last-project') || 'null'); } catch { return null; } };
  const brief = () => ({ name: value('gen-name'), sector: value('gen-sector'), country: value('gen-country') || 'FR', city: value('gen-city'), plan: value('gen-plan') || 'pro', language: value('gen-language') || 'fr', languages: checkedLanguages(), description: value('gen-description') });
  async function request(path, options) { const response = await fetch(`${API}${path}`, options); if (!response.ok) throw new Error(`API ${response.status}`); return response; }
  async function saveBrief(project, existing) {
    const method = existing?.id ? 'PUT' : 'POST';
    const path = existing?.id ? `/projects/${encodeURIComponent(existing.id)}` : '/projects';
    return (await request(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(project) })).json();
  }
  function findGeneratedHtml() {
    const frame = $('site-preview');
    if (!frame) return '';
    return frame.srcdoc || frame.contentDocument?.documentElement?.outerHTML || '';
  }
  async function saveArtifact(project) {
    const html = findGeneratedHtml();
    if (!project?.id || !html) return;
    await request(`/projects/${encodeURIComponent(project.id)}/site`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ html }) });
  }
  async function saveCurrentProject() {
    const project = brief(); if (!project.name || !project.sector) return;
    const previous = getStored();
    try {
      const saved = await saveBrief(project, previous);
      localStorage.setItem('cpm-last-project', JSON.stringify(saved));
      try { await saveArtifact(saved); toast('Site et brief enregistrés dans le projet.'); }
      catch { toast('Brief enregistré ; export du site à réessayer.'); }
    } catch {
      localStorage.setItem('cpm-last-project', JSON.stringify({ ...project, localOnly: true }));
      toast('Site généré — mode local, API non connectée.');
    }
  }
  document.addEventListener('click', (event) => { if (event.target.closest('#generate-site')) window.setTimeout(saveCurrentProject, 180); });
  window.CPMProjects = {
    async all() { return (await request('/projects')).json().then((data) => data.projects || []); },
    async get(id) { return (await request(`/projects/${encodeURIComponent(id)}`)).json(); },
    async remove(id) { await request(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
    async update(id, project) { return (await request(`/projects/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(project) })).json(); },
    async saveSite(id, html) { return (await request(`/projects/${encodeURIComponent(id)}/site`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ html }) })).json(); }
  };
})();
