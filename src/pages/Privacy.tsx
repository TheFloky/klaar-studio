import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-16 px-4">
        <Link to="/en" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          In accordance with the Swiss Federal Act on Data Protection (nFADP/nDSG), effective 1 September 2023.
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Controller</h2>
            <p>
              klaar-Studio GmbH<br />
              Switzerland<br />
              Email: <a href="mailto:hello@klaar.studio" className="text-primary hover:underline">hello@klaar.studio</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Data We Collect</h2>
            <p>When you use our website, we may collect the following data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Contact form submissions:</strong> Name, project description, and budget selection.</li>
              <li><strong>Compliance Audit tool:</strong> The website URL you submit for scanning. No personal data is collected through this tool.</li>
              <li><strong>Technical data:</strong> Your browser type, operating system, and IP address (anonymised) for security purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Purpose of Data Processing</h2>
            <p>We process your data exclusively for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Responding to your enquiries and providing quotes.</li>
              <li>Delivering the compliance audit results you requested.</li>
              <li>Improving the security and performance of our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Legal Basis</h2>
            <p>
              Data processing is based on your consent (Art. 6 para. 6 nDSG) and our legitimate interest in operating and improving our services (Art. 6 para. 1 nDSG).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Transfers Abroad</h2>
            <p>
              Our website infrastructure may involve data processing outside Switzerland. Where this occurs, we ensure that appropriate safeguards are in place in accordance with Art. 16–17 nDSG. We do not transfer data to countries without an adequate level of data protection unless contractual guarantees are provided.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfil the purposes described above, or as required by law. Contact form data is deleted after 12 months if no business relationship is established.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Your Rights</h2>
            <p>Under the nDSG, you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access:</strong> Request information about the data we hold about you.</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data.</li>
              <li><strong>Deletion:</strong> Request deletion of your data.</li>
              <li><strong>Data portability:</strong> Request your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to data processing based on legitimate interest.</li>
            </ul>
            <p className="mt-2">
              To exercise your rights, contact us at <a href="mailto:hello@klaar.studio" className="text-primary hover:underline">hello@klaar.studio</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Cookies</h2>
            <p>
              This website does not use tracking cookies or third-party analytics tools. Only technically necessary cookies may be used to ensure the website functions correctly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Third-Party Services</h2>
            <p>
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Firecrawl:</strong> For website compliance scanning (processes only the submitted URL, no personal data).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Supervisory Authority</h2>
            <p>
              If you believe your data protection rights have been violated, you may file a complaint with the Federal Data Protection and Information Commissioner (FDPIC):<br />
              <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.edoeb.admin.ch</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. The current version is always available on this page.<br />
              Last updated: {new Date().toLocaleDateString('en-CH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
