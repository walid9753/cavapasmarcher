/* Open a saved server project in the generator, including API-backed projects. */
(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const esc = (value) => String(value ?? '');
  async function getProject(id) {
    if (!id) return null;
    try {
      const response = await fetch(`${API}/projects/${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error('project unavailable');
      return await response.json();
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem('cpm-last-project') || 'null');
        return local && (!local.id || local.id === id) ? local : null;
      } catch { return null; }
    }
  }
  function setField(id, value) {
    const field = document.getElementById(id);
    if (field && value !== undefined && value !== null) field.value = value;
  }
  function selectColor() {
    const selected = document.querySelector('.color-choice.selected');
    if (selected) return;
    document.querySelector('.color-choice')?.classList.add('selected');
  }
  async function openProject(id) {
    const project = await getProject(id);
    if (!project) { alert('Impossible de charger ce projet.'); return; }
    localStorage.setItem('cpm-open-project', JSON.stringify(project));
    document.querySelector('[data-action="new-site"]')?.click();
    window.setTimeout(() => {
      setField('gen-name', project.name);
      setField('gen-sector', project.sector);
      setField('gen-country', project.country || 'FR');
      setField('gen-city', project.city || '');
      setField('gen-plan', project.plan || 'pro');
      setField('gen-language', project.language || 'fr');
      setField('gen-description', project.description || '');
      selectColor();
      document.getElementById('gen-country')?.dispatchEvent(new Event('change'));
      document.getElementById('gen-plan')?.dispatchEvent(new Event('input'));
      window.setTimeout(() => {
        setField('gen-language', project.language || 'fr');
        (project.languages || []).forEach((language) => {
          const input = document.querySelector(`#language-checks input[value="${CSS.escape(language)}"]`);
          if (input) input.checked = true;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 80);
    }, 80);
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-project-open]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openProject(button.dataset.projectOpen);
  }, true);
  window.CPMOpenProject = openProject;
})();
