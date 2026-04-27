import { useState, useEffect, useMemo, useRef } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Translations } from '@/lib/i18n';
import { Check, Calendar as CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Cal, { getCalApi } from '@calcom/embed-react';

type ParsedCal = { origin: string; calLink: string } | null;

function parseCalLink(raw: string): ParsedCal {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const calLink = u.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!calLink) return null;
    return { origin: `${u.protocol}//${u.host}`, calLink };
  } catch {
    return null;
  }
}

export default function ContactForm({ t, selectedTier }: { t: Translations; selectedTier?: string | null }) {
  const { ref, isVisible } = useScrollReveal();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [business, setBusiness] = useState('');
  const [needs, setNeeds] = useState('');
  const [calLinkRaw, setCalLinkRaw] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const calContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'CAL_BOOKING_LINK')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setCalLinkRaw(data.value);
        setSettingsLoaded(true);
      });
  }, []);

  const parsed = useMemo(() => parseCalLink(calLinkRaw), [calLinkRaw]);

  // Theme + UI styling for the embed once we reach step 3
  useEffect(() => {
    if (step !== 3 || !parsed) return;
    let cancelled = false;
    (async () => {
      try {
        const cal = await getCalApi({ namespace: 'klaar-booking' });
        if (cancelled) return;
        const isDark = document.documentElement.classList.contains('dark');
        cal('ui', {
          theme: isDark ? 'dark' : 'light',
          hideEventTypeDetails: false,
          layout: 'month_view',
        });
        cal('on', {
          action: 'linkReady',
          callback: () => setEmbedReady(true),
        });
        cal('on', {
          action: 'bookingSuccessful',
          callback: () => {
            // Log completion (fire & forget)
            supabase.from('bookings').insert({
              name,
              email,
              business,
              needs: [needs, phone && `Phone: ${phone}`, website && `Website: ${website}`].filter(Boolean).join('\n'),
              tier: selectedTier || null,
              slot_start: new Date().toISOString(),
              slot_end: new Date().toISOString(),
              status: 'booked',
            }).then(({ error }) => {
              if (error) console.error('Failed to log booking:', error);
            });
          },
        });
      } catch (e) {
        console.error('Cal embed init failed', e);
        setEmbedError(true);
      }
    })();

    // Fallback: if embed never reports ready in 10s, show error state
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setEmbedReady((r) => {
          if (!r) setEmbedError(true);
          return r;
        });
      }
    }, 12000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [step, parsed, name, email, business, needs, phone, website, selectedTier]);

  const handleContinueToCalendar = () => {
    setEmbedReady(false);
    setEmbedError(false);
    // Log the lead in the background
    supabase.from('bookings').insert({
      name,
      email,
      business,
      needs: [needs, phone && `Phone: ${phone}`, website && `Website: ${website}`].filter(Boolean).join('\n'),
      tier: selectedTier || null,
      slot_start: new Date().toISOString(),
      slot_end: new Date().toISOString(),
      status: 'pending_scheduling',
    }).then(({ error }) => {
      if (error) console.error('Failed to log lead:', error);
    });
    setStep(3);
    // Smooth-scroll the embed into view
    setTimeout(() => {
      calContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const calConfig = useMemo(() => {
    const notes = [
      needs,
      phone && `Phone: ${phone}`,
      website && `Website: ${website}`,
      selectedTier && `Tier: ${selectedTier}`,
    ]
      .filter(Boolean)
      .join('\n');
    const cfg: Record<string, string> = {
      name,
      email,
      notes,
    };
    if (phone) {
      cfg['smsReminderNumber'] = phone;
      cfg['metadata[phone]'] = phone;
    }
    if (business) cfg['metadata[company]'] = business;
    if (website) cfg['metadata[website]'] = website;
    if (selectedTier) cfg['metadata[tier]'] = selectedTier;
    return cfg;
  }, [name, email, phone, website, business, needs, selectedTier]);

  return (
    <section
      id="contact"
      ref={ref}
      className={`py-24 sm:py-32 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className={`container ${step === 3 ? 'max-w-4xl' : 'max-w-lg'}`}>
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
          {[...t.contact.steps, t.contact.pickDate || '✓'].map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <div className={`w-6 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {step < 3 && (
          <div className="glass-card rounded-2xl p-8">
            {step === 0 && (
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">{t.contact.steps[0]}</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.contact.namePlaceholder}
                  className="bg-secondary/50 border-border"
                  autoComplete="name"
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.contact.emailPlaceholder}
                  className="bg-secondary/50 border-border"
                  autoComplete="email"
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.contact.phonePlaceholder}
                  className="bg-secondary/50 border-border"
                  autoComplete="tel"
                />
                <Button
                  className="w-full swiss-red-glow"
                  onClick={() => setStep(1)}
                  disabled={!name.trim() || !email.trim()}
                >
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
                  autoComplete="organization"
                />
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder={t.contact.websitePlaceholder}
                  className="bg-secondary/50 border-border"
                  autoComplete="url"
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                    {t.contact.back}
                  </Button>
                  <Button
                    className="flex-1 swiss-red-glow"
                    onClick={() => setStep(2)}
                    disabled={!business.trim()}
                  >
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
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    {t.contact.back}
                  </Button>
                  <Button
                    className="flex-1 swiss-red-glow"
                    onClick={handleContinueToCalendar}
                    disabled={!needs.trim() || !settingsLoaded}
                  >
                    <CalendarIcon size={16} className="mr-2" />
                    {t.contact.submit}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div ref={calContainerRef} className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                {t.contact.back}
              </button>
              <p className="text-sm text-muted-foreground">{t.contact.success}</p>
            </div>

            <div className="glass-card rounded-2xl p-2 sm:p-4 overflow-hidden relative min-h-[640px]">
              {!embedReady && !embedError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-card/80 backdrop-blur-sm rounded-2xl">
                  <Loader2 className="animate-spin text-primary" size={28} />
                  <p className="text-sm text-muted-foreground">{t.contact.loading}</p>
                </div>
              )}
              {embedError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-card/95 rounded-2xl text-center px-6">
                  <p className="text-sm text-foreground">{t.contact.noSlots}</p>
                  {parsed && (
                    <a
                      href={`${parsed.origin}/${parsed.calLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline underline-offset-4"
                    >
                      cal.com →
                    </a>
                  )}
                </div>
              )}

              {parsed ? (
                <Cal
                  namespace="klaar-booking"
                  calLink={parsed.calLink}
                  calOrigin={parsed.origin}
                  config={calConfig}
                  style={{ width: '100%', height: '100%', minHeight: '640px', overflow: 'scroll' }}
                />
              ) : (
                <div className="flex items-center justify-center min-h-[640px]">
                  <p className="text-sm text-muted-foreground">{t.contact.noSlots}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
