import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Lang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  ctaText: string;
}

const langs: Lang[] = ['DE', 'FR', 'EN'] as unknown as Lang[];
const langLabels: Record<Lang, string> = { de: 'DE', fr: 'FR', en: 'EN' };

export default function Navbar({ lang, setLang, ctaText }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
        <a href="#" className="text-xl font-extrabold tracking-tight text-foreground inline-flex items-center gap-1.5">
          <span className="flex flex-col leading-none">
            <span className="text-xl font-extrabold tracking-tight">KLAAR</span>
            <span className="text-[0.5rem] font-medium tracking-[0.25em] uppercase text-muted-foreground">Studio</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" className="inline-block">
            <rect width="16" height="16" rx="2.5" fill="hsl(var(--primary))" />
            <path d="M6.25 3h3.5v10h-3.5z" fill="white" />
            <path d="M3 6.25h10v3.5H3z" fill="white" />
          </svg>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {(['de', 'fr', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  lang === l ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="swiss-red-glow"
          >
            {ctaText}
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-card mt-2 mx-4 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex gap-1 rounded-lg bg-secondary p-1 self-start">
            {(['de', 'fr', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setMenuOpen(false); }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  lang === l ? 'bg-foreground text-background' : 'text-muted-foreground'
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Button
            onClick={() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }}
            className="swiss-red-glow w-full"
          >
            {ctaText}
          </Button>
        </div>
      )}
    </header>
  );
}
