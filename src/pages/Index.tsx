import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lang, getTranslations } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Advantages from '@/components/Advantages';
import Services from '@/components/Services';
import InvestmentTiers from '@/components/InvestmentTiers';
import FeaturedProjects from '@/components/FeaturedProjects';
import TrustBar from '@/components/TrustBar';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

const validLangs: Lang[] = ['en', 'de', 'fr'];

export default function Index() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  
  const lang: Lang = validLangs.includes(langParam as Lang) ? (langParam as Lang) : 'en';
  const t = getTranslations(lang);

  const setLang = (newLang: Lang) => {
    navigate(`/${newLang}`);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Blueprint grid — visible in both light & dark */}
      <div className="fixed inset-0 pointer-events-none z-0 blueprint-grid" />
      <Navbar lang={lang} setLang={setLang} ctaText={t.nav.proposal} />
      <Hero t={t} />
      <Advantages t={t} />
      <Services t={t} />
      <InvestmentTiers t={t} />
      <FeaturedProjects t={t} />
      <TrustBar />
      <ContactForm t={t} />
      <Footer t={t} />
    </div>
  );
}
