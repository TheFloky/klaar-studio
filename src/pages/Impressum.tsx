import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-16 px-4">
        <Link to="/en" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>

        <h1 className="text-3xl font-bold mb-8">Legal Notice (Impressum)</h1>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Service Provider (Art. 5 Polish Act on Electronic Services)</h2>
            <p>
              Floky Julian Vidal<br />
              ulica Fryderyka Chopina 16<br />
              05-082, Blizne Jasińskiego, Stare Babice, Warszawski Zachodni, Mazowieckie, Poland
            </p>
          </section>


          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Represented by</h2>
            <p>Julian Vidal</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p>
              Email: <a href="mailto:info@klaar-studio.ch" className="text-primary hover:underline">info@klaar-studio.ch</a><br />
              Phone: +41 797508350
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">EU Online Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (ODR):{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
              <br />
              We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">VAT Identification Number</h2>
            <p>
              EU VAT ID: PL 9512546451<br />
              (Issued pursuant to Art. 97 of the Polish VAT Act)
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Editorial Responsibility</h2>
            <p>Julian Vidal</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Liability for Content</h2>
            <p>
              As a service provider, we are responsible for our own content on these pages in accordance with Art. 8(1) of the Polish Act on Electronic Services and general provisions of Polish law. However, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances indicating unlawful activity. Obligations to remove or block the use of information under general law remain unaffected. Liability in this regard is only possible from the time of knowledge of a specific infringement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Liability for Links</h2>
            <p>
              Our website contains links to external third-party websites over whose content we have no control. We therefore cannot accept any liability for this third-party content. The respective provider or operator of the linked pages is always responsible for their content. The linked pages were checked for possible legal violations at the time of linking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Copyright</h2>
            <p>
              The content and works on these pages are subject to Polish and European copyright law. Reproduction, editing, distribution, and any kind of use beyond the limits of copyright law require the written consent of the respective author or creator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Applicable Law & Jurisdiction</h2>
            <p>
              Polish law applies. For consumers within the EU, the mandatory consumer protection provisions of their country of residence also apply (Regulation (EC) No 593/2008, Art. 6). The place of jurisdiction for all disputes is [City — please update], Poland.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
