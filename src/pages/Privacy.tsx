import { useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import SEO from '@/components/SEO';
import type { Lang } from '@/lib/i18n';

export default function Privacy() {
  const { lang } = useParams<{ lang: string }>();
  const safeLang = (['de', 'fr', 'en'].includes(lang ?? '') ? lang : 'de') as Lang;
  const backPath = `/${safeLang}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Privacy Policy — klaar Studio"
        description="How klaar Studio collects and processes personal data under GDPR and Swiss nFADP / nDSG."
        lang={safeLang}
        path={`${safeLang}/privacy`}
      />
      <PageHeader title="Privacy Policy" backTo={backPath} />
      <div className="container max-w-3xl py-12 px-4">
        <p className="text-sm text-muted-foreground mb-8">
          This Privacy Policy explains how we collect and process personal data in accordance with the General Data Protection Regulation (EU) 2016/679 (GDPR).<br />
          When providing services to clients in Switzerland, we also take into account applicable Swiss data protection standards.
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Controller</h2>
            <p>
              Klaar Studio Julian Vidal<br />
              ul. Fryderyka Chopina 16<br />
              05-082 Blizne Jasińskiego<br />
              Poland
            </p>
            <p className="mt-2">
              Email: <a href="mailto:info@klaar-studio.ch" className="text-primary hover:underline">info@klaar-studio.ch</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Data We Collect</h2>
            <p>When you use our website, we may collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Contact form data:</strong> Name, project details, budget</li>
              <li><strong>Submitted URLs:</strong> For compliance audit scans (no personal data processed)</li>
              <li><strong>Technical data:</strong> IP address, browser type, operating system (for security purposes)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Purpose of Processing</h2>
            <p>We process your data for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Responding to inquiries and providing quotes</li>
              <li>Delivering requested services</li>
              <li>Ensuring website security and performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Legal Basis (GDPR)</h2>
            <p>We process your data based on:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Art. 6(1)(a) GDPR</strong> – Consent</li>
              <li><strong>Art. 6(1)(f) GDPR</strong> – Legitimate interest (website operation, security, communication)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Transfers</h2>
            <p>
              Your data may be processed outside the European Economic Area (EEA).
              Where this occurs, we ensure appropriate safeguards such as:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions by the European Commission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Data Retention</h2>
            <p>We retain personal data only as long as necessary:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Contact form data: up to 12 months</li>
              <li>Or longer if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Your Rights (GDPR)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access your data</li>
              <li>Rectify incorrect data</li>
              <li>Request deletion</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>
            <p className="mt-2">
              To exercise your rights, contact: <a href="mailto:info@klaar-studio.ch" className="text-primary hover:underline">info@klaar-studio.ch</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Cookies</h2>
            <p>
              This website does not use tracking cookies or analytics tools.<br />
              Only essential cookies may be used to ensure proper functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Third-Party Services</h2>
            <p>We use:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Firecrawl</strong> – for website analysis (processes only submitted URLs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Supervisory Authority</h2>
            <p>
              You may file a complaint with the Polish data protection authority:<br />
              UODO (Urząd Ochrony Danych Osobowych)<br />
              <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://uodo.gov.pl</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Changes</h2>
            <p>
              We may update this Privacy Policy from time to time.<br />
              The current version is always available on this page.
            </p>
            <p className="mt-2">Last updated: 7 April 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}
