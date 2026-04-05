import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Translations } from '@/lib/i18n';
import { Check, Calendar, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type TimeSlot = {
  start: string;
  end: string;
  display: string;
};

type DaySlots = {
  date: string;
  label: string;
  slots: TimeSlot[];
};

export default function ContactForm({ t, selectedTier }: { t: Translations; selectedTier?: string | null }) {
  const { ref, isVisible } = useScrollReveal();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [needs, setNeeds] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<DaySlots[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (step === 3) {
      fetchAvailableSlots();
    }
  }, [step]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'get-slots' },
      });
      if (error) throw error;
      setAvailableSlots(data?.days || []);
      if (data?.days?.length > 0) {
        setSelectedDay(data.days[0].date);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const { error } = await supabase.functions.invoke('google-calendar', {
        body: {
          action: 'book',
          name,
          business,
          needs,
          tier: selectedTier || '',
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBooking(false);
    }
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

  const currentDaySlots = availableSlots.find(d => d.date === selectedDay)?.slots || [];

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
              {i < 3 && <div className={`w-6 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8">
          {/* Step 0: Full Name */}
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

          {/* Step 1: Business Name */}
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

          {/* Step 2: What they need */}
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
                <Button className="flex-1 swiss-red-glow" onClick={() => setStep(3)} disabled={!needs.trim()}>
                  {t.contact.next}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Pick a Date */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar size={16} />
                {t.contact.pickDate}
              </label>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  {t.contact.loading}
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.contact.noSlots}</p>
              ) : (
                <>
                  {/* Day tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {availableSlots.map((day) => (
                      <button
                        key={day.date}
                        onClick={() => { setSelectedDay(day.date); setSelectedSlot(null); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                          selectedDay === day.date
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary/50 text-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  {/* Time slots */}
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {currentDaySlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          selectedSlot?.start === slot.start
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary/50 text-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        <Clock size={14} />
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">{t.contact.back}</Button>
                <Button
                  className="flex-1 swiss-red-glow"
                  onClick={handleSubmit}
                  disabled={!selectedSlot || booking}
                >
                  {booking ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
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
