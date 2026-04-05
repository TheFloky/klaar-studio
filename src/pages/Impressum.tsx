import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-16 px-4">
        <Link to="/en" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>

        <h1 className="text-3xl font-bold mb-8">Impressum</h1>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Company Information</h2>
            <p>
              klaar-Studio GmbH<br />
              Switzerland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p>
              Email: <a href="mailto:hello@klaar.studio" className="text-primary hover:underline">hello@klaar.studio</a><br />
              Phone: +41 44 000 00 00
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Commercial Register</h2>
            <p>
              Registered in the Commercial Register of the Canton of Zurich.<br />
              UID: CHE-000.000.000 (placeholder — update with actual UID)
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Authorised Representative</h2>
            <p>[Managing Director Name — please update]</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">VAT Number</h2>
            <p>CHE-000.000.000 MWST (placeholder — update with actual VAT number)</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Liability Disclaimer</h2>
            <p>
              The content of this website has been prepared with the greatest possible care. However, klaar-Studio GmbH does not guarantee the accuracy, completeness, or timeliness of the content provided. Use of the content is at the user's own risk. Contributions identified by name reflect the opinion of the respective author and not necessarily the opinion of klaar-Studio GmbH.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Copyright</h2>
            <p>
              The content and works on these pages created by klaar-Studio GmbH are subject to Swiss copyright law. Duplication, processing, distribution, or any form of commercialisation of such material beyond the scope of copyright law requires prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Applicable Law & Jurisdiction</h2>
            <p>
              Swiss law applies exclusively. The place of jurisdiction is Zurich, Switzerland.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
