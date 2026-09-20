/* Generated-site quality gate. It validates the artifact before export or delivery. */
(function () {
  const required = ['<!doctype html', '<meta name="viewport"', '<title>', '<meta name="description"', '<style>', '#contact'];
  const toast = (message) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2800);
  };

  const validate = (html) => {
    const value = String(html || '');
    const source = value.toLowerCase();
    const parsed = new DOMParser().parseFromString(value, 'text/html');
    const errors = [];
    const warnings = [];

    for (const token of required) {
      const tokenOk = token === '#contact' ? Boolean(parsed.querySelector('#contact')) : source.includes(token.toLowerCase());
      if (!tokenOk) errors.push(`Missing required element: ${token}`);
    }

    const title = parsed.querySelector('title')?.textContent?.trim() || '';
    if (!title) errors.push('Title is empty');

    const metaDescription = parsed.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    if (!metaDescription) errors.push('Meta description is empty');
    else if (metaDescription.length > 155) warnings.push('Meta description is too long');

    const h1s = [...parsed.querySelectorAll('h1')].map((node) => node.textContent?.trim()).filter(Boolean);
    if (!h1s.length) errors.push('Missing H1 heading');
    else if (h1s.length > 1) warnings.push('Multiple H1 headings detected');

    const contact = parsed.querySelector('#contact');
    if (!contact || !contact.textContent?.trim()) errors.push('Contact section is empty');

    const images = [...parsed.querySelectorAll('img')];
    const missingAlt = images.filter((image) => !image.getAttribute('alt') || !image.getAttribute('alt').trim()).length;
    if (missingAlt) warnings.push(`${missingAlt} image(s) missing alt attribute`);

    const emptyLinks = [...parsed.querySelectorAll('a')].filter((link) => !link.textContent?.trim() && !link.getAttribute('aria-label')).length;
    if (emptyLinks) warnings.push(`${emptyLinks} empty link(s) detected`);

    const placeholderPattern = /lorem ipsum|your company|replace me|coming soon|todo|placeholder/i;
    if (placeholderPattern.test(value)) warnings.push('Placeholder content still present');

    const unsafe = /<script\s+src=|javascript:/i.test(value);
    if (unsafe) errors.push('External scripts or javascript: protocol detected');

    const report = {
      passed: errors.length === 0,
      errors,
      warnings,
      checks: required.map((token) => ({
        token,
        passed: token === '#contact' ? Boolean(parsed.querySelector('#contact')) : source.includes(token.toLowerCase())
      })),
      hasHeading: h1s.length > 0,
      hasContact: Boolean(contact),
      hasTitle: Boolean(title),
      hasDescription: Boolean(metaDescription),
      unsafe,
      generatedAt: new Date().toISOString()
    };
    return report;
  };

  const showResult = (report) => {
    const preview = document.getElementById('site-preview');
    if (!preview?.parentNode) return;

    let badge = document.getElementById('site-quality-result');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'site-quality-result';
      badge.className = 'site-quality-result';
      preview.parentNode.insertBefore(badge, preview);
    }

    badge.dataset.status = report.passed ? 'passed' : 'failed';
    const errorSummary = report.errors.length ? ` — ${report.errors.length} erreur(s)` : ' — validation OK';
    const warningSummary = report.warnings.length ? ` • ${report.warnings.length} avertissement(s)` : '';
    badge.textContent = report.passed ? `✓ Contrôle qualité réussi${errorSummary}${warningSummary}` : `⚠ Contrôle qualité incomplet${errorSummary}${warningSummary}`;
    badge.title = report.errors.length ? report.errors.join('\n') : (report.warnings.length ? report.warnings.join('\n') : 'Aucune anomalie détectée.');
  };

  window.addEventListener('cpm:site-generated', (event) => {
    const report = validate(event.detail?.html);
    window.CPMGeneratedSite = { ...window.CPMGeneratedSite, quality: report };
    showResult(report);
    if (!report.passed) toast('Le contrôle qualité a détecté un problème dans le site.');
  });

  window.CPMSiteQuality = { validate, showResult };
})();
