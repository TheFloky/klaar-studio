export type Lang = 'en' | 'de' | 'fr';

const translations = {
  en: {
    nav: { proposal: 'Get a Proposal' },
    hero: {
      headline: 'Swiss Precision.\nDigital Performance.',
      sub: 'We build high-end e-commerce engines and bespoke websites for motivated Swiss entrepreneurs.',
      cta: 'Start Your Project',
    },
    advantage: {
      title: 'The klaar Advantage',
      items: [
        { title: 'Native Communication', desc: 'Full German, English and French support — no language barriers, ever.' },
        { title: 'Swiss Quality Standards', desc: 'High-performance, nDSG-compliant code built to the highest standards.' },
        { title: 'Optimized ROI', desc: 'High-end results powered by lean, modern operations.' },
      ],
    },
    services: {
      title: 'Core Services',
      items: [
        { title: 'The 360° E-Commerce Launch', desc: 'Shopify / WooCommerce + TWINT + Swiss legal compliance — all done for you.' },
        { title: 'Bespoke Web Design', desc: 'High-speed sites built for conversion with Swiss precision craftsmanship.' },
        { title: 'Growth & Care Plans', desc: 'Ongoing maintenance, performance optimization, and strategic growth.' },
      ],
    },
    pricing: {
      title: 'Investment Tiers',
      subtitle: 'Transparent pricing. No hidden fees. Swiss quality at every level.',
      popular: 'Most Popular',
      cta: 'Get Started',
      addons: 'Compare Add-ons → SEO (CHF 500/mo) · Ads Management (CHF 900/mo)',
      note: 'Every Swiss business is unique. Contact us for a bespoke automation audit to find your perfect fit.',
      tiers: [
        {
          name: 'Essential Presence',
          price: 'CHF 2\'500',
          monthly: 'CHF 99/mo maintenance',
          features: [
            'High-end bespoke design',
            'Mobile optimization',
            'TWINT/Stripe integration',
            'nDSG Compliance',
          ],
        },
        {
          name: 'Business Engine',
          price: 'CHF 4\'000',
          monthly: 'CHF 150/mo maintenance',
          features: [
            'Everything in Essential',
            'Admin Dashboard',
            'Custom Inventory or Booking Systems',
            'Multi-language (DE/FR)',
          ],
        },
        {
          name: 'E-commerce Launch',
          price: 'CHF 5\'000',
          monthly: 'CHF 200/mo maintenance',
          features: [
            'Everything in Engine',
            'Shopify / WooCommerce Setup',
            'TWINT & Swiss Payment Methods',
            'Product Catalog & Inventory',
          ],
        },
        {
          name: 'klaar Elite',
          price: 'CHF 7\'500+',
          monthly: 'CHF 400/mo maintenance',
          features: [
            'Everything in E-commerce',
            'Custom AI Automation Tools',
            'Advanced Computer Vision/API Logic',
            'Heavy Initial SEO & Performance Audit',
          ],
        },
      ],
    },
    portfolio: {
      title: 'Featured Projects',
      subtitle: 'Real results for real businesses. Here\'s what we\'ve built.',
      viewCase: 'View Case Study',
      ctaText: 'Ready to build your system?',
      ctaButton: 'Start the Conversation',
      projects: [
        {
          client: 'The Local Brewery',
          title: 'AI-Powered Tap Management',
          desc: 'Computer vision system that syncs physical blackboards with digital menus.',
          result: '100% Automated Inventory',
          tags: ['#Automation', '#ComputerVision', '#Hospitality'],
        },
        {
          client: 'CK Solutions',
          title: 'Real Estate Authority',
          desc: 'Bespoke property portal with AI image enhancement and automated listings.',
          result: '3x Faster Listing Turnaround',
          tags: ['#RealEstate', '#AI', '#Portal'],
        },
        {
          client: 'Swiss Alpine Boutique',
          title: 'E-commerce Launch',
          desc: 'Seamless Shopify integration with local Swiss payment methods.',
          result: '40% Higher Conversion Rate',
          tags: ['#Ecommerce', '#Shopify', '#TWINT'],
        },
      ],
    },
    contact: {
      title: 'Let\'s Build Something Great',
      steps: ['Your Name', 'Business Goal', 'Budget Range'],
      namePlaceholder: 'Full name',
      goalPlaceholder: 'Tell us about your project...',
      budgets: ['CHF 5\'000 – 10\'000', 'CHF 10\'000 – 25\'000', 'CHF 25\'000 – 50\'000', 'CHF 50\'000+'],
      next: 'Next',
      back: 'Back',
      submit: 'Send Proposal Request',
      success: 'Thank you! We\'ll be in touch within 24 hours.',
    },
    footer: {
      address: '',
      phone: '+41 44 000 00 00',
    },
  },
  de: {
    nav: { proposal: 'Angebot anfordern' },
    hero: {
      headline: 'Schweizer Präzision.\nDigitale Performance.',
      sub: 'Wir bauen hochwertige E-Commerce-Plattformen und massgeschneiderte Websites für ambitionierte Schweizer Unternehmer.',
      cta: 'Projekt starten',
    },
    advantage: {
      title: 'Der Vanguard-Vorteil',
      items: [
        { title: 'Muttersprachliche Kommunikation', desc: 'Vollständiger Support auf Deutsch & Französisch — ohne Sprachbarrieren.' },
        { title: 'Schweizer Qualitätsstandards', desc: 'Hochleistungsfähiger, nDSG-konformer Code auf höchstem Niveau.' },
        { title: 'Optimierter ROI', desc: 'Erstklassige Ergebnisse durch schlanke, moderne Arbeitsweisen.' },
      ],
    },
    services: {
      title: 'Unsere Leistungen',
      items: [
        { title: 'Der 360° E-Commerce-Launch', desc: 'Shopify / WooCommerce + TWINT + Schweizer Rechtskonformität — alles aus einer Hand.' },
        { title: 'Massgeschneidertes Webdesign', desc: 'Schnelle Websites, gebaut für Konversion mit Schweizer Handwerkskunst.' },
        { title: 'Wachstums- & Betreuungspläne', desc: 'Laufende Wartung, Performance-Optimierung und strategisches Wachstum.' },
      ],
    },
    pricing: {
      title: 'Investitionsstufen',
      subtitle: 'Transparente Preise. Keine versteckten Gebühren. Schweizer Qualität auf jedem Niveau.',
      popular: 'Beliebteste',
      cta: 'Jetzt starten',
      addons: 'Add-ons vergleichen → SEO (CHF 500/Mt.) · Ads Management (CHF 900/Mt.)',
      note: 'Jedes Schweizer Unternehmen ist einzigartig. Kontaktieren Sie uns für ein massgeschneidertes Automatisierungs-Audit.',
      tiers: [
        {
          name: 'Essential Presence',
          price: 'CHF 2\'500',
          monthly: 'CHF 99/Mt. Wartung',
          features: [
            'Hochwertiges massgeschneidertes Design',
            'Mobile Optimierung',
            'TWINT/Stripe-Integration',
            'nDSG-Konformität',
          ],
        },
        {
          name: 'Business Engine',
          price: 'CHF 4\'000',
          monthly: 'CHF 150/Mt. Wartung',
          features: [
            'Alles aus Essential',
            'Admin-Dashboard',
            'Individuelles Inventar- oder Buchungssystem',
            'Mehrsprachig (DE/FR)',
          ],
        },
        {
          name: 'E-commerce Launch',
          price: 'CHF 5\'000',
          monthly: 'CHF 200/Mt. Wartung',
          features: [
            'Alles aus Engine',
            'Shopify / WooCommerce-Einrichtung',
            'TWINT & Schweizer Zahlungsmethoden',
            'Produktkatalog & Lagerverwaltung',
          ],
        },
        {
          name: 'Vanguard Elite',
          price: 'CHF 7\'500+',
          monthly: 'CHF 400/Mt. Wartung',
          features: [
            'Alles aus E-commerce',
            'Individuelle KI-Automatisierungstools',
            'Erweiterte Computer Vision/API-Logik',
            'Umfangreiches SEO & Performance-Audit',
          ],
        },
      ],
    },
    portfolio: {
      title: 'Ausgewählte Projekte',
      subtitle: 'Echte Ergebnisse für echte Unternehmen. Das haben wir gebaut.',
      viewCase: 'Fallstudie ansehen',
      ctaText: 'Bereit, Ihr System zu bauen?',
      ctaButton: 'Gespräch starten',
      projects: [
        {
          client: 'The Local Brewery',
          title: 'KI-gesteuerte Zapfverwaltung',
          desc: 'Computer-Vision-System, das physische Tafeln mit digitalen Menüs synchronisiert.',
          result: '100% Automatisiertes Inventar',
          tags: ['#Automatisierung', '#ComputerVision', '#Gastronomie'],
        },
        {
          client: 'CK Solutions',
          title: 'Immobilien-Autorität',
          desc: 'Massgeschneidertes Immobilienportal mit KI-Bildverbesserung und automatisierten Inseraten.',
          result: '3x Schnellere Inseraterstellung',
          tags: ['#Immobilien', '#KI', '#Portal'],
        },
        {
          client: 'Swiss Alpine Boutique',
          title: 'E-Commerce-Launch',
          desc: 'Nahtlose Shopify-Integration mit lokalen Schweizer Zahlungsmethoden.',
          result: '40% Höhere Konversionsrate',
          tags: ['#Ecommerce', '#Shopify', '#TWINT'],
        },
      ],
    },
    contact: {
      title: 'Lassen Sie uns etwas Grosses bauen',
      steps: ['Ihr Name', 'Geschäftsziel', 'Budgetrahmen'],
      namePlaceholder: 'Vollständiger Name',
      goalPlaceholder: 'Erzählen Sie uns von Ihrem Projekt...',
      budgets: ['CHF 5\'000 – 10\'000', 'CHF 10\'000 – 25\'000', 'CHF 25\'000 – 50\'000', 'CHF 50\'000+'],
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
    nav: { proposal: 'Demander un devis' },
    hero: {
      headline: 'Précision Suisse.\nPerformance Digitale.',
      sub: 'Nous créons des moteurs e-commerce haut de gamme et des sites sur mesure pour les entrepreneurs suisses ambitieux.',
      cta: 'Lancer votre projet',
    },
    advantage: {
      title: 'L\'Avantage Vanguard',
      items: [
        { title: 'Communication native', desc: 'Support complet en allemand et français — sans barrière linguistique.' },
        { title: 'Standards de qualité suisses', desc: 'Code haute performance, conforme à la nLPD, construit aux plus hauts standards.' },
        { title: 'ROI optimisé', desc: 'Résultats haut de gamme grâce à des opérations modernes et efficaces.' },
      ],
    },
    services: {
      title: 'Nos Services',
      items: [
        { title: 'Lancement E-Commerce 360°', desc: 'Shopify / WooCommerce + TWINT + conformité juridique suisse — tout inclus.' },
        { title: 'Design Web Sur Mesure', desc: 'Sites rapides conçus pour la conversion avec la précision suisse.' },
        { title: 'Plans Croissance & Maintenance', desc: 'Maintenance continue, optimisation des performances et croissance stratégique.' },
      ],
    },
    pricing: {
      title: 'Niveaux d\'Investissement',
      subtitle: 'Prix transparents. Pas de frais cachés. Qualité suisse à chaque niveau.',
      popular: 'Le Plus Populaire',
      cta: 'Commencer',
      addons: 'Comparer les add-ons → SEO (CHF 500/mois) · Gestion Ads (CHF 900/mois)',
      note: 'Chaque entreprise suisse est unique. Contactez-nous pour un audit d\'automatisation sur mesure.',
      tiers: [
        {
          name: 'Essential Presence',
          price: 'CHF 2\'500',
          monthly: 'CHF 99/mois maintenance',
          features: [
            'Design haut de gamme sur mesure',
            'Optimisation mobile',
            'Intégration TWINT/Stripe',
            'Conformité nLPD',
          ],
        },
        {
          name: 'Business Engine',
          price: 'CHF 4\'000',
          monthly: 'CHF 150/mois maintenance',
          features: [
            'Tout dans Essential',
            'Tableau de bord admin',
            'Systèmes d\'inventaire ou de réservation',
            'Multilingue (DE/FR)',
          ],
        },
        {
          name: 'E-commerce Launch',
          price: 'CHF 5\'000',
          monthly: 'CHF 200/mois maintenance',
          features: [
            'Tout dans Engine',
            'Configuration Shopify / WooCommerce',
            'TWINT & méthodes de paiement suisses',
            'Catalogue produits & inventaire',
          ],
        },
        {
          name: 'Vanguard Elite',
          price: 'CHF 7\'500+',
          monthly: 'CHF 400/mois maintenance',
          features: [
            'Tout dans E-commerce',
            'Outils d\'automatisation IA personnalisés',
            'Logique avancée Computer Vision/API',
            'Audit SEO & Performance approfondi',
          ],
        },
      ],
    },
    portfolio: {
      title: 'Projets en Vedette',
      subtitle: 'Des résultats concrets pour de vraies entreprises. Voici ce que nous avons construit.',
      viewCase: 'Voir l\'étude de cas',
      ctaText: 'Prêt à construire votre système ?',
      ctaButton: 'Démarrer la conversation',
      projects: [
        {
          client: 'The Local Brewery',
          title: 'Gestion des Tireuses par IA',
          desc: 'Système de vision par ordinateur synchronisant les tableaux noirs avec les menus numériques.',
          result: 'Inventaire 100% Automatisé',
          tags: ['#Automatisation', '#VisionParOrdinateur', '#Hôtellerie'],
        },
        {
          client: 'CK Solutions',
          title: 'Autorité Immobilière',
          desc: 'Portail immobilier sur mesure avec amélioration d\'images IA et annonces automatisées.',
          result: 'Délai de Publication 3x Plus Rapide',
          tags: ['#Immobilier', '#IA', '#Portail'],
        },
        {
          client: 'Swiss Alpine Boutique',
          title: 'Lancement E-commerce',
          desc: 'Intégration Shopify transparente avec les méthodes de paiement suisses locales.',
          result: 'Taux de Conversion +40%',
          tags: ['#Ecommerce', '#Shopify', '#TWINT'],
        },
      ],
    },
    contact: {
      title: 'Construisons quelque chose de grand',
      steps: ['Votre nom', 'Objectif commercial', 'Fourchette budgétaire'],
      namePlaceholder: 'Nom complet',
      goalPlaceholder: 'Parlez-nous de votre projet...',
      budgets: ['CHF 5\'000 – 10\'000', 'CHF 10\'000 – 25\'000', 'CHF 25\'000 – 50\'000', 'CHF 50\'000+'],
      next: 'Suivant',
      back: 'Retour',
      submit: 'Envoyer la demande',
      success: 'Merci ! Nous vous recontacterons dans les 24 heures.',
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
