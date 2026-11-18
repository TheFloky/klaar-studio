import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Server, DatabaseBackup, FileEdit, HeadsetIcon, Wrench, Receipt } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SEO from '@/components/SEO';
import type { Lang } from '@/lib/i18n';
import { chf, CARE_MONTHLY, CARE_HOURLY } from '@/lib/pricing';

const icons = [Server, DatabaseBackup, FileEdit, Wrench, HeadsetIcon, Receipt];

const content: Record<Lang, { title: string; seo: string; intro: string; price: string; items: { title: string; desc: string }[]; q: string; cta: string }> = {
  de: {
    title: 'Hosting & Care',
    seo: `Hosting & Care für Ihre Website: Schweizer Hosting, Backups, Wartung und 2 Std. Support pro Monat für ${chf(CARE_MONTHLY)}/Mt.`,
    intro: 'Ein einziger Betreuungsplan. Im Abo inklusive, bei Einmalkauf optional. Sie können auch eigenes Hosting nutzen, die Anforderungen klären wir vor dem Launch.',
    price: `${chf(CARE_MONTHLY)} pro Monat`,
    items: [
      { title: 'Schweizer Standard-Hosting', desc: 'Ihre Website läuft auf Standard-Hosting in der Schweiz.' },
      { title: 'Backups', desc: 'Regelmässige Sicherungen Ihrer Website.' },
      { title: '2 Std. Änderungen oder Support pro Monat', desc: 'Für Inhaltsänderungen oder Support. Nicht genutzte Stunden verfallen.' },
      { title: 'Routinemässige technische Wartung', desc: `Laufende technische Pflege. Zusatzaufwand ${chf(CARE_HOURLY)}/Std., vor Beginn freigegeben. Neue Funktionen werden separat offeriert.` },
      { title: 'Antwort innert zwei Arbeitstagen', desc: 'Ein Reaktionsziel, keine garantierte Lösungszeit.' },
      { title: 'Separat offeriert', desc: 'Kostenpflichtige Drittanbieter-Abos und Hosting über die vereinbarten Standardanforderungen hinaus.' },
    ],
    q: 'Fragen?', cta: 'Kontakt aufnehmen',
  },
  fr: {
    title: 'Hébergement & Suivi',
    seo: `Hébergement & Suivi pour votre site : hébergement en Suisse, sauvegardes, maintenance et 2 h de support par mois pour ${chf(CARE_MONTHLY)}/mois.`,
    intro: 'Une seule formule de suivi. Incluse dans l\'abonnement, en option pour un achat unique. Vous pouvez aussi utiliser votre propre hébergement, exigences convenues avant la mise en ligne.',
    price: `${chf(CARE_MONTHLY)} par mois`,
    items: [
      { title: 'Hébergement standard en Suisse', desc: 'Votre site est hébergé sur une infrastructure standard en Suisse.' },
      { title: 'Sauvegardes', desc: 'Sauvegardes régulières de votre site.' },
      { title: '2 h de modifications ou de support par mois', desc: 'Pour des modifications de contenu ou du support. Les heures non utilisées ne sont pas reportées.' },
      { title: 'Maintenance technique courante', desc: `Entretien technique continu. Travail supplémentaire ${chf(CARE_HOURLY)}/h, validé avant de commencer. Nouvelles fonctions sur devis.` },
      { title: 'Réponse sous deux jours ouvrables', desc: 'Un objectif de réponse, pas un délai de résolution garanti.' },
      { title: 'Sur devis', desc: 'Abonnements tiers payants et hébergement au-delà des exigences standard convenues.' },
    ],
    q: 'Des questions ?', cta: 'Nous contacter',
  },
  en: {
    title: 'Hosting & Care',
    seo: `Hosting & Care for your website: Swiss hosting, backups, maintenance and 2 hours of support monthly for ${chf(CARE_MONTHLY)}/month.`,
    intro: 'One care plan. Included in the subscription, optional for one-time purchases. You can also arrange your own hosting, with requirements agreed before launch.',
    price: `${chf(CARE_MONTHLY)} per month`,
    items: [
      { title: 'Standard Swiss hosting', desc: 'Your website runs on standard hosting in Switzerland.' },
      { title: 'Backups', desc: 'Regular backups of your website.' },
      { title: 'Two hours of changes or support each month', desc: 'For content changes or support. Unused hours do not roll over.' },
      { title: 'Routine technical maintenance', desc: `Ongoing technical upkeep. Additional work ${chf(CARE_HOURLY)}/hour, approved before starting. New features quoted separately.` },
      { title: 'Response within two business days', desc: 'A response target, not a guaranteed resolution time.' },
      { title: 'Quoted separately', desc: 'Paid third-party subscriptions and hosting beyond the agreed standard requirements.' },
    ],
    q: 'Have questions?', cta: 'Get in touch',
  },
};

export default function Maintenance() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const safeLang = (['de', 'fr', 'en'].includes(lang ?? '') ? lang : 'de') as Lang;
  const backPath = `/${safeLang}`;
  const savedScrollY = (location.state as { scrollY?: number })?.scrollY;
  const c = content[safeLang];

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(backPath, { replace: true });
    if (savedScrollY !== undefined) setTimeout(() => window.scrollTo(0, savedScrollY), 50);
  };
  void handleBack;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={`${c.title} — klaar Studio`} description={c.seo} lang={safeLang} path={`${safeLang}/maintenance`} />
      <PageHeader title={c.title} backTo={backPath} />
      <div className="container max-w-3xl py-12 sm:py-16 px-4">
        <p className="text-3xl font-extrabold mb-4">{c.price}</p>
        <p className="text-muted-foreground mb-12 max-w-xl">{c.intro}</p>
        <div className="space-y-8">
          {c.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {c.q}{' '}
            <Link to={`${backPath}#contact`} className="text-primary hover:underline">{c.cta}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
