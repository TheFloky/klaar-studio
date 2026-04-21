import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getTranslations, type Lang } from "@/lib/i18n";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";

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

const LABELS: Record<Lang, { hub: string; intro: (t: string) => string; readMore: string; minRead: string; empty: string; allTopics: string }> = {
  de: { hub: "Thema", intro: (t) => `Alle Artikel zum Thema „${t}" — vertieft, recherchiert und für Schweizer Unternehmen aufbereitet.`, readMore: "Weiterlesen", minRead: "Min.", empty: "Noch keine Artikel zu diesem Thema.", allTopics: "Alle Beiträge" },
  fr: { hub: "Sujet", intro: (t) => `Tous les articles sur le sujet « ${t} » — approfondis, documentés et adaptés aux entreprises suisses.`, readMore: "Lire", minRead: "min", empty: "Aucun article sur ce sujet pour l'instant.", allTopics: "Tous les articles" },
  en: { hub: "Topic", intro: (t) => `All articles on the topic "${t}" — researched, in-depth, and tailored for Swiss businesses.`, readMore: "Read", minRead: "min", empty: "No articles on this topic yet.", allTopics: "All articles" },
};

/** Normalize tag for URL matching: lowercase, strip diacritics, kebab */
function tagSlugify(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogTopic() {
  const { lang: rawLang, topic: topicSlug } = useParams<{ lang: string; topic: string }>();
  const lang = (["de", "fr", "en"].includes(rawLang || "") ? rawLang : "de") as Lang;
  const t = getTranslations(lang);
  const labels = LABELS[lang];

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [topicLabel, setTopicLabel] = useState<string>(topicSlug || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicSlug) return;
    (async () => {
      setLoading(true);
      // Fetch all posts in lang, filter client-side by tag-slug match (small dataset)
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image_url, tags, reading_time_min, published_at")
        .eq("status", "published")
        .eq("lang", lang)
        .order("published_at", { ascending: false });
      const all = (data as PostListItem[]) || [];
      const matching = all.filter((p) => (p.tags || []).some((tag) => tagSlugify(tag) === topicSlug));
      // Recover the original tag label
      const originalTag = matching[0]?.tags.find((tag) => tagSlugify(tag) === topicSlug);
      if (originalTag) setTopicLabel(originalTag);
      else setTopicLabel(topicSlug.replace(/-/g, " "));
      setPosts(matching);
      setLoading(false);
    })();
  }, [lang, topicSlug]);

  const formatDate = useMemo(() => (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en-GB", {
      year: "numeric", month: "long", day: "numeric",
    }), [lang]);

  if (rawLang && !["de", "fr", "en"].includes(rawLang)) {
    return <Navigate to={`/de/blog/topic/${topicSlug || ""}`} replace />;
  }

  const seoTitle = `${topicLabel} — ${labels.hub} · klaar Studio`;
  const seoDesc = labels.intro(topicLabel);
  const path = `${lang}/blog/topic/${topicSlug}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={seoTitle}
        description={seoDesc}
        lang={lang}
        path={path}
        type="website"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: seoTitle,
            description: seoDesc,
            url: `https://klaar-studio.ch/${path}`,
            inLanguage: lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en",
            mainEntity: {
              "@type": "ItemList",
              itemListElement: posts.slice(0, 20).map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://klaar-studio.ch/${lang}/blog/${p.slug}`,
                name: p.title,
              })),
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `https://klaar-studio.ch/${lang}` },
              { "@type": "ListItem", position: 2, name: "Journal", item: `https://klaar-studio.ch/${lang}/blog` },
              { "@type": "ListItem", position: 3, name: topicLabel, item: `https://klaar-studio.ch/${path}` },
            ],
          })}
        </script>
      </Helmet>

      <PageHeader title={topicLabel} subtitle={labels.hub} backTo={`/${lang}/blog`} />

      <main className="flex-1 container py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
              <Tag size={12} /> {labels.hub}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">{topicLabel}</h1>
            <p className="text-base text-muted-foreground">{labels.intro(topicLabel)}</p>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">…</p>
          ) : posts.length === 0 ? (
            <div className="border border-border rounded-2xl p-12 text-center">
              <p className="text-muted-foreground mb-4">{labels.empty}</p>
              <Link to={`/${lang}/blog`} className="text-sm text-[hsl(var(--primary))] hover:underline">{labels.allTopics}</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to={`/${lang}/blog/${p.slug}`}
                  className="group block rounded-xl overflow-hidden border border-border hover:border-foreground/20 transition-all"
                >
                  {p.cover_image_url && (
                    <div className="aspect-[16/10] bg-muted overflow-hidden">
                      <img
                        src={p.cover_image_url}
                        alt={p.title}
                        width={800}
                        height={500}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">{p.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar size={11} /> {formatDate(p.published_at)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={11} /> {p.reading_time_min} {labels.minRead}</span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {labels.readMore} <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer t={t} />
    </div>
  );
}
