import { Helmet } from 'react-helmet-async';
import type { Lang } from '@/lib/i18n';

const SITE_URL = 'https://klaar-studio.ch';
const OG_IMAGE =
  'https://storage.googleapis.com/gpt-engineer-file-uploads/g2ldoHHhVugApVs0kQUs1vQ3Tqr2/social-images/social-1774962983660-Screenshot_2026-03-31_151612.webp';

interface SEOProps {
  title: string;
  description: string;
  lang: Lang;
  /** Path without leading slash, e.g. "de" or "de/audit" */
  path: string;
  /** Same page in other languages, keyed by lang. Path without leading slash. */
  alternates?: Partial<Record<Lang, string>>;
  noindex?: boolean;
  type?: 'website' | 'article';
  /** Override the canonical URL (e.g. for alt-slug pages pointing back to the main post). Path without leading slash. */
  canonicalPath?: string;
  /** Optional cover/share image URL */
  image?: string;
}

export default function SEO({
  title,
  description,
  lang,
  path,
  alternates,
  noindex,
  type = 'website',
  canonicalPath,
  image,
}: SEOProps) {
  const canonical = `${SITE_URL}/${canonicalPath ?? path}`.replace(/\/+$/, '');
  const ogImage = image || OG_IMAGE;
  const htmlLang = lang === 'de' ? 'de-CH' : lang === 'fr' ? 'fr-CH' : 'en';

  return (
    <Helmet>
      <html lang={htmlLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      {/* hreflang */}
      {alternates &&
        (Object.entries(alternates) as [Lang, string][]).map(([l, p]) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={l === 'de' ? 'de-CH' : l === 'fr' ? 'fr-CH' : 'en'}
            href={`${SITE_URL}/${p}`.replace(/\/+$/, '')}
          />
        ))}
      {alternates && (
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/${alternates.en ?? path}`.replace(/\/+$/, '')} />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="klaar Studio" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={htmlLang.replace('-', '_')} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@klaarStudio" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
