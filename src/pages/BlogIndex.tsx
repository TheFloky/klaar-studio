import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { getTranslations, type Lang } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  tags: string[];
  reading_time_min: number;
  published_at: string;
}

const BLOG_LABELS: Record<Lang, { title: string; sub: string; readMore: string; minRead: string; featured: string; empty: string }> = {
  de: { title: "Journal", sub: "Einblicke zu Schweizer Web-Compliance, Performance und souveräner Technologie.", readMore: "Weiterlesen", minRead: "Min. Lesezeit", featured: "Empfohlen", empty: "Bald verfügbar — der erste Beitrag ist in Vorbereitung." },
  fr: { title: "Journal", sub: "Réflexions sur la conformité web suisse, la performance et la technologie souveraine.", readMore: "Lire la suite", minRead: "min de lecture", featured: "À la une", empty: "Bientôt disponible — le premier article est en préparation." },
  en: { title: "Journal", sub: "Insights on Swiss web compliance, performance, and sovereign technology.", readMore: "Read more", minRead: "min read", featured: "Featured", empty: "Coming soon — the first post is in the works." },
};

export default function BlogIndex() {
  const { lang: rawLang } = useParams<{ lang: string }>();
  const lang = (["de", "fr", "en"].includes(rawLang || "") ? rawLang : "de") as Lang;
  const t = getTranslations(lang);
  const labels = BLOG_LABELS[lang];

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image_url, tags, reading_time_min, published_at")
        .eq("status", "published")
        .eq("lang", lang)
        .order("published_at", { ascending: false });
      setPosts((data as PostListItem[]) || []);
      setLoading(false);
    })();
  }, [lang]);

  if (rawLang && !["de", "fr", "en"].includes(rawLang)) {
    return <Navigate to="/de/blog" replace />;
  }

  const featured = posts[0];
  const rest = posts.slice(1);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en-GB", {
      year: "numeric", month: "long", day: "numeric",
    });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={`${labels.title} — klaar Studio`}
        description={labels.sub}
        lang={lang}
        path={`${lang}/blog`}
        alternates={{ de: "de/blog", fr: "fr/blog", en: "en/blog" }}
      />
      <Helmet>
        <link rel="alternate" type="application/rss+xml" title={`${labels.title} (${lang.toUpperCase()})`} href={`https://vlarkrouidgnvgqmpugd.functions.supabase.co/rss?lang=${lang}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "klaar Studio Journal",
            url: `https://klaar-studio.ch/${lang}/blog`,
            inLanguage: lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en",
            blogPost: posts.slice(0, 10).map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `https://klaar-studio.ch/${lang}/blog/${p.slug}`,
              datePublished: p.published_at,
              image: p.cover_image_url || undefined,
            })),
          })}
        </script>
      </Helmet>

      <PageHeader title={labels.title} subtitle="klaar Studio" backTo={`/${lang}`} />

      <main className="flex-1 container py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">{labels.title}</h1>
            <p className="text-base text-muted-foreground">{labels.sub}</p>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">…</p>
          ) : posts.length === 0 ? (
            <div className="border border-border rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">{labels.empty}</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link
                  to={`/${lang}/blog/${featured.slug}`}
                  className="group block mb-16 rounded-2xl overflow-hidden border border-border hover:border-foreground/20 transition-all"
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-[4/3] md:aspect-auto bg-muted overflow-hidden">
                      {featured.cover_image_url && (
                        <img
                          src={featured.cover_image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="eager"
                        />
                      )}
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">{labels.featured}</span>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-[hsl(var(--primary))] transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(featured.published_at)}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {featured.reading_time_min} {labels.minRead}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((p) => (
                    <Link
                      key={p.id}
                      to={`/${lang}/blog/${p.slug}`}
                      className="group block rounded-xl overflow-hidden border border-border hover:border-foreground/20 transition-all"
                    >
                      <div className="aspect-[16/10] bg-muted overflow-hidden">
                        {p.cover_image_url && (
                          <img
                            src={p.cover_image_url}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">{p.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(p.published_at)}</span>
                          <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                            {labels.readMore} <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer t={t} />
    </div>
  );
}
