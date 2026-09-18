/* CavaPasMarcher — generator integration layer. */
(function () {
  const original = window.CPMSiteBuilder?.buildSiteHtml;
  if (!original) return;
  const $ = (id) => document.getElementById(id);
  const read = () => ({
    name: $('gen-name')?.value?.trim() || '',
    sector: $('gen-sector')?.value?.trim() || '',
    country: $('gen-country')?.value || 'FR',
    city: $('gen-city')?.value?.trim() || '',
    plan: $('gen-plan')?.value || 'pro',
    language: $('gen-language')?.value || 'fr',
    description: $('gen-description')?.value?.trim() || '',
    color: document.querySelector('.color-choice.selected')?.dataset?.color || 'auto'
  });
  const formatPrice = (value, currency) => { try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value); } catch { return `${value} ${currency}`; } };
  const updatePrice = () => {
    const data = read();
    const pricing = window.CPMPricing?.getCountryPricing(data.country, data.sector, data.plan);
    const target = $('price-card');
    if (!pricing || !target) return;
    target.innerHTML = `<div><small>Prix conseillé local</small><strong>${formatPrice(pricing.setup, pricing.currency)}</strong><span>${formatPrice(pricing.monthly, pricing.currency)} / mois</span></div>`;
  };
  const generatePremium = () => {
    const data = read();
    if (!data.name || !data.sector) { window.alert('Ajoutez le nom et le secteur de l’entreprise.'); return; }
    const pricing = window.CPMPricing?.getCountryPricing(data.country, data.sector, data.plan) || {};
    const html = original({ ...data, currency: pricing.currency, setup: pricing.setup, monthly: pricing.monthly });
    const preview = $('site-preview');
    if (preview) preview.srcdoc = html;
    window.CPMGeneratedSite = { html, project: { ...data, pricing } };
    window.dispatchEvent(new CustomEvent('cpm:site-generated', { detail: window.CPMGeneratedSite }));
  };
  document.addEventListener('input', (event) => { if (['gen-sector', 'gen-plan', 'gen-country'].includes(event.target.id)) updatePrice(); });
  document.addEventListener('change', (event) => { if (['gen-sector', 'gen-plan', 'gen-country'].includes(event.target.id)) updatePrice(); });
  document.addEventListener('click', (event) => { if (event.target.closest('#generate-site')) { event.preventDefault(); event.stopImmediatePropagation(); generatePremium(); } });
  window.CPMPremiumGenerator = { read, generate: generatePremium, updatePrice };
})();
