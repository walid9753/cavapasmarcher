/* CavaPasMarcher — API bridge with dynamic bearer authentication. */
(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const $ = (id) => document.getElementById(id);
  const value = (id) => $(id)?.value?.trim() || '';
  const getToken = () => window.CPMAuth?.token?.() || window.CPM_API_TOKEN || localStorage.getItem('cpm-session-token') || '';
  const toast = (message) => {
    const el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2800);
  };

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

  const writeStoredProjects = (projects) => {
    if (!Array.isArray(projects)) return;
    localStorage.setItem('cpm-projects', JSON.stringify(projects));
  };

  const saveLocalProject = (project) => {
    const existing = readStoredProjects();
    const next = [...existing.filter((item) => String(item.id || 'local') !== String(project.id || 'local')), project];
    writeStoredProjects(next);
    localStorage.setItem('cpm-last-project', JSON.stringify(project));
  };

  const headers = (json = false) => ({
    ...(json ? { 'content-type': 'application/json' } : {}),
    ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {})
  });
  const request = async (path, options = {}) => {
    let response;
    try {
      response = await fetch(`${API}${path}`, {
        ...options,
        headers: { ...headers(Boolean(options.body)), ...(options.headers || {}) }
      });
    } catch (error) {
      throw new Error('API indisponible. Vérifiez que le serveur est démarré.', { cause: error });
    }
    if (!response.ok) {
      let message = `Erreur API (${response.status})`;
      try { message = (await response.json()).error || message; } catch { /* réponse non JSON */ }
      throw new Error(message);
    }
    return response;
  };
  const local = () => {
    try { return JSON.parse(localStorage.getItem('cpm-last-project') || 'null'); } catch { return null; }
  };
  const brief = () => ({
    name: value('gen-name'),
    sector: value('gen-sector'),
    country: value('gen-country') || 'FR',
    city: value('gen-city'),
    plan: value('gen-plan') || 'pro',
    language: value('gen-language') || value('gen-lang') || 'fr',
    description: value('gen-description'),
    additionalLanguages: [...document.querySelectorAll('[name="gen-languages"]:checked')].map((field) => field.value)
  });
  async function save() {
    const data = brief();
    if (!data.name || !data.sector) return;
    const old = local();
    try {
      const path = old?.id ? `/projects/${encodeURIComponent(old.id)}` : '/projects';
      const response = await request(path, { method: old?.id ? 'PUT' : 'POST', body: JSON.stringify(data) });
      const project = await response.json();
      saveLocalProject(project);
      window.dispatchEvent(new CustomEvent('cpm:projects-changed', { detail: project }));
    } catch (error) {
      const fallback = { ...data, localOnly: true, id: old?.id || `local-${Date.now()}` };
      saveLocalProject(fallback);
      toast(`${error.message} Projet conservé localement.`);
    }
  }
  document.addEventListener('click', (event) => {
    if (event.target.closest('#generate-site')) window.setTimeout(save, 250);
  });
  window.CPMProjects = {
    all: async () => (await request('/projects')).json().then((data) => data.projects || []),
    get: async (id) => (await request(`/projects/${encodeURIComponent(id)}`)).json(),
    remove: async (id) => request(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    store: { read: readStoredProjects, write: writeStoredProjects, save: saveLocalProject }
  };
})();
