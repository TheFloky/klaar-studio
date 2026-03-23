import { useState } from 'react';
import { Lang, getTranslations } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Advantages from '@/components/Advantages';
import Services from '@/components/Services';
import TrustBar from '@/components/TrustBar';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

export default function Index() {
  const [lang, setLang] = useState<Lang>('en');
  const t = getTranslations(lang);

  return (
    <div className="min-h-screen bg-background">
      <Navbar lang={lang} setLang={setLang} ctaText={t.nav.proposal} />
      <Hero t={t} />
      <Advantages t={t} />
      <Services t={t} />
      <TrustBar />
      <ContactForm t={t} />
      <Footer t={t} />
    </div>
  );
}
