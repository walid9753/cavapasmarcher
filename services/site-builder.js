(function (global) {
  const normalize = (value) => String(value || '').trim();
  const fallbackText = (project, key) => {
    const name = project.name || 'Votre entreprise';
    const city = project.city || 'Votre ville';
    const sector = normalize(project.sector) || 'Votre activité';
    const map = {
      hero: `${name} • ${sector} à ${city}`,
      intro: `Une présence digitale pensée pour séduire, rassurer et convertir.`
    };
    return map[key] || `${name} • ${sector}`;
  };

  const getPlan = (planId = 'pro') => global.CPMPlans?.get ? global.CPMPlans.get(planId) : { id: 'pro', pages: 8, features: [] };

  const getNiche = (sector) => global.CPMNiches?.resolve ? global.CPMNiches.resolve(sector) : { label: 'Professionnel', palette: { primary: '#1F6FEB', secondary: '#0b1526', accent: '#EAF5FF', surface: '#F8FBFF' }, message: 'Une présence premium.', cta: 'Prendre contact' };

  const localizedLabels = (language = 'fr') => {
    const map = {
      fr: { about: 'À propos', expertise: 'Notre expertise', method: 'Notre méthode', trust: 'Ils nous font confiance', faq: 'FAQ', contact: 'Contact', cta: 'Prendre rendez-vous' },
      en: { about: 'About', expertise: 'Our expertise', method: 'Our method', trust: 'Testimonials', faq: 'FAQ', contact: 'Contact', cta: 'Book a call' },
      ar: { about: 'معلومات', expertise: 'خبرتنا', method: 'منهجنا', trust: 'آراؤهم', faq: 'الأسئلة', contact: 'تواصل', cta: 'احجز موعدًا' },
      es: { about: 'Sobre nosotros', expertise: 'Nuestra experiencia', method: 'Nuestro método', trust: 'Opiniones', faq: 'Preguntas', contact: 'Contacto', cta: 'Reservar una cita' }
    };
    return map[String(language).toLowerCase()] || map.fr;
  };

  const buildSiteHtml = (project = {}) => {
    const niche = getNiche(project.sector);
    const plan = getPlan(project.plan);
    const labels = localizedLabels(project.language);
    const primary = niche.palette.primary;
    const secondary = niche.palette.secondary;
    const accent = niche.palette.accent;
    const surface = niche.palette.surface;
    const name = normalize(project.name) || 'Votre entreprise';
    const city = normalize(project.city) || 'Votre ville';
    const sector = normalize(project.sector) || 'Votre activité';
    const description = normalize(project.description) || 'Une présence digitale premium pensée pour rassurer, vendre et convertir.';
    const html = `<!doctype html>
<html lang="${project.language || 'fr'}" dir="${project.language === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | ${sector}</title>
  <meta name="description" content="${description}" />
  <style>
    :root {
      --primary: ${primary};
      --secondary: ${secondary};
      --accent: ${accent};
      --surface: ${surface};
      --card: rgba(255,255,255,0.96);
      --muted: #5a6470;
      --line: rgba(17,24,39,0.08);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0; font-family: Inter, Arial, sans-serif; background: var(--surface); color: var(--secondary);
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 20px; }
    header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff; padding: 22px 0 70px;
    }
    .nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .brand { font-size: 1.2rem; font-weight: 800; letter-spacing: 0.04em; }
    .nav-links { display: flex; gap: 18px; font-size: 0.95rem; opacity: 0.92; }
    .hero { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px; padding-top: 42px; }
    .eyebrow {
      display: inline-block; padding: 8px 14px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.14);
      border-radius: 999px; letter-spacing: 0.08em; font-size: 0.72rem; text-transform: uppercase; font-weight: 700;
    }
    h1 { font-size: clamp(2.5rem, 5vw, 4.25rem); line-height: 1.05; margin: 16px 0 12px; }
    .lead { font-size: 1.08rem; line-height: 1.75; max-width: 640px; color: rgba(255,255,255,0.9); }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 24px; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; padding: 14px 20px; border-radius: 12px; font-weight: 700;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .btn.primary { background: #fff; color: var(--secondary); }
    .btn.secondary { background: transparent; color: #fff; }
    .hero-card {
      background: var(--card); border-radius: 22px; padding: 24px; color: var(--secondary);
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
    }
    .stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
    .stat { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 14px 12px; text-align: center; }
    .stat strong { display: block; font-size: 1.35rem; }
    section { padding: 80px 0; }
    .section-head { max-width: 700px; margin-bottom: 26px; }
    .section-head h2 { font-size: clamp(1.9rem, 3vw, 2.7rem); margin: 0 0 12px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
    .card {
      background: rgba(255,255,255,0.85); border: 1px solid var(--line); border-radius: 20px; padding: 24px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    }
    .card h3 { margin-top: 0; font-size: 1.2rem; }
    .tag { display: inline-block; background: var(--accent); color: var(--secondary); border-radius: 999px; padding: 8px 12px; font-size: 0.8rem; font-weight: 700; }
    .process { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
    .step { background: white; border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
    .step-num { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); font-weight: 800; }
    .testimonials { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
    blockquote { margin: 0; background: white; border: 1px solid var(--line); border-radius: 18px; padding: 24px; }
    .pricing {
      background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 18px;
    }
    .cta-panel {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff; border-radius: 22px; padding: 32px; display: flex; justify-content: space-between; align-items: center; gap: 18px;
    }
    footer { padding: 28px 0 60px; color: var(--muted); }
    @media (max-width: 900px) {
      .hero, .grid-3, .process, .testimonials { grid-template-columns: 1fr; }
      .nav { flex-direction: column; align-items: flex-start; }
      .nav-links { flex-wrap: wrap; }
      .cta-panel { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="nav">
        <div class="brand">${name}</div>
        <div class="nav-links">
          <a href="#about">${labels.about}</a>
          <a href="#expertise">${labels.expertise}</a>
          <a href="#process">${labels.method}</a>
          <a href="#contact">${labels.contact}</a>
        </div>
      </div>
      <div class="hero">
        <div>
          <span class="eyebrow">${niche.label}</span>
          <h1>${name}</h1>
          <p class="lead">${description}</p>
          <div class="hero-actions">
            <a class="btn primary" href="#contact">${labels.cta}</a>
            <a class="btn secondary" href="#expertise">Découvrir</a>
          </div>
        </div>
        <div class="hero-card">
          <div class="tag">${niche.message}</div>
          <h3 style="margin-top: 18px;">${sector} • ${city}</h3>
          <p>Une présence digitale pensée pour rassurer, convertir et faire grandir votre activité.</p>
          <div class="stat-grid">
            <div class="stat"><strong>Premium</strong><span>Design</span></div>
            <div class="stat"><strong>Mobile</strong><span>Optimisé</span></div>
            <div class="stat"><strong>${plan.pages}</strong><span>Sections</span></div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main>
    <section id="about">
      <div class="container">
        <div class="section-head">
          <div class="tag">${labels.about}</div>
          <h2>Une image premium qui commande la confiance.</h2>
        </div>
        <div class="grid-3">
          <article class="card">
            <h3>Positionnement</h3>
            <p>Nous créons une présence qui valorise votre expertise, votre qualité et votre différence.</p>
          </article>
          <article class="card">
            <h3>Conversion</h3>
            <p>Chaque section est pensée pour guider le client vers l’action la plus importante : contact, réservation ou achat.</p>
          </article>
          <article class="card">
            <h3>Crédibilité</h3>
            <p>Une identité visuelle claire et un message fort permettent de rassurer rapidement vos futurs clients.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="expertise">
      <div class="container">
        <div class="section-head">
          <div class="tag">${labels.expertise}</div>
          <h2>Des prestations alignées sur votre activité.</h2>
        </div>
        <div class="grid-3">
          ${plan.features.map((feature) => `<article class="card"><h3>${feature}</h3><p>Une solution pensée pour améliorer votre visibilité, votre image de marque et vos conversions.</p></article>`).join('')}
        </div>
      </div>
    </section>

    <section id="process">
      <div class="container">
        <div class="section-head">
          <div class="tag">${labels.method}</div>
          <h2>Une méthode simple, claire et orientée résultat.</h2>
        </div>
        <div class="process">
          <div class="step"><div class="step-num">1</div><h3>Diagnostic</h3><p>Nous identifions votre activité, votre cible et le message à faire passer.</p></div>
          <div class="step"><div class="step-num">2</div><h3>Strategie</h3><p>Nous définissons la structure, le positionnement et les sections qui convertissent.</p></div>
          <div class="step"><div class="step-num">3</div><h3>Design</h3><p>Nous créons une identité claire, premium et cohérente avec votre activité.</p></div>
          <div class="step"><div class="step-num">4</div><h3>Conversion</h3><p>Le site est optimisé pour capter les demandes, les réservations et les bons contacts.</p></div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="section-head">
          <div class="tag">${labels.trust}</div>
          <h2>Une expérience qui inspire confiance.</h2>
        </div>
        <div class="testimonials">
          <blockquote>
            "Le site rend immédiatement notre expertise plus crédible. Nous avons gagné en sérieux et en qualité de contact." 
          </blockquote>
          <blockquote>
            "Le design est propre, premium et beaucoup plus clair. Le site aide réellement à vendre." 
          </blockquote>
          <blockquote>
            "Il est à la fois élégant et efficace. Le message est crédible et la visite est agréable." 
          </blockquote>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="pricing">
          <div>
            <div class="tag">${plan.label}</div>
            <h3 style="margin: 12px 0 0;">Forfait ${plan.label}</h3>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--muted);">Investissement conseillé</div>
            <strong style="font-size: 2rem; display: block;">${project.currency || 'EUR'} ${project.setup || '2 900'}</strong>
          </div>
        </div>
      </div>
    </section>

    <section id="contact">
      <div class="container">
        <div class="cta-panel">
          <div>
            <div class="tag" style="background: rgba(255,255,255,0.16); color: white; border: 1px solid rgba(255,255,255,0.2);">${labels.contact}</div>
            <h2 style="margin: 12px 0 0;">Développons votre présence digitale.</h2>
          </div>
          <a class="btn primary" href="mailto:contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com">${labels.cta}</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">© ${new Date().getFullYear()} ${name} — ${sector} • ${city}</div>
  </footer>
</body>
</html>`;
    return html;
  };

  global.CPMSiteBuilder = { buildSiteHtml, getNiche, getPlan };
})(window);
