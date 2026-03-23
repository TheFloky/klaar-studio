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
      title: 'The Vanguard Advantage',
      items: [
        { title: 'Native Communication', desc: 'Full German & French support — no language barriers, ever.' },
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
      address: 'Vanguard Digital GmbH\nBahnhofstrasse 42\n8001 Zürich, Switzerland',
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
      address: 'Vanguard Digital GmbH\nBahnhofstrasse 42\n8001 Zürich, Schweiz',
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
      address: 'Vanguard Digital GmbH\nBahnhofstrasse 42\n8001 Zürich, Suisse',
      phone: '+41 44 000 00 00',
    },
  },
} as const;

type TranslationMap = {
  nav: { proposal: string };
  hero: { headline: string; sub: string; cta: string };
  advantage: { title: string; items: { title: string; desc: string }[] };
  services: { title: string; items: { title: string; desc: string }[] };
  contact: { title: string; steps: string[]; namePlaceholder: string; goalPlaceholder: string; budgets: string[]; next: string; back: string; submit: string; success: string };
  footer: { address: string; phone: string };
};
export type Translations = TranslationMap;
export const getTranslations = (lang: Lang): Translations => translations[lang] as unknown as Translations;
