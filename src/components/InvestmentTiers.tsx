import { useState } from 'react';
import { Check, Star, ShoppingBag, Crown, Globe, Zap, Brain, HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Translations } from '@/lib/i18n';

type SubscriptionTier = {
  name: string;
  setup: string;
  monthly: string;
  features: string[];
  description?: string;
  note?: string;
};

const subscriptionTiers: Record<string, SubscriptionTier[]> = {
  en: [
    {
      name: 'Starter Website',
      setup: 'CHF 299',
      monthly: 'CHF 189/mo',
      description: 'Your expert-designed one-page presence — no upfront investment needed. Maintenance included.',
      features: [
        'One-Page Expert Design (homepage + Impressum & Privacy Policy)',
        'Fully custom-designed (no templates)',
        'Perfect on phones & tablets',
        'Legally compliant (nDSG)',
        'Maintenance & Support included',
      ],
      note: '24-month commitment · First month free with setup',
    },
    {
      name: 'Business Website',
      setup: 'CHF 499',
      monthly: 'CHF 325/mo',
      description: 'A professional multi-page site with SEO basics for digital visibility. Maintenance included.',
      features: [
        'Everything in Starter',
        'Admin dashboard to manage content',
        'SEO basics for digital visibility',
        'Available in multiple languages',
        'Swiss server hosting included',
        'Maintenance & Support included',
      ],
      note: '24-month commitment · First month free with setup',
    },
    {
      name: 'Online Shop',
      setup: 'CHF 799',
      monthly: 'CHF 420/mo',
      description: 'A complete e-commerce system ready to sell — all-inclusive. Maintenance included.',
      features: [
        'Everything in Business',
        'Full Shopify or WooCommerce store',
        'All Swiss payment methods included',
        'Product catalog & stock management',
        'Maintenance & Support included',
      ],
      note: '24-month commitment · First month free with setup',
    },
    {
      name: 'klaar Elite',
      setup: 'CHF 999',
      monthly: 'CHF 739/mo',
      description: 'Automation, AI tools & a high-performance presence — buy back your time. Maintenance included.',
      features: [
        'Everything in Online Shop',
        'Custom AI tools to automate your work',
        'Advanced integrations & smart features',
        'In-depth SEO & performance audit',
        'Maintenance & Support included',
      ],
      note: '24-month commitment · First month free with setup',
    },
  ],
  de: [
    {
      name: 'Starter Website',
      setup: 'CHF 299',
      monthly: 'CHF 189/Mt.',
      description: 'Ihre professionell gestaltete One-Page-Präsenz — ohne grosse Vorabinvestition. Wartung inklusive.',
      features: [
        'One-Page-Expertdesign (Startseite + Impressum & Datenschutz)',
        'Vollständig individuell gestaltet (keine Templates)',
        'Perfekt auf Handy & Tablet',
        'Rechtskonform (nDSG)',
        'Wartung & Support inklusive',
      ],
      note: '24 Monate Laufzeit · Erster Monat gratis bei Einrichtung',
    },
    {
      name: 'Business Website',
      setup: 'CHF 499',
      monthly: 'CHF 325/Mt.',
      description: 'Eine professionelle Mehrseiten-Website mit SEO-Grundlagen für mehr digitale Sichtbarkeit. Wartung inklusive.',
      features: [
        'Alles aus Starter',
        'Admin-Bereich zur Verwaltung',
        'SEO-Grundlagen für digitale Sichtbarkeit',
        'Mehrsprachig verfügbar',
        'Schweizer Server-Hosting inklusive',
        'Wartung & Support inklusive',
      ],
      note: '24 Monate Laufzeit · Erster Monat gratis bei Einrichtung',
    },
    {
      name: 'Online-Shop',
      setup: 'CHF 799',
      monthly: 'CHF 420/Mt.',
      description: 'Ein komplettes E-Commerce-System, verkaufsbereit — alles inklusive. Wartung inklusive.',
      features: [
        'Alles aus Business',
        'Kompletter Shopify / WooCommerce Shop',
        'Alle Schweizer Zahlungsmethoden',
        'Produktkatalog & Lagerverwaltung',
        'Wartung & Support inklusive',
      ],
      note: '24 Monate Laufzeit · Erster Monat gratis bei Einrichtung',
    },
    {
      name: 'klaar Elite',
      setup: 'CHF 999',
      monthly: 'CHF 739/Mt.',
      description: 'Automatisierung, KI-Tools & eine leistungsstarke Präsenz — kaufen Sie sich Ihre Zeit zurück. Wartung inklusive.',
      features: [
        'Alles aus Online-Shop',
        'Individuelle KI-Tools zur Automatisierung Ihrer Arbeit',
        'Erweiterte Integrationen & smarte Features',
        'Umfassendes SEO & Performance-Audit',
        'Wartung & Support inklusive',
      ],
      note: '24 Monate Laufzeit · Erster Monat gratis bei Einrichtung',
    },
  ],
  fr: [
    {
      name: 'Site Starter',
      setup: 'CHF 299',
      monthly: 'CHF 189/mois',
      description: 'Votre présence one-page conçue par des experts — sans investissement initial. Maintenance incluse.',
      features: [
        'Design expert one-page (accueil + Mentions & Protection des données)',
        'Design entièrement sur mesure (pas de templates)',
        'Parfait sur mobile & tablette',
        'Conforme juridiquement (nLPD)',
        'Maintenance & Support inclus',
      ],
      note: 'Engagement 24 mois · Premier mois offert avec l\'installation',
    },
    {
      name: 'Site Business',
      setup: 'CHF 499',
      monthly: 'CHF 325/mois',
      description: 'Un site professionnel multi-pages avec les bases SEO pour la visibilité digitale. Maintenance incluse.',
      features: [
        'Tout dans Starter',
        'Tableau de bord pour gérer le contenu',
        'Bases SEO pour la visibilité digitale',
        'Disponible en plusieurs langues',
        'Hébergement sur serveurs suisses inclus',
        'Maintenance & Support inclus',
      ],
      note: 'Engagement 24 mois · Premier mois offert avec l\'installation',
    },
    {
      name: 'Boutique en Ligne',
      setup: 'CHF 799',
      monthly: 'CHF 420/mois',
      description: 'Un système e-commerce complet prêt à vendre — tout inclus. Maintenance incluse.',
      features: [
        'Tout dans Business',
        'Boutique Shopify / WooCommerce complète',
        'Tous les moyens de paiement suisses',
        'Catalogue produits & gestion des stocks',
        'Maintenance & Support inclus',
      ],
      note: 'Engagement 24 mois · Premier mois offert avec l\'installation',
    },
    {
      name: 'klaar Elite',
      setup: 'CHF 999',
      monthly: 'CHF 739/mois',
      description: 'Automatisation, outils IA & présence haute performance — rachetez votre temps. Maintenance incluse.',
      features: [
        'Tout dans Boutique en Ligne',
        'Outils IA personnalisés pour automatiser votre travail',
        'Intégrations avancées & fonctionnalités intelligentes',
        'Audit SEO & performance approfondi',
        'Maintenance & Support inclus',
      ],
      note: 'Engagement 24 mois · Premier mois offert avec l\'installation',
    },
  ],
};

const aboTermsContent = {
  de: {
    title: 'Unsere Abo-Konditionen: Fair & Transparent',
    sections: [
      {
        heading: 'Mindestlaufzeit & Verlängerung',
        content: 'Um Ihnen erstklassige Qualität ohne hohe Initialkosten bieten zu können, beträgt die Mindestvertragslaufzeit 24 Monate. Nach Ablauf dieser Zeit verlängert sich das Abo automatisch um jeweils 12 Monate, sofern es nicht mit einer Frist von 3 Monaten zum Ende der Laufzeit gekündigt wird.'
      },
      {
        heading: 'Vorzeitige Kündigung (Exit-Option)',
        content: 'Wir verstehen, dass sich Geschäftspläne ändern können. Bei einer vorzeitigen Kündigung vor Ablauf der 24 Monate wird eine einmalige Ablösesumme in Höhe von 60% der verbleibenden Monatsbeiträge fällig. Damit sind alle Ansprüche abgegolten und Sie sind sofort aus dem Vertrag entlassen.'
      },
      {
        heading: 'Eigentum & Übergabe',
        content: `Während der Abolaufzeit erhalten Sie eine exklusive Nutzungslizenz für das Design und die Funktionalität Ihrer Website.

Nach 24 Monaten: Die Website geht vollständig in Ihr Eigentum über. Sie können das Abo zu reduzierten Wartungskonditionen fortführen oder die Seite (als statischen Export) auf Ihr eigenes Hosting umziehen.

Bei vorzeitiger Kündigung: Nach Zahlung der Ablösesumme stellen wir Ihnen auf Wunsch die Daten (HTML/CSS/JS) zur Verfügung. Backend-Logiken und proprietäre AI-Integrationen bleiben Eigentum der Agentur.`
      },
      {
        heading: 'Leistungsumfang',
        content: 'In Ihrer monatlichen Rate sind das Schweizer Hosting, SSL-Zertifikate, regelmässige Sicherheits-Backups und die technische Anpassung an aktuelle nDSG-Vorschriften enthalten.'
      }
    ]
  }
};

const toggleLabels = {
  en: {
    einmalig: 'One-Time',
    abo: 'Subscription',
    einmaligDesc: 'Invest in ownership. One-time payment for your bespoke, turnkey project. Ideal for full control from day one, with no long-term contracts and minimal optional running costs.',
    aboDesc: 'Partnership without barriers. Your premium presence at a fixed monthly price. We handle technology, nDSG compliance and updates, while you protect your budget and benefit from ongoing support.',
  },
  de: {
    einmalig: 'Einmalig',
    abo: 'Abo',
    einmaligDesc: 'Investition in Eigentum. Einmalige Zahlung für Ihr massgeschneidertes, schlüsselfertiges Projekt. Ideal für volle Kontrolle ab Tag eins, ohne langfristige Vertragsbindung und mit minimalen optionalen laufenden Fixkosten.',
    aboDesc: 'Partnerschaft ohne Einstiegshürden. Ihre erstklassige Präsenz zum monatlichen Fixpreis. Wir übernehmen Technik, nDSG-Konformität und Updates, während Sie Ihr Budget schonen und von laufendem Support profitieren.',
  },
  fr: {
    einmalig: 'Unique',
    abo: 'Abonnement',
    einmaligDesc: 'Investissement en propriété. Paiement unique pour votre projet sur mesure, clé en main. Idéal pour un contrôle total dès le premier jour, sans engagement à long terme et avec des coûts fixes optionnels minimaux.',
    aboDesc: 'Partenariat sans obstacles. Votre présence premium à un prix mensuel fixe. Nous gérons la technologie, la conformité nLPD et les mises à jour, pendant que vous protégez votre budget et profitez d\'un support continu.',
  },
};

export default function InvestmentTiers({ t, onSelectTier }: { t: Translations; onSelectTier?: (tier: string) => void }) {
  const { ref, isVisible } = useScrollReveal();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || 'de') as 'en' | 'de' | 'fr';
  const [isAbo, setIsAbo] = useState(false);

  const labels = toggleLabels[currentLang] || toggleLabels.de;
  const aboTiers = subscriptionTiers[currentLang] || subscriptionTiers.de;

  return (
    <section ref={ref} id="pricing" className="py-24 sm:py-32" aria-label="Pricing packages">
      <div className="container">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">
          {t.pricing.title}
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          {t.pricing.subtitle}
        </p>

        {/* Toggle */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <span className={`text-sm font-semibold transition-colors ${!isAbo ? 'text-foreground' : 'text-muted-foreground'}`}>
              {labels.einmalig}
            </span>
            <Switch checked={isAbo} onCheckedChange={setIsAbo} />
            <span className={`text-sm font-semibold transition-colors ${isAbo ? 'text-foreground' : 'text-muted-foreground'}`}>
              {labels.abo}
            </span>
          </div>
          
          {/* Space for speech bubble - empty when einmalig, shows when abo */}
          <div className="h-8 flex items-center justify-center">
            {isAbo && (
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="relative group flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors cursor-pointer animate-pulse"
                    style={{ animationDuration: '2s' }}
                  >
                    <MessageCircle size={14} />
                    <span>Abo Terms & Conditions</span>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">{aboTermsContent.de.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    {aboTermsContent.de.sections.map((section, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-foreground">{section.heading}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={isAbo ? 'abo-desc' : 'einmalig-desc'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-muted-foreground max-w-lg text-center leading-relaxed"
            >
              {isAbo ? labels.aboDesc : labels.einmaligDesc}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isAbo ? 'abo-grid' : 'einmalig-grid'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
          {isAbo
            ? aboTiers.map((tier, i) => {
                const isPopular = i === 1;
                const isElite = i === 3;
                return (
                  <div
                    key={i}
                    className={`relative rounded-2xl p-8 transition-all duration-700 flex flex-col ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    } ${
                      isElite
                        ? 'border border-primary/30 bg-gradient-to-b from-card via-card to-primary/[0.04] shadow-[0_0_40px_-12px_hsl(var(--primary)/0.15)]'
                        : isPopular
                        ? 'border-2 border-primary bg-card shadow-lg scale-[1.02]'
                        : i === 2
                        ? 'border border-dashed border-primary/40 bg-card'
                        : 'border border-border bg-card'
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                        <Star size={12} className="mr-1" />
                        {t.pricing.popular}
                      </Badge>
                    )}
                    {isElite && (
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg" title="Swiss Sovereign AI Included">
                        <Brain size={18} className="text-primary-foreground" />
                      </div>
                    )}

                    {[Globe, Zap, ShoppingBag, Crown][i] && (() => {
                      const Icon = [Globe, Zap, ShoppingBag, Crown][i];
                      return <Icon size={20} className="text-primary mb-3" />;
                    })()}

                    <h3 className="text-lg font-bold text-foreground mb-2">{tier.name}</h3>
                    <div className="mb-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{tier.monthly}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {tier.setup} {currentLang === 'de' ? 'Einrichtungsgebühr' : currentLang === 'fr' ? 'frais d\'installation' : 'setup fee'}
                    </p>
                    {tier.description && (
                      <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                    )}

                    <div className="border-t border-border pt-6 mb-8 flex-1">
                      <ul className="space-y-3">
                        {tier.features.map((feature, fi) => (
                          <li key={fi} className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-primary mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {tier.note && (
                        <p className="text-xs text-muted-foreground mt-4 italic">{tier.note}</p>
                      )}
                    </div>

                    <Button
                      className={`w-full ${isElite ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                      variant={isPopular ? 'default' : isElite ? 'default' : 'outline'}
                      onClick={() => {
                        onSelectTier?.(tier.name);
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {t.pricing.cta}
                    </Button>
                  </div>
                );
              })
            : t.pricing.tiers.map((tier, i) => {
                const isPopular = i === 1;
                const isEcommerce = i === 2;
                const isElite = i === 3;
                return (
                  <div
                    key={i}
                    className={`relative rounded-2xl p-8 transition-all duration-700 flex flex-col ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    } ${
                      isElite
                        ? 'border border-primary/30 bg-gradient-to-b from-card via-card to-primary/[0.04] shadow-[0_0_40px_-12px_hsl(var(--primary)/0.15)]'
                        : isPopular
                        ? 'border-2 border-primary bg-card shadow-lg scale-[1.02]'
                        : isEcommerce
                        ? 'border border-dashed border-primary/40 bg-card'
                        : 'border border-border bg-card'
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                        <Star size={12} className="mr-1" />
                        {t.pricing.popular}
                      </Badge>
                    )}
                    {isElite && (
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg" title="Swiss Sovereign AI Included">
                        <Brain size={18} className="text-primary-foreground" />
                      </div>
                    )}

                    {[Globe, Zap, ShoppingBag, Crown][i] && (() => {
                      const Icon = [Globe, Zap, ShoppingBag, Crown][i];
                      return <Icon size={20} className="text-primary mb-3" />;
                    })()}

                    <h3 className="text-lg font-bold text-foreground mb-2">{tier.name}</h3>
                    <div className="mb-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{tier.price}</span>
                    </div>
                    <Link
                      to={`/${lang || 'en'}/maintenance`}
                      state={{ scrollY: window.scrollY }}
                      className="text-sm text-muted-foreground mb-6 inline-flex items-center gap-1 hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
                    >
                      {tier.monthly}
                      <HelpCircle size={14} className="opacity-60" />
                    </Link>
                    {tier.description && (
                      <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                    )}

                    <div className="border-t border-border pt-6 mb-8 flex-1">
                      <ul className="space-y-3">
                        {tier.features.map((feature, fi) => (
                          <li key={fi} className="flex items-start gap-3 text-sm">
                            <Check size={16} className="text-primary mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {tier.note && (
                        <p className="text-xs text-muted-foreground mt-4 italic">{tier.note}</p>
                      )}
                    </div>

                    <Button
                      className={`w-full ${isElite ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                      variant={isPopular ? 'default' : isElite ? 'default' : 'outline'}
                      onClick={() => {
                        onSelectTier?.(tier.name);
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {t.pricing.cta}
                    </Button>
                  </div>
                );
              })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto italic">
          {t.pricing.note}
        </p>
      </div>
    </section>
  );
}
