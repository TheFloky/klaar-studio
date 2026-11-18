export type PriceLang = 'de' | 'fr' | 'en';

export const ABO_SETUP = 300;
export const ABO_MONTHS = 24;
export const CARE_MONTHLY = 119;
export const CARE_HOURLY = 50;

export type PackageId = 'starter' | 'business' | 'catalogue';

export const packages: { id: PackageId; oneTime: number; aboMonthly: number }[] = [
  { id: 'starter', oneTime: 1200, aboMonthly: 159 },
  { id: 'business', oneTime: 2200, aboMonthly: 199 },
  { id: 'catalogue', oneTime: 2800, aboMonthly: 225 },
];

export const aboTotal = (monthly: number) => ABO_SETUP + monthly * ABO_MONTHS;

/** Swiss formatting: CHF 1'200 */
export const chf = (n: number) => `CHF ${n.toLocaleString('de-CH').replace(/[’\u2019]/g, "'")}`;

type PackageCopy = { name: string; description: string; features: string[] };

export const packageCopy: Record<PriceLang, Record<PackageId, PackageCopy>> = {
  de: {
    starter: {
      name: 'Starter',
      description: 'Eine klare, individuell gestaltete Präsenz auf einer Seite.',
      features: ['Individuell gestaltete One-Page-Website', 'Kontaktformular', 'Optimiert für Handy & Tablet', 'SEO-Grundlagen'],
    },
    business: {
      name: 'Business',
      description: 'Eine professionelle Website, deren Inhalte Sie selbst pflegen.',
      features: ['Individuelle Website mit bis zu 5 Seiten', 'Admin-Bereich zur Bearbeitung der Inhalte', 'Kontaktformular', 'Optimiert für Handy & Tablet', 'SEO-Grundlagen'],
    },
    catalogue: {
      name: 'Produktkatalog',
      description: 'Ihre Produkte online präsentieren und Anfragen gesammelt erhalten.',
      features: ['Alles aus Business', 'Produktkategorien & Produktdetailseiten', 'Ersterfassung von bis zu 20 Produkten', 'Anfrage-Warenkorb: Besucher wählen Produkte und Mengen und senden Kontaktdaten samt Auswahl an Sie', 'Kein Online-Checkout, keine Zahlungsabwicklung'],
    },
  },
  fr: {
    starter: {
      name: 'Starter',
      description: 'Une présence claire et sur mesure, sur une seule page.',
      features: ['Site one-page conçu sur mesure', 'Formulaire de contact', 'Optimisé pour mobile & tablette', 'Bases SEO'],
    },
    business: {
      name: 'Business',
      description: 'Un site professionnel dont vous gérez vous-même le contenu.',
      features: ['Site sur mesure jusqu\'à 5 pages', 'Espace admin pour modifier le contenu', 'Formulaire de contact', 'Optimisé pour mobile & tablette', 'Bases SEO'],
    },
    catalogue: {
      name: 'Catalogue produits',
      description: 'Présentez vos produits en ligne et recevez des demandes groupées.',
      features: ['Tout dans Business', 'Catégories et pages détaillées de produits', 'Saisie initiale de jusqu\'à 20 produits', 'Panier de demande : les visiteurs choisissent produits et quantités, puis vous envoient leurs coordonnées avec leur sélection', 'Pas de paiement en ligne ni de traitement des paiements'],
    },
  },
  en: {
    starter: {
      name: 'Starter',
      description: 'A clear, custom-designed presence on a single page.',
      features: ['Custom one-page website', 'Contact form', 'Mobile and tablet optimisation', 'Basic SEO'],
    },
    business: {
      name: 'Business',
      description: 'A professional website whose content you can edit yourself.',
      features: ['Custom website with up to 5 pages', 'Admin area for editing content', 'Contact form', 'Mobile and tablet optimisation', 'Basic SEO'],
    },
    catalogue: {
      name: 'Product Catalogue',
      description: 'Show your products online and receive enquiries in one place.',
      features: ['Everything in Business', 'Product categories and product detail pages', 'Initial entry of up to 20 products', 'Enquiry cart: visitors select products and quantities, then send their contact details and selected items to you', 'No online checkout or payment processing'],
    },
  },
};
