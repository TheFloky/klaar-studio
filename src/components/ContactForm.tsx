import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Translations } from '@/lib/i18n';
import { Check } from 'lucide-react';

export default function ContactForm({ t }: { t: Translations }) {
  const { ref, isVisible } = useScrollReveal();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="contact" ref={ref} className="py-24 sm:py-32">
        <div className="container max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="text-primary" size={32} />
          </div>
          <p className="text-xl text-foreground font-semibold">{t.contact.success}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" ref={ref} className={`py-24 sm:py-32 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="container max-w-lg">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">
          {t.contact.title}
        </h2>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {t.contact.steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8">
          {step === 0 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">{t.contact.steps[0]}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.contact.namePlaceholder}
                className="bg-secondary/50 border-border"
              />
              <Button className="w-full swiss-red-glow" onClick={() => setStep(1)} disabled={!name.trim()}>
                {t.contact.next}
              </Button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">{t.contact.steps[1]}</label>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t.contact.goalPlaceholder}
                rows={4}
                className="bg-secondary/50 border-border"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">{t.contact.back}</Button>
                <Button className="flex-1 swiss-red-glow" onClick={() => setStep(2)} disabled={!goal.trim()}>
                  {t.contact.next}
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">{t.contact.steps[2]}</label>
              <div className="grid grid-cols-2 gap-3">
                {t.contact.budgets.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      budget === b
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/50 text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t.contact.back}</Button>
                <Button className="flex-1 swiss-red-glow" onClick={handleSubmit} disabled={!budget}>
                  {t.contact.submit}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
