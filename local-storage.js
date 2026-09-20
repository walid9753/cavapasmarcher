(function () {
  const STORAGE_VERSION = 2;
  const STORAGE_KEYS = {
    projects: 'cpm-projects',
    lastProject: 'cpm-last-project',
    siteVersions: 'cpm-site-versions',
    generatedSites: 'cpm-generated-sites',
    settings: 'cpm-settings',
    prospects: 'cpm-prospects',
    quotes: 'cpm-quotes',
    templates: 'cpm-templates',
    preferences: 'cpm-preferences',
    sessionUser: 'cpm-session-user'
  };

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const ensureKey = (key, fallback) => {
    const value = readJson(key, fallback);
    writeJson(key, value);
    return value;
  };

  const ensureAll = () => {
    ensureKey(STORAGE_KEYS.projects, []);
    ensureKey(STORAGE_KEYS.lastProject, null);
    ensureKey(STORAGE_KEYS.siteVersions, []);
    ensureKey(STORAGE_KEYS.generatedSites, []);
    ensureKey(STORAGE_KEYS.settings, {});
    ensureKey(STORAGE_KEYS.prospects, []);
    ensureKey(STORAGE_KEYS.quotes, []);
    ensureKey(STORAGE_KEYS.templates, []);
    ensureKey(STORAGE_KEYS.preferences, {});
    ensureKey(STORAGE_KEYS.sessionUser, null);
    localStorage.setItem('cpm-local-storage-version', String(STORAGE_VERSION));
  };

  const getProjects = () => {
    ensureAll();
    return readJson(STORAGE_KEYS.projects, []);
  };

  const saveProjects = (projects) => {
    if (!Array.isArray(projects)) return false;
    writeJson(STORAGE_KEYS.projects, projects);
    return true;
  };

  const upsertProject = (project) => {
    if (!project || typeof project !== 'object') return null;
    const projects = getProjects();
    const id = String(project.id || `local-${Date.now()}`);
    const next = [...projects.filter((item) => String(item.id || 'local') !== id), { ...project, id }];
    saveProjects(next);
    writeJson(STORAGE_KEYS.lastProject, { ...project, id });
    return { ...project, id };
  };

  const snapshot = () => {
    ensureAll();
    return {
      projects: readJson(STORAGE_KEYS.projects, []),
      lastProject: readJson(STORAGE_KEYS.lastProject, null),
      siteVersions: readJson(STORAGE_KEYS.siteVersions, []),
      generatedSites: readJson(STORAGE_KEYS.generatedSites, []),
      settings: readJson(STORAGE_KEYS.settings, {}),
      prospects: readJson(STORAGE_KEYS.prospects, []),
      quotes: readJson(STORAGE_KEYS.quotes, []),
      templates: readJson(STORAGE_KEYS.templates, []),
      preferences: readJson(STORAGE_KEYS.preferences, {}),
      version: Number(localStorage.getItem('cpm-local-storage-version') || STORAGE_VERSION)
    };
  };

  const restoreSnapshot = (data) => {
    if (!data || typeof data !== 'object') return false;
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const value = data[key];
      if (value === undefined) return;
      if (value === null) localStorage.removeItem(storageKey);
      else writeJson(storageKey, value);
    });
    localStorage.setItem('cpm-local-storage-version', String(STORAGE_VERSION));
    return true;
  };

  ensureAll();
  window.CPMStorage = {
    STORAGE_VERSION,
    STORAGE_KEYS,
    readJson,
    writeJson,
    getProjects,
    saveProjects,
    upsertProject,
    snapshot,
    restoreSnapshot,
    ensureAll
  };
})();
