export type Lang = 'en' | 'de' | 'fr';

const translations = {
  en: {
    nav: { proposal: 'Get a Free Quote' },
    hero: {
      headline: 'Swiss Precision.\nDigital Performance.',
      sub: 'We design stunning websites and online shops for Swiss businesses — built to look great, work fast, and win customers.',
      cta: 'Book a Free Consultation',
      badge: 'Klaar Digital Agency',
    },
    badges: {
      swissHosted: '100% Swiss-Hosted Data',
      nfadp: 'nFADP 2026 Compliant',
      privacyFirst: 'Privacy-First Architecture',
      noUsCloud: 'No US-Cloud Data Leaks',
    },
    advantage: {
      title: 'Why Choose KLAAR?',
      items: [
        { title: 'We Speak Your Language', desc: 'Fluent in German, French, and English. No miscommunication, no confusion — just clear collaboration.' },
        { title: 'Built to Swiss Standards', desc: 'Fast, secure, and fully compliant with Swiss data protection law (nDSG). Your customers\' data is safe.' },
        { title: 'Real Results, Fair Prices', desc: 'Premium quality without the agency markup. Smart workflows mean you get more value for every franc.' },
      ],
    },
    sovereignty: {
      title: 'The Sovereignty Advantage',
      subtitle: 'Your website should protect your business — not expose it. Here\'s how we keep your data under Swiss law.',
      items: [
        { title: 'Data Residency (Geneva/Zurich)', text: 'We host exclusively on TIER II+ Swiss servers. Your business data stays under Swiss jurisdiction, shielded from the US Cloud Act and foreign surveillance.' },
        { title: 'IP-Leak Protection', text: 'We eliminate silent data transfers. No external Google Fonts or US CDNs. We serve every asset locally to keep your visitors\' IP addresses private.' },
        { title: 'CEO Liability Shield', text: 'The revised nFADP places personal liability on directors. We build \'Privacy by Design\' so you can focus on growth, not legal risks.' },
        { title: 'Sovereign AI (The OpenAI Alternative)', text: 'Most AI tools send your company secrets to US servers for training. Our Sovereign AI runs exclusively on Infomaniak\'s Swiss-hosted infrastructure. Your data stays in the bunker, remains your property, and is never used to train third-party models.' },
      ],
    },
    compliance: {
      badge: 'Free Compliance Check',
      title: 'Is Your Website Legally Compliant?',
      subtitle: 'Enter your website URL and we\'ll scan it for Swiss data protection issues — font leaks, US tracking scripts, hosting location, and more. Free, instant results.',
      placeholder: 'yourwebsite.ch',
      cta: 'Run Free Audit',
      footnote: 'Checks hosting location, Google Fonts, tracking scripts & Impressum — based on nFADP / nDSG requirements.',
    },
    services: {
      title: 'What We Do',
      items: [
        { title: 'Online Shop — Ready to Sell', desc: 'A complete online store with Swiss payment methods like TWINT and Stripe — ready to take orders from day one.' },
        { title: 'Websites That Win Customers', desc: 'Fast, beautiful websites designed to turn visitors into paying customers. Built with care, delivered on time.' },
        { title: 'Ongoing Support & Growth', desc: 'We don\'t disappear after launch. Monthly updates, speed improvements, and strategy calls to keep you growing.' },
        { title: 'AI Efficiency & Sovereign LLMs', desc: 'Private knowledge bases to chat with your company PDFs securely. Automated multilingual content in German, French & Italian. AI-driven workflows with Swiss banking-grade privacy.' },
      ],
    },
    pricing: {
      title: 'Simple, Honest Pricing',
      subtitle: 'No hidden fees. No surprises. Pick the package that fits your business.',
      popular: 'Most Popular',
      cta: 'Get Started',
      addons: 'Optional Add-ons → SEO (CHF 500/mo) · Ads Management (CHF 900/mo)',
      note: 'Not sure which package is right? Book a free 15-minute call and we\'ll help you decide.',
    },
    portfolio: {
      title: 'Our Work',
      subtitle: 'Real projects. Real results. See what we\'ve built for businesses like yours.',
      viewCase: 'View live site',
      ctaText: 'Ready for a website that actually works?',
      ctaButton: 'Let\'s Talk',
      projects: [
        {
          client: 'Venture Europe',
          title: 'Podcast Platform & Episode Hub',
          desc: 'Episodes, guest profiles, partner logos and direct links to Spotify, Apple and YouTube.',
          result: 'Every episode one click from any platform',
          tags: ['#Media', '#Podcast', '#WebApp'],
          url: 'https://ventureeurope.lovable.app',
        },
        {
          client: 'Jabeerwocky',
          title: 'Craft Beer Pub Website',
          desc: 'Three languages, an age check, the live tap list and the menu, all on one page.',
          result: 'Three languages, one clear visit',
          tags: ['#Hospitality', '#WebDesign', '#Multilingual'],
          url: 'https://jabeerwocky.com/en',
        },
        {
          client: 'Aviatic Films',
          title: 'Stock Footage Library',
          desc: 'Filter by city, place and time of day, save favourites, request a licence.',
          result: 'Search, favourite and licence in one place',
          tags: ['#ECommerce', '#Media', '#Licensing'],
          url: 'https://stockfootage.aviaticfilms.ch',
        },
      ],
    },
    contact: {
      title: 'Book a Free Consultation',
      steps: ['Full Name', 'Business', 'Your Needs'],
      namePlaceholder: 'Your full name',
      emailPlaceholder: 'your@email.com',
      phonePlaceholder: 'Phone number (optional)',
      websitePlaceholder: 'Your website URL (optional)',
      businessPlaceholder: 'Your business name',
      needsPlaceholder: 'Tell us what you need — a website, an online shop, compliance audit, or something else...',
      next: 'Next',
      back: 'Back',
      submit: 'Continue to time selection',
      success: 'Pick a time that works for you',
      pickDate: 'Choose a time',
      loading: 'Loading calendar...',
      noSlots: 'Could not load the calendar. Please try again.',
    },
    footer: {
      address: '',
      phone: '+41 44 000 00 00',
      impressum: 'Impressum',
      privacy: 'Privacy Policy',
      rights: 'All rights reserved.',
    },
  },
  de: {
    nav: { proposal: 'Kostenloses Angebot' },
    hero: {
      headline: 'Schweizer Präzision.\nDigitale Performance.',
      sub: 'Wir gestalten beeindruckende Websites und Online-Shops für Schweizer Unternehmen — gebaut um grossartig auszusehen, schnell zu laden und Kunden zu gewinnen.',
      cta: 'Kostenlose Beratung buchen',
      badge: 'Klaar Digitalagentur',
    },
    badges: {
      swissHosted: '100 % Schweizer Hosting',
      nfadp: 'nDSG 2026 konform',
      privacyFirst: 'Privacy-First-Architektur',
      noUsCloud: 'Keine US-Cloud-Datenlecks',
    },
    advantage: {
      title: 'Warum KLAAR?',
      items: [
        { title: 'Wir sprechen Ihre Sprache', desc: 'Fliessend auf Deutsch, Französisch und Englisch. Keine Missverständnisse — nur klare Zusammenarbeit.' },
        { title: 'Schweizer Standards', desc: 'Schnell, sicher und vollständig nDSG-konform. Die Daten Ihrer Kunden sind bei uns sicher.' },
        { title: 'Faire Preise, Top-Ergebnisse', desc: 'Premium-Qualität ohne Agentur-Aufschlag. Smarte Arbeitsweisen bringen Ihnen mehr Wert für jeden Franken.' },
      ],
    },
    sovereignty: {
      title: 'Der Souveränitätsvorteil',
      subtitle: 'Ihre Website sollte Ihr Unternehmen schützen — nicht gefährden. So halten wir Ihre Daten unter Schweizer Recht.',
      items: [
        { title: 'Datenstandort (Genf/Zürich)', text: 'Wir hosten ausschliesslich auf TIER II+ Schweizer Servern. Ihre Geschäftsdaten bleiben unter Schweizer Jurisdiktion, geschützt vor dem US Cloud Act und ausländischer Überwachung.' },
        { title: 'IP-Leak-Schutz', text: 'Wir eliminieren stille Datentransfers. Keine externen Google Fonts oder US-CDNs. Wir liefern jedes Asset lokal, um die IP-Adressen Ihrer Besucher privat zu halten.' },
        { title: 'CEO-Haftungsschutz', text: 'Das revidierte nDSG sieht persönliche Haftung für Geschäftsführer vor. Wir bauen \'Privacy by Design\', damit Sie sich auf Wachstum konzentrieren können — nicht auf rechtliche Risiken.' },
        { title: 'Souveräne KI (Die OpenAI-Alternative)', text: 'Die meisten KI-Tools senden Ihre Firmengeheimnisse an US-Server zum Training. Unsere souveräne KI läuft ausschliesslich auf Infomaniaks Schweizer Infrastruktur. Ihre Daten bleiben im Bunker, sind Ihr Eigentum und werden nie für Drittmodelle verwendet.' },
      ],
    },
    compliance: {
      badge: 'Kostenloser Compliance-Check',
      title: 'Ist Ihre Website rechtskonform?',
      subtitle: 'Geben Sie Ihre Website-URL ein und wir prüfen sie auf Schweizer Datenschutzprobleme — Schriftarten-Lecks, US-Tracking-Skripte, Hosting-Standort und mehr. Kostenlos, sofortige Ergebnisse.',
      placeholder: 'ihrewebsite.ch',
      cta: 'Kostenloses Audit starten',
      footnote: 'Prüft Hosting-Standort, Google Fonts, Tracking-Skripte & Impressum — basierend auf nDSG-Anforderungen.',
    },
    services: {
      title: 'Was wir machen',
      items: [
        { title: 'Online-Shop — Sofort verkaufen', desc: 'Ein kompletter Online-Shop mit TWINT und Stripe — bereit, ab dem ersten Tag Bestellungen anzunehmen.' },
        { title: 'Websites, die Kunden gewinnen', desc: 'Schnelle, schöne Websites, die Besucher in zahlende Kunden verwandeln. Mit Sorgfalt gebaut, pünktlich geliefert.' },
        { title: 'Betreuung & Wachstum', desc: 'Wir verschwinden nicht nach dem Launch. Monatliche Updates, Optimierungen und Strategiegespräche.' },
        { title: 'KI-Effizienz & Souveräne LLMs', desc: 'Private Wissensbasen, um Firmen-PDFs sicher zu durchsuchen. Automatisierte mehrsprachige Inhalte auf Deutsch, Französisch & Italienisch. KI-Workflows mit Schweizer Bankdatenschutz.' },
      ],
    },
    pricing: {
      title: 'Einfache, ehrliche Preise',
      subtitle: 'Keine versteckten Gebühren. Keine Überraschungen. Wählen Sie das Paket, das zu Ihrem Geschäft passt.',
      popular: 'Beliebteste',
      cta: 'Jetzt starten',
      addons: 'Optionale Add-ons → SEO (CHF 500/Mt.) · Ads Management (CHF 900/Mt.)',
      note: 'Nicht sicher, welches Paket passt? Buchen Sie ein kostenloses 15-Minuten-Gespräch.',
    },
    portfolio: {
      title: 'Unsere Arbeit',
      subtitle: 'Echte Projekte. Echte Ergebnisse. Sehen Sie, was wir für Unternehmen wie Ihres gebaut haben.',
      viewCase: 'Live ansehen',
      ctaText: 'Bereit für eine Website, die wirklich funktioniert?',
      ctaButton: 'Lassen Sie uns reden',
      projects: [
        {
          client: 'Venture Europe',
          title: 'Podcast-Plattform & Episoden-Hub',
          desc: 'Episoden, Gastprofile, Partnerlogos und direkte Links zu Spotify, Apple und YouTube.',
          result: 'Jede Episode mit einem Klick auf jeder Plattform',
          tags: ['#Media', '#Podcast', '#WebApp'],
          url: 'https://ventureeurope.lovable.app',
        },
        {
          client: 'Jabeerwocky',
          title: 'Craft-Beer-Pub Website',
          desc: 'Drei Sprachen, Altersprüfung, live Zapfliste und Menü, alles auf einer Seite.',
          result: 'Drei Sprachen, ein klarer Besuch',
          tags: ['#Gastronomie', '#Webdesign', '#Mehrsprachig'],
          url: 'https://jabeerwocky.com/en',
        },
        {
          client: 'Aviatic Films',
          title: 'Stock-Footage-Bibliothek',
          desc: 'Filtern nach Stadt, Ort und Tageszeit, Favoriten speichern, Lizenz anfragen.',
          result: 'Suchen, favorisieren und lizenzieren an einem Ort',
          tags: ['#ECommerce', '#Media', '#Lizenz'],
          url: 'https://stockfootage.aviaticfilms.ch',
        },
      ],
    },
    contact: {
      title: 'Kostenlose Beratung buchen',
      steps: ['Vollständiger Name', 'Unternehmen', 'Ihr Bedarf'],
      namePlaceholder: 'Ihr vollständiger Name',
      emailPlaceholder: 'ihre@email.com',
      phonePlaceholder: 'Telefonnummer (optional)',
      websitePlaceholder: 'Ihre Website-URL (optional)',
      businessPlaceholder: 'Ihr Firmenname',
      needsPlaceholder: 'Sagen Sie uns, was Sie brauchen — eine Website, einen Online-Shop, ein Compliance-Audit oder etwas anderes...',
      next: 'Weiter',
      back: 'Zurück',
      submit: 'Weiter zur Terminwahl',
      success: 'Wählen Sie einen passenden Termin',
      pickDate: 'Termin auswählen',
      loading: 'Kalender wird geladen...',
      noSlots: 'Kalender konnte nicht geladen werden. Bitte erneut versuchen.',
    },
    footer: {
      address: '',
      phone: '+41 44 000 00 00',
      impressum: 'Impressum',
      privacy: 'Datenschutzerklärung',
      rights: 'Alle Rechte vorbehalten.',
    },
  },
  fr: {
    nav: { proposal: 'Devis gratuit' },
    hero: {
      headline: 'Précision Suisse.\nPerformance Digitale.',
      sub: 'Nous créons des sites web et boutiques en ligne magnifiques pour les entreprises suisses — conçus pour impressionner, performer et convertir.',
      cta: 'Réserver une consultation gratuite',
      badge: 'Agence Digitale Klaar',
    },
    badges: {
      swissHosted: 'Hébergement 100 % suisse',
      nfadp: 'Conforme nLPD 2026',
      privacyFirst: 'Architecture Privacy-First',
      noUsCloud: 'Aucune fuite vers le cloud US',
    },
    advantage: {
      title: 'Pourquoi KLAAR ?',
      items: [
        { title: 'On parle votre langue', desc: 'Couramment en allemand, français et anglais. Pas de malentendus — juste une collaboration claire.' },
        { title: 'Standards suisses', desc: 'Rapide, sécurisé et entièrement conforme à la nLPD. Les données de vos clients sont en sécurité.' },
        { title: 'Prix justes, résultats premium', desc: 'Qualité premium sans les frais d\'agence excessifs. Des méthodes intelligentes pour plus de valeur.' },
      ],
    },
    sovereignty: {
      title: 'L\'Avantage Souveraineté',
      subtitle: 'Votre site web doit protéger votre entreprise — pas l\'exposer. Voici comment nous gardons vos données sous la loi suisse.',
      items: [
        { title: 'Résidence des données (Genève/Zurich)', text: 'Nous hébergeons exclusivement sur des serveurs suisses TIER II+. Vos données restent sous juridiction suisse, protégées du US Cloud Act et de la surveillance étrangère.' },
        { title: 'Protection contre les fuites IP', text: 'Nous éliminons les transferts de données silencieux. Pas de Google Fonts externes ni de CDN américains. Nous servons chaque ressource localement pour protéger les adresses IP de vos visiteurs.' },
        { title: 'Bouclier de responsabilité du CEO', text: 'La nLPD révisée engage la responsabilité personnelle des dirigeants. Nous construisons le \'Privacy by Design\' pour que vous puissiez vous concentrer sur la croissance, pas sur les risques juridiques.' },
        { title: 'IA Souveraine (L\'alternative à OpenAI)', text: 'La plupart des outils IA envoient vos secrets d\'entreprise vers des serveurs US pour l\'entraînement. Notre IA Souveraine fonctionne exclusivement sur l\'infrastructure suisse d\'Infomaniak. Vos données restent dans le bunker, restent votre propriété et ne sont jamais utilisées pour entraîner des modèles tiers.' },
      ],
    },
    compliance: {
      badge: 'Vérification de conformité gratuite',
      title: 'Votre site web est-il conforme à la loi ?',
      subtitle: 'Entrez l\'URL de votre site et nous le scannerons pour détecter les problèmes de protection des données suisses — fuites de polices, scripts de suivi US, localisation de l\'hébergement et plus. Gratuit, résultats instantanés.',
      placeholder: 'votresite.ch',
      cta: 'Lancer l\'audit gratuit',
      footnote: 'Vérifie la localisation de l\'hébergement, Google Fonts, scripts de suivi & Impressum — basé sur les exigences nLPD.',
    },
    services: {
      title: 'Nos Services',
      items: [
        { title: 'Boutique en ligne — Prête à vendre', desc: 'Une boutique complète avec TWINT et Stripe — prête à prendre des commandes dès le premier jour.' },
        { title: 'Sites qui convertissent', desc: 'Des sites rapides et beaux qui transforment les visiteurs en clients. Conçus avec soin, livrés à temps.' },
        { title: 'Support & Croissance', desc: 'On ne disparaît pas après le lancement. Mises à jour mensuelles, optimisations et appels stratégiques.' },
        { title: 'Efficacité IA & LLMs Souverains', desc: 'Bases de connaissances privées pour interroger vos PDFs en toute sécurité. Contenu multilingue automatisé en allemand, français & italien. Workflows IA avec confidentialité bancaire suisse.' },
      ],
    },
    pricing: {
      title: 'Prix simples et honnêtes',
      subtitle: 'Pas de frais cachés. Pas de surprises. Choisissez le forfait qui correspond à votre entreprise.',
      popular: 'Le Plus Populaire',
      cta: 'Commencer',
      addons: 'Add-ons optionnels → SEO (CHF 500/mois) · Gestion Ads (CHF 900/mois)',
      note: 'Pas sûr du forfait idéal ? Réservez un appel gratuit de 15 minutes.',
    },
    portfolio: {
      title: 'Nos Réalisations',
      subtitle: 'De vrais projets. De vrais résultats. Découvrez ce que nous avons construit.',
      viewCase: 'Voir le site',
      ctaText: 'Prêt pour un site qui fonctionne vraiment ?',
      ctaButton: 'Discutons-en',
      projects: [
        {
          client: 'Venture Europe',
          title: 'Plateforme podcast & hub épisodes',
          desc: 'Épisodes, profils d\'invités, logos de partenaires et liens vers Spotify, Apple et YouTube.',
          result: 'Chaque épisode à un clic de toute plateforme',
          tags: ['#Média', '#Podcast', '#WebApp'],
          url: 'https://ventureeurope.lovable.app',
        },
        {
          client: 'Jabeerwocky',
          title: 'Site de pub craft beer',
          desc: 'Trois langues, vérification d\'âge, fûts en direct et menu, tout sur une page.',
          result: 'Trois langues, une visite claire',
          tags: ['#Restauration', '#WebDesign', '#Multilingue'],
          url: 'https://jabeerwocky.com/en',
        },
        {
          client: 'Aviatic Films',
          title: 'Bibliothèque de stock footage',
          desc: 'Filtrer par ville, lieu et moment de la journée, favoris, demande de licence.',
          result: 'Chercher, favoriser et licencier au même endroit',
          tags: ['#ECommerce', '#Média', '#Licence'],
          url: 'https://stockfootage.aviaticfilms.ch',
        },
      ],
    },
    contact: {
      title: 'Réservez une consultation gratuite',
      steps: ['Nom complet', 'Entreprise', 'Vos besoins'],
      namePlaceholder: 'Votre nom complet',
      emailPlaceholder: 'votre@email.com',
      phonePlaceholder: 'Numéro de téléphone (optionnel)',
      websitePlaceholder: 'URL de votre site web (optionnel)',
      businessPlaceholder: 'Le nom de votre entreprise',
      needsPlaceholder: 'Dites-nous ce dont vous avez besoin — un site web, une boutique en ligne, un audit de conformité ou autre...',
      next: 'Suivant',
      back: 'Retour',
      submit: 'Continuer vers le choix du créneau',
      success: 'Choisissez un créneau qui vous convient',
      pickDate: 'Choisir un créneau',
      loading: 'Chargement du calendrier...',
      noSlots: 'Impossible de charger le calendrier. Veuillez réessayer.',
    },
    footer: {
      address: '',
      phone: '+41 44 000 00 00',
      impressum: 'Mentions légales',
      privacy: 'Politique de confidentialité',
      rights: 'Tous droits réservés.',
    },
  },
} as const;

type SovereigntyItem = { title: string; text: string };

type Project = {
  client: string;
  title: string;
  desc: string;
  result: string;
  tags: string[];
  url: string;
};

type TranslationMap = {
  nav: { proposal: string };
  hero: { headline: string; sub: string; cta: string; badge: string };
  badges: { swissHosted: string; nfadp: string; privacyFirst: string; noUsCloud: string };
  advantage: { title: string; items: { title: string; desc: string }[] };
  sovereignty: { title: string; subtitle: string; items: SovereigntyItem[] };
  compliance: { badge: string; title: string; subtitle: string; placeholder: string; cta: string; footnote: string };
  services: { title: string; items: { title: string; desc: string }[] };
  pricing: {
    title: string;
    subtitle: string;
    popular: string;
    cta: string;
    addons: string;
    note: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
    viewCase: string;
    ctaText: string;
    ctaButton: string;
    projects: Project[];
  };
  contact: { title: string; steps: string[]; namePlaceholder: string; emailPlaceholder: string; phonePlaceholder: string; websitePlaceholder: string; businessPlaceholder: string; needsPlaceholder: string; next: string; back: string; submit: string; success: string; pickDate: string; loading: string; noSlots: string };
  footer: { address: string; phone: string; impressum: string; privacy: string; rights: string };
};
export type Translations = TranslationMap;
export const getTranslations = (lang: Lang): Translations => translations[lang] as unknown as Translations;
