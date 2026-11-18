import { useState } from 'react';
import { Check, Star, Globe, Zap, Package, HelpCircle, MessageCircle, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Translations } from '@/lib/i18n';
import { packages, packageCopy, chf, ABO_SETUP, ABO_MONTHS, CARE_MONTHLY, CARE_HOURLY, type PriceLang } from '@/lib/pricing';

const icons = [Globe, Zap, Package];

const ui: Record<PriceLang, {
  einmalig: string; abo: string; einmaligDesc: string; aboDesc: string;
  oneTimeSuffix: string; perMonth: string; setup: (s: string) => string; forMonths: string;
  carePlus: string; careOptional: string; termsBtn: string;
  payoff: string; inclusionsTitle: string; inclusions: string[];
  careTitle: string; careDesc: string; careLink: string;
}> = {
  de: {
    einmalig: 'Einmalig', abo: 'Abo',
    einmaligDesc: 'Einmal bezahlen, Website besitzen. Hosting & Care ist optional.',
    aboDesc: 'Gleicher Website-Umfang, verteilt auf 24 Monatsraten. Hosting & Care inklusive.',
    oneTimeSuffix: 'einmalig', perMonth: '/Mt.', setup: (s) => `${s} Einrichtung`, forMonths: `während ${ABO_MONTHS} Monaten`,
    carePlus: 'Inkl. Hosting & Care mit 2 Std. Änderungen/Support pro Monat',
    careOptional: `Hosting & Care optional: ${chf(CARE_MONTHLY)}/Mt.`,
    termsBtn: 'Abo-Konditionen',
    payoff: `Nach 24 Monaten ist Ihre Website abbezahlt. Ihr Monatspreis sinkt automatisch auf ${chf(CARE_MONTHLY)} für Hosting & Care, monatlich kündbar.`,
    inclusionsTitle: 'In allen Paketen',
    inclusions: ['Eine Sprache inklusive', 'Zwei Korrekturrunden', 'Launch und kurze Übergabe inklusive', 'Sie liefern fertige Texte und Bilder', 'Weitere Sprachen, Texterstellung, zusätzliche Produkterfassung und individuelle Funktionen werden separat offeriert', 'Hosting und laufende Betreuung sind nicht im einmaligen Preis enthalten'],
    careTitle: `Hosting & Care, ${chf(CARE_MONTHLY)}/Mt.`,
    careDesc: `Schweizer Standard-Hosting, Backups, technische Wartung und 2 Std. Änderungen oder Support pro Monat. Zusatzaufwand ${chf(CARE_HOURLY)}/Std. nach Freigabe. Bei Einmalkauf optional: Sie können auch eigenes Hosting nutzen, die Anforderungen klären wir vor dem Launch.`,
    careLink: 'Details zu Hosting & Care',
  },
  fr: {
    einmalig: 'Unique', abo: 'Abonnement',
    einmaligDesc: 'Payez une fois, le site vous appartient. Hébergement & Suivi en option.',
    aboDesc: 'Même périmètre de site, réparti sur 24 mensualités. Hébergement & Suivi inclus.',
    oneTimeSuffix: 'paiement unique', perMonth: '/mois', setup: (s) => `${s} de mise en place`, forMonths: `pendant ${ABO_MONTHS} mois`,
    carePlus: 'Hébergement & Suivi inclus, avec 2 h de modifications/support par mois',
    careOptional: `Hébergement & Suivi en option : ${chf(CARE_MONTHLY)}/mois`,
    termsBtn: 'Conditions de l\'abonnement',
    payoff: `Après 24 mois, votre site est payé. Votre mensualité passe automatiquement à ${chf(CARE_MONTHLY)} pour l'Hébergement & Suivi, résiliable chaque mois.`,
    inclusionsTitle: 'Dans toutes les formules',
    inclusions: ['Une langue incluse', 'Deux tours de corrections', 'Mise en ligne et courte prise en main incluses', 'Vous fournissez les textes et images finalisés', 'Langues supplémentaires, rédaction, saisie de produits au-delà du forfait et fonctions sur mesure sur devis', 'L\'hébergement et le suivi ne sont pas compris dans le prix unique'],
    careTitle: `Hébergement & Suivi, ${chf(CARE_MONTHLY)}/mois`,
    careDesc: `Hébergement standard en Suisse, sauvegardes, maintenance technique et 2 h de modifications ou de support par mois. Travail supplémentaire ${chf(CARE_HOURLY)}/h, validé au préalable. En option pour un achat unique : vous pouvez aussi utiliser votre propre hébergement, exigences convenues avant la mise en ligne.`,
    careLink: 'Détails Hébergement & Suivi',
  },
  en: {
    einmalig: 'One-Time', abo: 'Subscription',
    einmaligDesc: 'Pay once and own your website. Hosting & Care is optional.',
    aboDesc: 'The same website scope, spread over 24 monthly payments. Hosting & Care included.',
    oneTimeSuffix: 'one-time', perMonth: '/mo', setup: (s) => `${s} setup`, forMonths: `for ${ABO_MONTHS} months`,
    carePlus: 'Includes Hosting & Care with 2 hours of changes/support monthly',
    careOptional: `Optional Hosting & Care: ${chf(CARE_MONTHLY)}/mo`,
    termsBtn: 'Subscription terms',
    payoff: `After 24 months, your website is paid off. Your monthly price automatically drops to ${chf(CARE_MONTHLY)} for Hosting & Care, cancellable monthly.`,
    inclusionsTitle: 'Included in every package',
    inclusions: ['One language included', 'Two revision rounds', 'Launch and a short handover included', 'You supply finished text and images', 'Additional languages, copywriting, product entry beyond the allowance and custom features are quoted separately', 'Hosting and ongoing care are separate from the one-time build price'],
    careTitle: `Hosting & Care, ${chf(CARE_MONTHLY)}/mo`,
    careDesc: `Standard Swiss hosting, backups, routine technical maintenance and 2 hours of content changes or support each month. Additional work ${chf(CARE_HOURLY)}/hour, approved before starting. Optional for one-time purchases: you can arrange your own hosting, with requirements agreed before launch.`,
    careLink: 'Hosting & Care details',
  },
};

const terms: Record<PriceLang, { title: string; sections: { heading: string; content: string }[] }> = {
  de: {
    title: 'Abo-Konditionen',
    sections: [
      { heading: 'Laufzeit', content: `Die Mindestlaufzeit beträgt 24 Monate (${chf(ABO_SETUP)} Einrichtung plus 24 Monatsraten). Es gibt keinen Gratismonat; alle 24 Raten sind geschuldet.` },
      { heading: 'Nach 24 Monaten', content: `Keine automatische Verlängerung um 12 Monate. Hosting & Care läuft monatlich zu ${chf(CARE_MONTHLY)}/Mt. weiter und kann jeweils vor der nächsten Abrechnungsperiode gekündigt werden.` },
      { heading: 'Vorzeitige Kündigung', content: 'Bei einer vorzeitigen Kündigung vor Ablauf der 24 Monate wird eine einmalige Ablösesumme in Höhe von 60% der verbleibenden Monatsbeiträge fällig.' },
      { heading: 'Eigentum & Übergabe', content: 'Nach Ablauf der Mindestlaufzeit gehören Ihnen die individuell erstellten Website-Leistungen, vorbehaltlich der Lizenzen von Drittanbietern. Eine Übergabe erhält die vereinbarte Funktionalität, inklusive bearbeitbarer Inhalte und Anfragesystem. Ein statischer Export gilt bei diesen Paketen nicht als vollständige Übergabe.' },
      { heading: 'Leistungsumfang', content: `Schweizer Standard-Hosting, Backups, technische Wartung und 2 Std. Änderungen oder Support pro Monat (nicht übertragbar). Zusatzaufwand ${chf(CARE_HOURLY)}/Std. nach Freigabe. Antwort innert zwei Arbeitstagen (Reaktionsziel, keine garantierte Lösungszeit). Neue Funktionen, kostenpflichtige Drittanbieter-Abos und Hosting über die vereinbarten Standardanforderungen hinaus werden separat offeriert.` },
    ],
  },
  fr: {
    title: 'Conditions de l\'abonnement',
    sections: [
      { heading: 'Durée', content: `La durée minimale est de 24 mois (${chf(ABO_SETUP)} de mise en place plus 24 mensualités). Aucun mois offert ; les 24 mensualités sont dues.` },
      { heading: 'Après 24 mois', content: `Pas de renouvellement automatique de 12 mois. L'Hébergement & Suivi continue mensuellement à ${chf(CARE_MONTHLY)}/mois et peut être résilié avant la période de facturation suivante.` },
      { heading: 'Résiliation anticipée', content: 'En cas de résiliation avant la fin des 24 mois, une indemnité unique de 60% des mensualités restantes est due.' },
      { heading: 'Propriété & transfert', content: 'Au terme de la durée minimale, les livrables sur mesure du site vous appartiennent, sous réserve des licences de tiers. Un transfert conserve les fonctionnalités convenues, y compris le contenu modifiable et le système de demandes. Un export statique ne constitue pas un transfert complet pour ces formules.' },
      { heading: 'Prestations', content: `Hébergement standard en Suisse, sauvegardes, maintenance technique et 2 h de modifications ou de support par mois (non reportables). Travail supplémentaire ${chf(CARE_HOURLY)}/h, validé au préalable. Réponse sous deux jours ouvrables (objectif de réponse, pas un délai de résolution garanti). Nouvelles fonctions, abonnements tiers payants et hébergement au-delà des exigences standard convenues sur devis.` },
    ],
  },
  en: {
    title: 'Subscription terms',
    sections: [
      { heading: 'Term', content: `The initial term is 24 months (${chf(ABO_SETUP)} setup plus 24 monthly payments). There is no free month; all 24 monthly payments apply.` },
      { heading: 'After 24 months', content: `No automatic 12-month renewal. Hosting & Care continues monthly at ${chf(CARE_MONTHLY)}/mo and can be cancelled before the next billing period.` },
      { heading: 'Early cancellation', content: 'If cancelled before the end of the 24 months, a one-off fee of 60% of the remaining monthly payments is due.' },
      { heading: 'Ownership & transfer', content: 'After completing the initial term, you own the custom website deliverables, subject to third-party licences. A transfer preserves the agreed functionality, including editable content and the enquiry system. A static export is not a complete handover for these packages.' },
      { heading: 'What\'s included', content: `Standard Swiss hosting, backups, routine technical maintenance and 2 hours of content changes or support each month (unused hours do not roll over). Additional work ${chf(CARE_HOURLY)}/hour, approved before starting. Response within two business days (a response target, not a guaranteed resolution time). New features, paid third-party subscriptions and hosting beyond the agreed standard requirements are quoted separately.` },
    ],
  },
};

export default function InvestmentTiers({ t, onSelectTier }: { t: Translations; onSelectTier?: (tier: string) => void }) {
  const { ref, isVisible } = useScrollReveal();
  const { lang } = useParams<{ lang: string }>();
  const L = (['de', 'fr', 'en'].includes(lang ?? '') ? lang : 'de') as PriceLang;
  const [isAbo, setIsAbo] = useState(false);
  const u = ui[L];
  const copy = packageCopy[L];

  return (
    <section ref={ref} id="pricing" className="py-16 sm:py-20" aria-label="Pricing packages">
      <div className="container">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">{t.pricing.title}</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">{t.pricing.subtitle}</p>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <span className={`text-sm font-semibold transition-colors ${!isAbo ? 'text-foreground' : 'text-muted-foreground'}`}>{u.einmalig}</span>
            <Switch checked={isAbo} onCheckedChange={setIsAbo} aria-label={`${u.einmalig} / ${u.abo}`} />
            <span className={`text-sm font-semibold transition-colors ${isAbo ? 'text-foreground' : 'text-muted-foreground'}`}>{u.abo}</span>
          </div>

          <div className="h-8 flex items-center justify-center">
            {isAbo && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                    <MessageCircle size={14} />
                    <span>{u.termsBtn}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">{terms[L].title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    {terms[L].sections.map((s, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-foreground">{s.heading}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{s.content}</p>
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
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-muted-foreground max-w-lg text-center leading-relaxed"
            >
              {isAbo ? u.aboDesc : u.einmaligDesc}
            </motion.p>
          </AnimatePresence>
        </div>

        {isAbo && (
          <p className="max-w-2xl mx-auto mb-8 text-center text-sm font-medium text-foreground border border-primary/30 bg-primary/5 rounded-xl px-5 py-3">
            {u.payoff}
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={isAbo ? 'abo-grid' : 'einmalig-grid'}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {packages.map((p, i) => {
              const c = copy[p.id];
              const isPopular = p.id === 'business';
              const Icon = icons[i];
              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl p-8 transition-all duration-700 flex flex-col ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${isPopular ? 'border-2 border-primary bg-card shadow-lg md:scale-[1.02]' : 'border border-border bg-card'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                      <Star size={12} className="mr-1" />{t.pricing.popular}
                    </Badge>
                  )}
                  <Icon size={20} className="text-primary mb-3" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{c.name}</h3>

                  {isAbo ? (
                    <>
                      <div className="mb-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{chf(p.aboMonthly)}</span>
                        <span className="text-sm text-muted-foreground">{u.perMonth}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{u.forMonths} · {u.setup(chf(ABO_SETUP))}</p>
                    </>
                  ) : (
                    <>
                      <div className="mb-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{chf(p.oneTime)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{u.oneTimeSuffix}</p>
                      <Link
                        to={`/${L}/maintenance`}
                        state={{ scrollY: window.scrollY }}
                        className="text-xs text-muted-foreground mb-4 inline-flex items-center gap-1 hover:text-primary transition-colors underline decoration-dotted underline-offset-4 w-fit"
                      >
                        {u.careOptional}<HelpCircle size={12} className="opacity-60" />
                      </Link>
                    </>
                  )}

                  <p className="text-sm text-muted-foreground mb-6">{c.description}</p>

                  <div className="border-t border-border pt-6 mb-8 flex-1">
                    <ul className="space-y-3">
                      {c.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-3 text-sm">
                          <Check size={16} className="text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                      {isAbo && (
                        <li className="flex items-start gap-3 text-sm">
                          <Server size={16} className="text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{u.carePlus}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => {
                      onSelectTier?.(`${c.name} (${isAbo ? u.abo : u.einmalig})`);
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {t.pricing.cta}
                  </Button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-10">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-bold text-foreground mb-3">{u.inclusionsTitle}</h3>
            <ul className="space-y-2">
              {u.inclusions.map((x, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="text-primary mt-1 shrink-0" />{x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Server size={16} className="text-primary" />{u.careTitle}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{u.careDesc}</p>
            <Link to={`/${L}/maintenance`} state={{ scrollY: window.scrollY }} className="text-sm text-primary hover:underline mt-4 w-fit">
              {u.careLink} →
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto italic">{t.pricing.note}</p>
      </div>
    </section>
  );
}
