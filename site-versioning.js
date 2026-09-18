/* Local version history for generated sites. Keeps revisions available offline and makes restore explicit. */
(function () {
  const key = 'cpm-site-versions';
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); window.setTimeout(() => el.classList.remove('show'), 2600); };
  const read = () => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const write = (versions) => localStorage.setItem(key, JSON.stringify(versions.slice(0, 30)));
  const slug = (value) => String(value || 'site').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';
  const fingerprint = (generated) => `${generated?.project?.name || ''}|${generated?.html || ''}`;

  function saveVersion(event) {
    const generated = event?.detail || event || window.CPMGeneratedSite;
    if (!generated?.html) return;
    const versions = read();
    if (versions[0]?.fingerprint === fingerprint(generated)) return;
    const project = generated.project || {};
    versions.unshift({
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      name: project.name || 'Site sans nom',
      project,
      html: generated.html,
      fingerprint: fingerprint(generated)
    });
    write(versions);
    renderControls();
  }

  function renderControls() {
    const preview = document.getElementById('site-preview');
    if (!preview || document.getElementById('site-version-controls')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'site-version-controls';
    wrapper.className = 'site-version-controls';
    wrapper.innerHTML = '<label>Versions <select id="site-version-select"><option value="">Aucune version locale</option></select></label><button type="button" class="secondary-btn" data-restore-site>Restaurer</button><button type="button" class="secondary-btn" data-export-versions>Exporter l’historique</button>';
    preview.parentNode?.insertBefore(wrapper, preview);
    refreshSelect();
  }

  function refreshSelect() {
    const select = document.getElementById('site-version-select');
    if (!select) return;
    const versions = read();
    select.innerHTML = versions.length
      ? versions.map((version) => `<option value="${version.id}">${new Date(version.createdAt).toLocaleString('fr-FR')} — ${version.name}</option>`).join('')
      : '<option value="">Aucune version locale</option>';
  }

  function restore() {
    const id = document.getElementById('site-version-select')?.value;
    const version = read().find((item) => item.id === id);
    if (!version) return toast('Aucune version sélectionnée.');
    window.CPMGeneratedSite = { html: version.html, project: version.project };
    const preview = document.getElementById('site-preview');
    if (preview) preview.srcdoc = version.html;
    window.dispatchEvent(new CustomEvent('cpm:site-restored', { detail: window.CPMGeneratedSite }));
    toast('Version restaurée.');
  }

  function exportHistory() {
    const content = JSON.stringify(read(), null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug(window.CPMGeneratedSite?.project?.name)}-versions.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
    toast('Historique exporté.');
  }

  window.addEventListener('cpm:site-generated', saveVersion);
  document.addEventListener('cpm:site-generated', saveVersion);
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-restore-site]')) restore();
    if (event.target.closest('[data-export-versions]')) exportHistory();
  });
  const observer = new MutationObserver(() => { renderControls(); refreshSelect(); });
  observer.observe(document.body, { childList: true, subtree: true });
  window.CPMSiteVersions = { all: read, save: (generated) => saveVersion({ detail: generated }), restore, render: renderControls };
})();
