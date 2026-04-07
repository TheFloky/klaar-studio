import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Translations } from '@/lib/i18n';
import { Check, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ContactForm({ t, selectedTier }: { t: Translations; selectedTier?: string | null }) {
  const { ref, isVisible } = useScrollReveal();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [business, setBusiness] = useState('');
  const [needs, setNeeds] = useState('');
  const [calLink, setCalLink] = useState('');

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'CAL_BOOKING_LINK')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setCalLink(data.value);
      });
  }, []);

  const handleBook = async () => {
    // Log the lead to the database
    await supabase.from('bookings').insert({
      name,
      email,
      business,
      needs,
      tier: selectedTier || null,
      slot_start: new Date().toISOString(),
      slot_end: new Date().toISOString(),
      status: 'pending_scheduling',
    });

    // Open Cal.com booking page
    const url = calLink || 'https://cal.com';
    const params = new URLSearchParams({
      name,
      email,
      notes: `Business: ${business}\nNeeds: ${needs}${selectedTier ? `\nTier: ${selectedTier}` : ''}`,
    });
    window.open(`${url}?${params.toString()}`, '_blank');
    setStep(3); // show success
  };

  if (step === 3) {
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

        {selectedTier && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Check size={14} />
              {selectedTier}
            </span>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 mb-12">
          {t.contact.steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-6 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />}
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
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.contact.emailPlaceholder}
                className="bg-secondary/50 border-border"
              />
              <Button className="w-full swiss-red-glow" onClick={() => setStep(1)} disabled={!name.trim() || !email.trim()}>
                {t.contact.next}
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">{t.contact.steps[1]}</label>
              <Input
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder={t.contact.businessPlaceholder}
                className="bg-secondary/50 border-border"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">{t.contact.back}</Button>
                <Button className="flex-1 swiss-red-glow" onClick={() => setStep(2)} disabled={!business.trim()}>
                  {t.contact.next}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">{t.contact.steps[2]}</label>
              <Textarea
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                placeholder={t.contact.needsPlaceholder}
                rows={4}
                className="bg-secondary/50 border-border"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t.contact.back}</Button>
                <Button
                  className="flex-1 swiss-red-glow"
                  onClick={handleBook}
                  disabled={!needs.trim()}
                >
                  <ExternalLink size={16} className="mr-2" />
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
