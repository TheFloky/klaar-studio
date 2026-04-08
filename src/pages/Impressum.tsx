import { useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

export default function Impressum() {
  const { lang } = useParams<{ lang: string }>();
  const backPath = `/${lang || 'de'}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Legal Notice (Impressum)" backTo={backPath} />
      <div className="container max-w-3xl py-12 px-4">
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Service Provider</h2>
            <p>
              Floky Julian Vidal<br />
              ul. Fryderyka Chopina 16<br />
              05-082 Blizne Jasińskiego<br />
              Poland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p>
              Email: <a href="mailto:info@klaar-studio.ch" className="text-primary hover:underline">info@klaar-studio.ch</a><br />
              Phone: +41 797508350
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">EU VAT Identification Number</h2>
            <p>PL9512546451</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">EU Online Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (ODR):{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="mt-2">
              We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Editorial Responsibility</h2>
            <p>Julian Vidal</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Liability for Content</h2>
            <p>
              As a service provider, we are responsible for our own content on these pages under general Polish law. We are not obliged to monitor transmitted or stored third-party information or to investigate circumstances indicating unlawful activity. Obligations to remove or block the use of information under general law remain unaffected. Liability in this regard is only possible from the time of knowledge of a specific infringement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Liability for Links</h2>
            <p>
              Our website contains links to external third-party websites over whose content we have no control. Therefore, we cannot assume any liability for this external content. The respective provider or operator of the linked pages is always responsible for their content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Copyright</h2>
            <p>
              The content and works on these pages are subject to Polish and European copyright law. Any reproduction, editing, distribution, or use beyond the limits of copyright law requires the written consent of the respective author or creator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Applicable Law</h2>
            <p>
              Polish law applies. For consumers within the EU, mandatory consumer protection provisions of their country of residence remain unaffected.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
