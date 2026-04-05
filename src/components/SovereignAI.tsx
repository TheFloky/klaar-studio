import { Shield, Server, Lock, Brain } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const features = [
  { icon: Server, text: '100% Swiss Inference (Geneva/Zurich)' },
  { icon: Shield, text: 'nFADP & GDPR Article 25 Compliant' },
  { icon: Lock, text: 'No Data Leakage to US Tech Giants' },
];

export default function SovereignAI() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-secondary/30" aria-label="Sovereign Swiss AI">
      <div className="container max-w-5xl">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Brain size={14} />
            The OpenAI Alternative
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-6">
            AI Power without the Privacy Risk.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Most AI tools send your company secrets to US servers for training. Our <strong className="text-foreground">Sovereign AI</strong> implementations run exclusively on Infomaniak's Swiss-hosted infrastructure. Your data stays in the bunker, remains your property, and is never used to train third-party models.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl p-6 text-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-primary" size={24} />
                </div>
                <p className="font-semibold text-foreground text-sm">{f.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
