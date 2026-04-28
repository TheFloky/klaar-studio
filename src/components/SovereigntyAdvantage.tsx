import { Database, Globe, ShieldAlert, Brain } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { Translations } from '@/lib/i18n';

const icons = [Database, Globe, ShieldAlert, Brain];

export default function SovereigntyAdvantage({ t }: { t: Translations }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 sm:py-20" aria-label={t.sovereignty.title}>
      <div className="container">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">
          {t.sovereignty.title}
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
          {t.sovereignty.subtitle}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.sovereignty.items.map((col, i) => {
            const Icon = icons[i];
            return (
              <div
                key={col.title}
                className={`glass-card rounded-2xl p-8 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{col.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{col.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
