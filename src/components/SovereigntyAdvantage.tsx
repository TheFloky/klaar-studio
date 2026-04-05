import { Database, Globe, ShieldAlert } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const columns = [
  {
    icon: Database,
    title: 'Data Residency (Geneva/Zurich)',
    text: 'We host exclusively on TIER III+ Swiss servers. Your business data stays under Swiss jurisdiction, shielded from the US Cloud Act and foreign surveillance.',
  },
  {
    icon: Globe,
    title: 'IP-Leak Protection',
    text: 'We eliminate silent data transfers. No external Google Fonts or US CDNs. We serve every asset locally to keep your visitors\' IP addresses private.',
  },
  {
    icon: ShieldAlert,
    title: 'CEO Liability Shield',
    text: 'The revised nFADP places personal liability on directors. We build \'Privacy by Design\' so you can focus on growth, not legal risks.',
  },
];

export default function SovereigntyAdvantage() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-24 sm:py-32" aria-label="The Sovereignty Advantage">
      <div className="container">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">
          The Sovereignty Advantage
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
          Your website should protect your business — not expose it. Here's how we keep your data under Swiss law.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((col, i) => {
            const Icon = col.icon;
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
