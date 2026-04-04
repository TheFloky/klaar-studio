export type Lang = 'en' | 'de' | 'fr';

const translations = {
  en: {
    nav: { proposal: 'Get a Free Quote' },
    hero: {
      headline: 'Swiss Precision.\nDigital Performance.',
      sub: 'We design stunning websites and online shops for Swiss businesses — built to look great, work fast, and win customers.',
      cta: 'Get Your Free Quote',
    },
    advantage: {
      title: 'Why Choose klaar?',
      items: [
        { title: 'We Speak Your Language', desc: 'Fluent in German, French, and English. No miscommunication, no confusion — just clear collaboration.' },
        { title: 'Built to Swiss Standards', desc: 'Fast, secure, and fully compliant with Swiss data protection law (nDSG). Your customers\' data is safe.' },
        { title: 'Real Results, Fair Prices', desc: 'Premium quality without the agency markup. Smart workflows mean you get more value for every franc.' },
      ],
    },
    services: {
      title: 'What We Do',
      items: [
        { title: 'Online Shop — Ready to Sell', desc: 'A complete online store with Swiss payment methods like TWINT and Stripe — ready to take orders from day one.' },
        { title: 'Websites That Win Customers', desc: 'Fast, beautiful websites designed to turn visitors into paying customers. Built with care, delivered on time.' },
        { title: 'Ongoing Support & Growth', desc: 'We don\'t disappear after launch. Monthly updates, speed improvements, and strategy calls to keep you growing.' },
        { title: 'Smart AI Automation', desc: 'Save hours every week with custom AI tools — from automated menus to smart image editing and self-updating content.' },
      ],
    },
    pricing: {
      title: 'Simple, Honest Pricing',
      subtitle: 'No hidden fees. No surprises. Pick the package that fits your business.',
      popular: 'Most Popular',
      cta: 'Get Started',
      addons: 'Optional Add-ons → SEO (CHF 500/mo) · Ads Management (CHF 900/mo)',
      note: 'Not sure which package is right? Book a free 15-minute call and we\'ll help you decide.',
      tiers: [
        {
          name: 'Starter Website',
          price: 'CHF 2\'500',
          monthly: 'CHF 99/mo support',
          features: [
            'Custom-designed, modern look',
            'Perfect on phones & tablets',
            'Swiss payments (TWINT & Stripe)',
            'Legally compliant (nDSG)',
          ],
        },
        {
          name: 'Business Website',
          price: 'CHF 4\'000',
          monthly: 'CHF 150/mo support',
          features: [
            'Everything in Starter',
            'Admin dashboard to manage content',
            'Booking system or inventory tracker',
            'Available in multiple languages',
          ],
        },
        {
          name: 'Online Shop',
          price: 'CHF 5\'000',
          monthly: 'CHF 200/mo support',
          features: [
            'Everything in Business',
            'Full Shopify or WooCommerce store',
            'All Swiss payment methods included',
            'Product catalog & stock management',
          ],
        },
        {
          name: 'klaar Elite',
          price: 'CHF 7\'500+',
          monthly: 'CHF 400/mo support',
          features: [
            'Everything in Online Shop',
            'Custom AI tools to automate your work',
            'Advanced integrations & smart features',
            'In-depth SEO & performance audit',
          ],
        },
      ],
    },
    portfolio: {
      title: 'Our Work',
      subtitle: 'Real projects. Real results. See what we\'ve built for businesses like yours.',
      viewCase: 'See the Results',
      ctaText: 'Ready for a website that actually works?',
      ctaButton: 'Let\'s Talk',
      projects: [
        {
          client: 'The Local Brewery',
          title: 'AI-Powered Menu System',
          desc: 'A smart system that reads the chalkboard and updates the digital menu automatically — no manual work needed.',
          result: '100% Automated — Zero Manual Updates',
          tags: ['#AI', '#Automation', '#Hospitality'],
        },
        {
          client: 'CK Solutions',
          title: 'Property Listing Platform',
          desc: 'A custom website that automatically enhances property photos with AI and creates professional listings.',
          result: '3× Faster Listings Published',
          tags: ['#RealEstate', '#AI', '#WebDesign'],
        },
        {
          client: 'Swiss Alpine Boutique',
          title: 'Online Shop Launch',
          desc: 'A beautiful Shopify store with TWINT and Swiss payment methods — ready to sell from day one.',
          result: '40% More Sales Than Before',
          tags: ['#OnlineShop', '#Shopify', '#TWINT'],
        },
      ],
    },
    contact: {
      title: 'Let\'s Get Started',
      steps: ['Your Name', 'Your Project', 'Your Budget'],
      namePlaceholder: 'Full name',
      goalPlaceholder: 'Tell us what you need — a website, an online shop, or something else...',
      budgets: ['CHF 2\'500 – 5\'000', 'CHF 5\'000 – 10\'000', 'CHF 10\'000 – 25\'000', 'CHF 25\'000+'],
      next: 'Next',
      back: 'Back',
      submit: 'Send My Request',
      success: 'Thank you! We\'ll get back to you within 24 hours.',
    },
    footer: {
      address: '',
      phone: '+41 44 000 00 00',
    },
  },
  de: {
    nav: { proposal: 'Kostenloses Angebot' },
    hero: {
      headline: 'Schweizer Präzision.\nDigitale Performance.',
      sub: 'Wir gestalten beeindruckende Websites und Online-Shops für Schweizer Unternehmen — gebaut um grossartig auszusehen, schnell zu laden und Kunden zu gewinnen.',
      cta: 'Kostenloses Angebot erhalten',
    },
    advantage: {
      title: 'Warum klaar?',
      items: [
        { title: 'Wir sprechen Ihre Sprache', desc: 'Fliessend auf Deutsch, Französisch und Englisch. Keine Missverständnisse — nur klare Zusammenarbeit.' },
        { title: 'Schweizer Qualität', desc: 'Schnell, sicher und vollständig nDSG-konform. Die Daten Ihrer Kunden sind bei uns sicher.' },
        { title: 'Faire Preise, Top-Ergebnisse', desc: 'Premium-Qualität ohne Agentur-Aufschlag. Smarte Arbeitsweisen bringen Ihnen mehr Wert für jeden Franken.' },
      ],
    },
    services: {
      title: 'Was wir machen',
      items: [
        { title: 'Online-Shop — Sofort verkaufen', desc: 'Ein kompletter Online-Shop mit TWINT und Stripe — bereit, ab dem ersten Tag Bestellungen anzunehmen.' },
        { title: 'Websites, die Kunden gewinnen', desc: 'Schnelle, schöne Websites, die Besucher in zahlende Kunden verwandeln. Mit Sorgfalt gebaut, pünktlich geliefert.' },
        { title: 'Betreuung & Wachstum', desc: 'Wir verschwinden nicht nach dem Launch. Monatliche Updates, Optimierungen und Strategiegespräche.' },
      ],
    },
    pricing: {
      title: 'Einfache, ehrliche Preise',
      subtitle: 'Keine versteckten Gebühren. Keine Überraschungen. Wählen Sie das Paket, das zu Ihrem Geschäft passt.',
      popular: 'Beliebteste',
      cta: 'Jetzt starten',
      addons: 'Optionale Add-ons → SEO (CHF 500/Mt.) · Ads Management (CHF 900/Mt.)',
      note: 'Nicht sicher, welches Paket passt? Buchen Sie ein kostenloses 15-Minuten-Gespräch.',
      tiers: [
        {
          name: 'Starter Website',
          price: 'CHF 2\'500',
          monthly: 'CHF 99/Mt. Support',
          features: [
            'Individuelles, modernes Design',
            'Perfekt auf Handy & Tablet',
            'Schweizer Zahlungen (TWINT & Stripe)',
            'Rechtskonform (nDSG)',
          ],
        },
        {
          name: 'Business Website',
          price: 'CHF 4\'000',
          monthly: 'CHF 150/Mt. Support',
          features: [
            'Alles aus Starter',
            'Admin-Bereich zur Verwaltung',
            'Buchungssystem oder Lagerverwaltung',
            'Mehrsprachig verfügbar',
          ],
        },
        {
          name: 'Online-Shop',
          price: 'CHF 5\'000',
          monthly: 'CHF 200/Mt. Support',
          features: [
            'Alles aus Business',
            'Kompletter Shopify / WooCommerce Shop',
            'Alle Schweizer Zahlungsmethoden',
            'Produktkatalog & Lagerverwaltung',
          ],
        },
        {
          name: 'klaar Elite',
          price: 'CHF 7\'500+',
          monthly: 'CHF 400/Mt. Support',
          features: [
            'Alles aus Online-Shop',
            'Individuelle KI-Tools für Ihre Arbeit',
            'Erweiterte Integrationen & smarte Features',
            'Umfassendes SEO & Performance-Audit',
          ],
        },
      ],
    },
    portfolio: {
      title: 'Unsere Arbeit',
      subtitle: 'Echte Projekte. Echte Ergebnisse. Sehen Sie, was wir für Unternehmen wie Ihres gebaut haben.',
      viewCase: 'Ergebnisse ansehen',
      ctaText: 'Bereit für eine Website, die wirklich funktioniert?',
      ctaButton: 'Lassen Sie uns reden',
      projects: [
        {
          client: 'The Local Brewery',
          title: 'KI-gestütztes Menüsystem',
          desc: 'Ein smartes System, das die Kreidetafel liest und das digitale Menü automatisch aktualisiert.',
          result: '100% Automatisiert — Null manuelle Arbeit',
          tags: ['#KI', '#Automatisierung', '#Gastronomie'],
        },
        {
          client: 'CK Solutions',
          title: 'Immobilien-Plattform',
          desc: 'Eine Website, die Immobilienfotos mit KI verbessert und professionelle Inserate erstellt.',
          result: '3× Schnellere Inserate',
          tags: ['#Immobilien', '#KI', '#Webdesign'],
        },
        {
          client: 'Swiss Alpine Boutique',
          title: 'Online-Shop Launch',
          desc: 'Ein schöner Shopify-Shop mit TWINT und Schweizer Zahlungsmethoden — sofort verkaufsbereit.',
          result: '40% Mehr Umsatz als vorher',
          tags: ['#OnlineShop', '#Shopify', '#TWINT'],
        },
      ],
    },
    contact: {
      title: 'Legen wir los',
      steps: ['Ihr Name', 'Ihr Projekt', 'Ihr Budget'],
      namePlaceholder: 'Vollständiger Name',
      goalPlaceholder: 'Sagen Sie uns, was Sie brauchen — eine Website, einen Online-Shop oder etwas anderes...',
      budgets: ['CHF 2\'500 – 5\'000', 'CHF 5\'000 – 10\'000', 'CHF 10\'000 – 25\'000', 'CHF 25\'000+'],
      next: 'Weiter',
      back: 'Zurück',
      submit: 'Anfrage senden',
      success: 'Vielen Dank! Wir melden uns innerhalb von 24 Stunden.',
    },
    footer: {
      address: '',
      phone: '+41 44 000 00 00',
    },
  },
  fr: {
    nav: { proposal: 'Devis gratuit' },
    hero: {
      headline: 'Beaux Sites Web.\nPropulsés par l\'IA.',
      sub: 'Nous créons des sites web et boutiques en ligne magnifiques pour les entreprises suisses — avec des outils IA intelligents qui vous font gagner du temps et de l\'argent.',
      cta: 'Obtenir un devis gratuit',
    },
    advantage: {
      title: 'Pourquoi klaar ?',
      items: [
        { title: 'On parle votre langue', desc: 'Couramment en allemand, français et anglais. Pas de malentendus — juste une collaboration claire.' },
        { title: 'Qualité suisse', desc: 'Rapide, sécurisé et entièrement conforme à la nLPD. Les données de vos clients sont en sécurité.' },
        { title: 'Prix justes, résultats premium', desc: 'Qualité premium sans les frais d\'agence excessifs. Des méthodes intelligentes pour plus de valeur.' },
      ],
    },
    services: {
      title: 'Nos Services',
      items: [
        { title: 'Boutique en ligne — Prête à vendre', desc: 'Une boutique complète avec TWINT et Stripe — prête à prendre des commandes dès le premier jour.' },
        { title: 'Sites qui convertissent', desc: 'Des sites rapides et beaux qui transforment les visiteurs en clients. Conçus avec soin, livrés à temps.' },
        { title: 'Support & Croissance', desc: 'On ne disparaît pas après le lancement. Mises à jour mensuelles, optimisations et appels stratégiques.' },
      ],
    },
    pricing: {
      title: 'Prix simples et honnêtes',
      subtitle: 'Pas de frais cachés. Pas de surprises. Choisissez le forfait qui correspond à votre entreprise.',
      popular: 'Le Plus Populaire',
      cta: 'Commencer',
      addons: 'Add-ons optionnels → SEO (CHF 500/mois) · Gestion Ads (CHF 900/mois)',
      note: 'Pas sûr du forfait idéal ? Réservez un appel gratuit de 15 minutes.',
      tiers: [
        {
          name: 'Site Starter',
          price: 'CHF 2\'500',
          monthly: 'CHF 99/mois support',
          features: [
            'Design moderne sur mesure',
            'Parfait sur mobile et tablette',
            'Paiements suisses (TWINT & Stripe)',
            'Conforme à la loi (nLPD)',
          ],
        },
        {
          name: 'Site Business',
          price: 'CHF 4\'000',
          monthly: 'CHF 150/mois support',
          features: [
            'Tout dans Starter',
            'Tableau de bord pour gérer le contenu',
            'Système de réservation ou d\'inventaire',
            'Disponible en plusieurs langues',
          ],
        },
        {
          name: 'Boutique en Ligne',
          price: 'CHF 5\'000',
          monthly: 'CHF 200/mois support',
          features: [
            'Tout dans Business',
            'Boutique Shopify / WooCommerce complète',
            'Tous les moyens de paiement suisses',
            'Catalogue produits & gestion des stocks',
          ],
        },
        {
          name: 'klaar Elite',
          price: 'CHF 7\'500+',
          monthly: 'CHF 400/mois support',
          features: [
            'Tout dans Boutique en Ligne',
            'Outils IA personnalisés pour votre travail',
            'Intégrations avancées & fonctionnalités intelligentes',
            'Audit SEO & performance approfondi',
          ],
        },
      ],
    },
    portfolio: {
      title: 'Nos Réalisations',
      subtitle: 'De vrais projets. De vrais résultats. Découvrez ce que nous avons construit.',
      viewCase: 'Voir les résultats',
      ctaText: 'Prêt pour un site qui fonctionne vraiment ?',
      ctaButton: 'Discutons-en',
      projects: [
        {
          client: 'The Local Brewery',
          title: 'Menu intelligent par IA',
          desc: 'Un système qui lit le tableau noir et met à jour le menu numérique automatiquement.',
          result: '100% Automatisé — Zéro travail manuel',
          tags: ['#IA', '#Automatisation', '#Restauration'],
        },
        {
          client: 'CK Solutions',
          title: 'Plateforme immobilière',
          desc: 'Un site qui améliore les photos avec l\'IA et crée des annonces professionnelles automatiquement.',
          result: 'Annonces publiées 3× plus vite',
          tags: ['#Immobilier', '#IA', '#WebDesign'],
        },
        {
          client: 'Swiss Alpine Boutique',
          title: 'Lancement boutique en ligne',
          desc: 'Une belle boutique Shopify avec TWINT et les méthodes de paiement suisses.',
          result: '40% de ventes en plus',
          tags: ['#Boutique', '#Shopify', '#TWINT'],
        },
      ],
    },
    contact: {
      title: 'C\'est parti !',
      steps: ['Votre nom', 'Votre projet', 'Votre budget'],
      namePlaceholder: 'Nom complet',
      goalPlaceholder: 'Dites-nous ce qu\'il vous faut — un site, une boutique en ligne ou autre chose...',
      budgets: ['CHF 2\'500 – 5\'000', 'CHF 5\'000 – 10\'000', 'CHF 10\'000 – 25\'000', 'CHF 25\'000+'],
      next: 'Suivant',
      back: 'Retour',
      submit: 'Envoyer ma demande',
      success: 'Merci ! Nous vous répondrons dans les 24 heures.',
    },
    footer: {
      address: '',
      phone: '+41 44 000 00 00',
    },
  },
} as const;

type PricingTier = {
  name: string;
  price: string;
  monthly: string;
  features: string[];
};

type Project = {
  client: string;
  title: string;
  desc: string;
  result: string;
  tags: string[];
};

type TranslationMap = {
  nav: { proposal: string };
  hero: { headline: string; sub: string; cta: string };
  advantage: { title: string; items: { title: string; desc: string }[] };
  services: { title: string; items: { title: string; desc: string }[] };
  pricing: {
    title: string;
    subtitle: string;
    popular: string;
    cta: string;
    addons: string;
    note: string;
    tiers: PricingTier[];
  };
  portfolio: {
    title: string;
    subtitle: string;
    viewCase: string;
    ctaText: string;
    ctaButton: string;
    projects: Project[];
  };
  contact: { title: string; steps: string[]; namePlaceholder: string; goalPlaceholder: string; budgets: string[]; next: string; back: string; submit: string; success: string };
  footer: { address: string; phone: string };
};
export type Translations = TranslationMap;
export const getTranslations = (lang: Lang): Translations => translations[lang] as unknown as Translations;
