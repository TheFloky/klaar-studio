import type { Translations } from '@/lib/i18n';

export default function Footer({ t }: { t: Translations }) {
  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <p className="text-xl font-extrabold text-foreground mb-4">
            VANGUARD<span className="text-primary">.</span>
          </p>
          <p className="text-sm text-muted-foreground">{t.footer.phone}</p>
          <p className="text-sm text-muted-foreground">hello@vanguard.digital</p>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vanguard Digital GmbH. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
