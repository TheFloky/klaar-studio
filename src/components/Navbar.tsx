import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Lang } from '@/lib/i18n';

interface NavbarProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  ctaText: string;
}

const langs: Lang[] = ['DE', 'FR', 'EN'] as unknown as Lang[];
const langLabels: Record<Lang, string> = { de: 'DE', fr: 'FR', en: 'EN' };

export default function Navbar({ lang, setLang, ctaText }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card py-3' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between">
        <a href="#" className="inline-flex flex-col items-center leading-none">
          <span className="inline-flex items-center gap-2">
            <span className="font-extrabold tracking-wide text-foreground text-2xl">KLAAR</span>
            <svg width="18" height="18" viewBox="0 0 16 16" className="inline-block">
              <rect width="16" height="16" rx="2.5" fill="hsl(var(--primary))" />
              <text x="8" y="12.5" textAnchor="middle" fill="white" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="12">K</text>
            </svg>
          </span>
          <span className="font-semibold tracking-[0.38em] uppercase text-muted-foreground -mt-0.5 text-sm my-0 px-[2px] mx-0 text-center -translate-x-[9px]">Studio</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex gap-0.5 rounded-lg bg-secondary p-0.5 sm:p-1">
            {(['de', 'fr', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-colors ${
                  lang === l ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
