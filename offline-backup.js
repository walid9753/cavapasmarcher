/* Free local backup/restore for local studio data. Authentication tokens are never exported. */
(function () {
  const STORAGE_KEY = 'cpm-local-backup-data';
  const keys = [
    'cpm-projects', 'cpm-last-project', 'cpm-site-versions', 'cpm-generated-sites',
    'cpm-settings', 'cpm-prospects', 'cpm-quotes', 'cpm-templates', 'cpm-preferences'
  ];
  const toast = (message) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2600);
  };
  const download = (filename, value) => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  function collect() {
    return {
      format: 'cpm-local-backup', version: 2, exportedAt: new Date().toISOString(),
      data: Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)]))
    };
  }
  function restore(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);
        if (backup.format !== 'cpm-local-backup' || !backup.data || typeof backup.data !== 'object') throw new Error('Format invalide');
        for (const key of keys) {
          if (typeof backup.data[key] === 'string') localStorage.setItem(key, backup.data[key]);
        }
        localStorage.removeItem('cpm-session-token');
        localStorage.removeItem('cpm-session-user');
        toast('Sauvegarde restaurée. Rechargez la page pour appliquer les données.');
      } catch { toast('Impossible de restaurer cette sauvegarde.'); }
    };
    reader.readAsText(file);
  }
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-cpm-backup]')) {
      download(`cavapasmarcher-backup-${new Date().toISOString().slice(0, 10)}.json`, collect());
      toast('Sauvegarde exportée sans données de session.');
    }
  });
  document.addEventListener('change', (event) => {
    if (event.target.id === 'cpm-backup-file' && event.target.files[0]) restore(event.target.files[0]);
  });
  window.CPMLocalBackup = { collect, restore };
})();
