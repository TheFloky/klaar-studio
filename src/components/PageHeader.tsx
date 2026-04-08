import { useState, useEffect } from 'react';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Lang } from '@/lib/i18n';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  showLang?: boolean;
}

const langLabels: Record<Lang, string> = { de: 'DE', fr: 'FR', en: 'EN' };

export default function PageHeader({ title, subtitle, backTo, showLang = true }: PageHeaderProps) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const currentLang = (window.location.pathname.split('/')[1] as Lang) || 'de';

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        {backTo && (
          <Link to={backTo} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </Link>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-[11px] text-muted-foreground uppercase tracking-widest">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showLang && (
            <div className="flex gap-0.5 rounded-lg bg-secondary p-0.5">
              {(['de', 'fr', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    const path = window.location.pathname;
                    // For lang-prefixed routes like /de/maintenance
                    const segments = path.split('/');
                    if (['de', 'fr', 'en'].includes(segments[1])) {
                      segments[1] = l;
                      navigate(segments.join('/'));
                    }
                  }}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                    currentLang === l ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {langLabels[l]}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setDark(!dark)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
