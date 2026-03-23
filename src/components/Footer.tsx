import type { Translations } from '@/lib/i18n';

export default function Footer({ t }: { t: Translations }) {
  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xl font-extrabold text-foreground mb-4">
              VANGUARD<span className="text-primary">.</span>
            </p>
            <p className="text-sm text-muted-foreground">{t.footer.phone}</p>
            <p className="text-sm text-muted-foreground">hello@vanguard.digital</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Social</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vanguard Digital GmbH. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
