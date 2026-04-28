import { Lang } from '@/lib/i18n';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import julianPhoto from '@/assets/julian-vidal.jpg';

interface AboutFounderProps {
  lang: Lang;
}

const COPY: Record<Lang, { eyebrow: string; name: string; role: string; body: string; signature: string }> = {
  de: {
    eyebrow: 'Über uns',
    name: 'Julian Vidal',
    role: 'Gründer, klaar Studio',
    body: 'Hinter klaar Studio steht ein kleines, eingespieltes Team — kein Konzern, keine Zwischenhändler. Sie sprechen direkt mit der Person, die Ihr Projekt verantwortet. Wir arbeiten in Deutsch, Französisch und Englisch, halten uns kompromisslos an Schweizer Datenschutzstandards und liefern, was wir versprechen — termingerecht und transparent.',
    signature: 'Persönlich. Diskret. Verbindlich.',
  },
  fr: {
    eyebrow: 'À propos',
    name: 'Julian Vidal',
    role: 'Fondateur, klaar Studio',
    body: 'Derrière klaar Studio se trouve une petite équipe soudée — pas de grand groupe, pas d\'intermédiaires. Vous échangez directement avec la personne qui pilote votre projet. Nous travaillons en allemand, français et anglais, respectons sans compromis les standards suisses de protection des données et tenons nos engagements — dans les délais, en toute transparence.',
    signature: 'Personnel. Discret. Engagé.',
  },
  en: {
    eyebrow: 'About',
    name: 'Julian Vidal',
    role: 'Founder, klaar Studio',
    body: 'Behind klaar Studio is a small, tight-knit team — no corporation, no middlemen. You speak directly with the person responsible for your project. We work in German, French, and English, adhere uncompromisingly to Swiss data protection standards, and deliver what we promise — on time and transparently.',
    signature: 'Personal. Discreet. Accountable.',
  },
};

export default function AboutFounder({ lang }: AboutFounderProps) {
  const { ref, isVisible } = useScrollReveal();
  const c = COPY[lang];

  return (
    <section ref={ref} className="relative z-10 py-24 sm:py-32 px-6">
      <div
        className={`max-w-5xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="glass-panel rounded-2xl p-8 sm:p-12 md:p-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            {/* Photo */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-2xl" />
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full overflow-hidden ring-1 ring-border shadow-xl">
                <img
                  src={julianPhoto}
                  alt={`${c.name}, ${c.role}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                {c.eyebrow}
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
                {c.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{c.role}</p>
              <p className="text-base sm:text-lg leading-relaxed text-foreground/85 mb-6">
                {c.body}
              </p>
              <p className="text-sm font-medium text-primary tracking-wide">
                {c.signature}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
