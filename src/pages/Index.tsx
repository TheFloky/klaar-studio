import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lang, getTranslations } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ComplianceBadgeStrip from '@/components/ComplianceBadgeStrip';
import Advantages from '@/components/Advantages';
import SovereigntyAdvantage from '@/components/SovereigntyAdvantage';
import Services from '@/components/Services';
import InvestmentTiers from '@/components/InvestmentTiers';
import FeaturedProjects from '@/components/FeaturedProjects';
import TrustBar from '@/components/TrustBar';
import ContactForm from '@/components/ContactForm';
import AboutFounder from '@/components/AboutFounder';
import Footer from '@/components/Footer';
import ComplianceChecker from '@/components/ComplianceChecker';
import SEO from '@/components/SEO';

const SEO_META: Record<Lang, { title: string; description: string }> = {
  de: {
    title: 'klaar Studio — Schweizer Webdesign, Online-Shops & KI-Tools',
    description: 'Wir gestalten schnelle, schöne Websites und Online-Shops für Schweizer KMU. TWINT, Shopify, nDSG-konform, Hosting in der Schweiz. Ab CHF 2\'500.',
  },
  fr: {
    title: 'klaar Studio — Sites web suisses, boutiques en ligne & IA',
    description: 'Nous créons des sites web et boutiques en ligne rapides et élégants pour les PME suisses. TWINT, Shopify, conformité nFADP, hébergement en Suisse. Dès CHF 2\'500.',
  },
  en: {
    title: 'klaar Studio — Swiss Web Design, Online Shops & AI Tools',
    description: 'We design fast, beautiful websites and online shops for Swiss businesses. TWINT, Shopify, nFADP compliant, Swiss hosting. Starting at CHF 2,500.',
  },
};

const validLangs: Lang[] = ['en', 'de', 'fr'];

export default function Index() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  
  const lang: Lang = validLangs.includes(langParam as Lang) ? (langParam as Lang) : 'de';
  const t = getTranslations(lang);

  const setLang = (newLang: Lang) => {
    navigate(`/${newLang}`);
  };

  const meta = SEO_META[lang];

  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title={meta.title}
        description={meta.description}
        lang={lang}
        path={lang}
        alternates={{ de: 'de', fr: 'fr', en: 'en' }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 blueprint-grid" />
      <Navbar lang={lang} setLang={setLang} ctaText={t.nav.proposal} />
      <Hero t={t} />
      <ComplianceBadgeStrip t={t} />
      <Advantages t={t} />
      <SovereigntyAdvantage t={t} />
      <Services t={t} />
      <ComplianceChecker t={t} />
      <InvestmentTiers t={t} onSelectTier={setSelectedTier} />
      
      <TrustBar />
      <AboutFounder lang={lang} />
      <ContactForm t={t} selectedTier={selectedTier} />
      <Footer t={t} />
    </div>
  );
}
