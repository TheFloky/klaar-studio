import { Link, useParams } from 'react-router-dom';
import type { Translations } from '@/lib/i18n';

export default function Footer({ t }: { t: Translations }) {
  const { lang } = useParams<{ lang: string }>();
  const l = lang || 'de';

  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <p className="text-xl font-extrabold text-foreground leading-none">KLAAR</p>
            <p className="text-[0.5rem] font-medium tracking-[0.25em] uppercase text-muted-foreground">Studio</p>
          </div>
          <p className="text-sm text-muted-foreground">info@klaar-studio.ch</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to={`/${l}/blog`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Journal</Link>
            <span className="text-xs text-muted-foreground">·</span>
            <Link to={`/${l}/impressum`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t.footer.impressum}</Link>
            <span className="text-xs text-muted-foreground">·</span>
            <Link to={`/${l}/privacy`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t.footer.privacy}</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} klaar-Studio. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
