(function (global) {
  const fxMap = {
    EUR: 1,
    USD: 0.94,
    CAD: 0.76,
    GBP: 1.02,
    CHF: 1.12,
    MAD: 0.34,
    DZD: 0.13,
    TND: 0.28,
    XOF: 0.22,
    XAF: 0.22,
    AED: 0.26,
    SAR: 0.25,
    TRY: 0.03,
    AUD: 0.82,
    JPY: 0.88,
    CNY: 0.34,
    INR: 0.21,
    KRW: 0.0008,
    BRL: 0.29,
    MXN: 0.25,
    ARS: 0.16,
    CLP: 0.22,
    COP: 0.18,
    SGD: 0.7,
    NZD: 0.86
  };

  const getPlan = (planId) => global.CPMPlans?.get ? global.CPMPlans.get(planId) : { setupBase: 2900, monthlyBase: 149 };

  const getCountry= (countryCode) => {
    const countryList = global.CPMCountries?.list ? global.CPMCountries.list() : [];
    return countryList.find((country) => country.code === String(countryCode || '').toUpperCase()) || countryList[0] || { code: 'FR', name: 'France', currency: 'EUR', languages: ['fr'] };
  };

  const getSectorBoost = (sector = '') => {
    const normalized = String(sector).toLowerCase();
    if (/(restaurant|bistro|pizza|traiteur|cafe|brasserie|café|hotel|hôtel|beauty|salon|automobile|garage|dent|clinique|cabinet|jurid|immobilier|realtor|law|finance)/.test(normalized)) {
      return 1.18;
    }
    return 1.08;
  };

  const getCountryPricing = (countryCode = 'FR', sector = '', planId = 'basic') => {
    const plan = getPlan(planId);
    const country = getCountry(countryCode);
    const currency = country.currency || 'EUR';
    const fxFactor = fxMap[currency] || 1;
    const sectorBoost = getSectorBoost(sector);
    const setup = Math.round((plan.setupBase || 2900) * fxFactor * sectorBoost);
    const monthly = Math.round((plan.monthlyBase || 149) * fxFactor * sectorBoost);

    return {
      countryCode: country.code,
      countryName: country.name,
      currency,
      setup,
      monthly,
      plan: plan.id || String(planId || 'basic').toLowerCase(),
      locale: 'fr-FR'
    };
  };

  global.CPMPricing = { getCountryPricing };
})(window);
