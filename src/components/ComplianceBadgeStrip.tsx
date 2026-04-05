import { Shield, Server, Eye, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const badges = [
  { icon: Server, label: '100% Swiss-Hosted Data' },
  { icon: ShieldCheck, label: 'nFADP 2026 Compliant' },
  { icon: Eye, label: 'Privacy-First Architecture' },
  { icon: Shield, label: 'No US-Cloud Data Leaks' },
];

export default function ComplianceBadgeStrip() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`py-8 border-y border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="container">
        <div className="mx-auto flex max-w-sm flex-col gap-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-10">
          {badges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="grid w-full grid-cols-[2rem,minmax(0,1fr)] items-center gap-3 text-left text-muted-foreground sm:flex sm:w-auto sm:items-center sm:gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="text-primary" size={16} />
              </div>
              <span className="text-sm font-semibold tracking-wide leading-tight sm:whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
