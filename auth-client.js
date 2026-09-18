/* CavaPasMarcher — browser authentication panel for the local API. */
(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const tokenKey = 'cpm-session-token';
  const userKey = 'cpm-session-user';
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); window.setTimeout(() => el.classList.remove('show'), 2800); };
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
  const getToken = () => localStorage.getItem(tokenKey) || window.CPM_API_TOKEN || '';
  const setSession = (session) => { localStorage.setItem(tokenKey, session.token); localStorage.setItem(userKey, JSON.stringify(session.user)); window.CPM_API_TOKEN = session.token; window.dispatchEvent(new CustomEvent('cpm:auth-changed', { detail: session.user })); };
  const clearSession = () => { localStorage.removeItem(tokenKey); localStorage.removeItem(userKey); window.CPM_API_TOKEN = ''; window.dispatchEvent(new CustomEvent('cpm:auth-changed')); };
  async function request(path, options = {}) { const response = await fetch(`${API}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}), ...(options.headers || {}) } }); const data = response.status === 204 ? null : await response.json().catch(() => ({})); if (!response.ok) throw new Error(data?.error || `API ${response.status}`); return data; }
  function render() {
    if (document.getElementById('cpm-auth')) return;
    const user = JSON.parse(localStorage.getItem(userKey) || 'null');
    const root = document.createElement('section'); root.id = 'cpm-auth'; root.className = 'cpm-auth';
    root.innerHTML = user
      ? `<div class="cpm-auth-user"><span>Connecté : <strong>${escapeHtml(user.name || user.email)}</strong></span><button type="button" class="secondary-btn" data-cpm-logout>Se déconnecter</button></div>`
      : `<form class="cpm-auth-form" data-cpm-auth-form><strong>Compte agence</strong><input name="name" placeholder="Nom (inscription)" autocomplete="name"><input name="email" type="email" placeholder="Email" required autocomplete="email"><input name="password" type="password" placeholder="Mot de passe (10 caractères minimum)" required minlength="10" autocomplete="current-password"><div><button type="submit" class="primary-btn" data-cpm-mode="login">Se connecter</button><button type="button" class="secondary-btn" data-cpm-mode="register">Créer un compte</button></div></form>`;
    document.body.appendChild(root);
  }
  document.addEventListener('submit', async (event) => { if (!event.target.matches('[data-cpm-auth-form]')) return; event.preventDefault(); const form = new FormData(event.target); const mode = event.submitter?.dataset.cpmMode || 'login'; try { const result = await request(`/auth/${mode === 'register' ? 'register' : 'login'}`, { method:'POST', body:JSON.stringify({ name:form.get('name'), email:form.get('email'), password:form.get('password') }) }); if (mode === 'register') { toast('Compte créé. Connectez-vous.'); event.target.reset(); } else { setSession(result); toast('Connexion réussie.'); render(); } } catch (error) { toast(error.message); } });
  document.addEventListener('click', async (event) => { if (!event.target.closest('[data-cpm-logout]')) return; try { await request('/auth/logout', { method:'POST' }); } catch {} clearSession(); document.getElementById('cpm-auth')?.remove(); render(); toast('Session terminée.'); });
  window.CPMAuth = { token:getToken, user:() => JSON.parse(localStorage.getItem(userKey) || 'null'), logout:clearSession };
  window.CPM_API_TOKEN = getToken();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
