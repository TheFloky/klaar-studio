import { Check, Star, ShoppingBag, Crown, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { Translations } from '@/lib/i18n';

export default function InvestmentTiers({ t }: { t: Translations }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} id="pricing" className="py-24 sm:py-32">
      <div className="container">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">
          {t.pricing.title}
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          {t.pricing.subtitle}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {t.pricing.tiers.map((tier, i) => {
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

                {[Globe, Zap, ShoppingBag, Crown][i] && (() => {
                  const Icon = [Globe, Zap, ShoppingBag, Crown][i];
                  return <Icon size={20} className="text-primary mb-3" />;
                })()}

                <h3 className="text-lg font-bold text-foreground mb-2">{tier.name}</h3>
                <div className="mb-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{tier.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{tier.monthly}</p>

                <div className="border-t border-border pt-6 mb-8 flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={`w-full ${isElite ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                  variant={isPopular ? 'default' : isElite ? 'default' : 'outline'}
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t.pricing.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Compare Add-ons */}
        <div className="text-center mt-12">
          <Button variant="ghost" className="text-primary font-semibold">
            {t.pricing.addons}
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto italic">
          {t.pricing.note}
        </p>
      </div>
    </section>
  );
}