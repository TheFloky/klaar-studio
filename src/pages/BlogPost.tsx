import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getTranslations, type Lang } from "@/lib/i18n";
import { Calendar, Clock, ExternalLink, ArrowLeft } from "lucide-react";

interface PostFull {
  id: string;
  translation_group_id: string;
  lang: Lang;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  cover_image_url: string | null;
  cover_attribution: string | null;
  seo_title: string;
  seo_description: string;
  tags: string[];
  external_links: { url: string; label: string; context: string }[];
  reading_time_min: number;
  published_at: string;
}

const BACK_LABELS: Record<Lang, string> = { de: "Zurück zum Journal", fr: "Retour au journal", en: "Back to journal" };
const REFS_LABELS: Record<Lang, string> = { de: "Quellen & Referenzen", fr: "Sources et références", en: "Sources & references" };
const NOT_FOUND: Record<Lang, string> = { de: "Beitrag nicht gefunden", fr: "Article introuvable", en: "Post not found" };

export default function BlogPost() {
  const { lang: rawLang, slug } = useParams<{ lang: string; slug: string }>();
  const lang = (["de", "fr", "en"].includes(rawLang || "") ? rawLang : "de") as Lang;
  const t = getTranslations(lang);

  const [post, setPost] = useState<PostFull | null>(null);
  const [siblings, setSiblings] = useState<Record<Lang, string>>({} as Record<Lang, string>);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .eq("lang", lang)
        .eq("slug", slug)
        .maybeSingle();
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPost(data as unknown as PostFull);
      // Find translation siblings
      const { data: sibs } = await supabase
        .from("blog_posts")
        .select("lang, slug")
        .eq("status", "published")
        .eq("translation_group_id", data.translation_group_id);
      const map: Record<string, string> = {};
      (sibs || []).forEach((s) => { map[s.lang] = s.slug; });
      setSiblings(map as Record<Lang, string>);
      setLoading(false);
    })();
  }, [lang, slug]);

  if (rawLang && !["de", "fr", "en"].includes(rawLang)) {
    return <Navigate to={`/de/blog/${slug || ""}`} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">…</div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PageHeader title="404" subtitle="klaar Studio" backTo={`/${lang}/blog`} />
        <main className="flex-1 container py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">{NOT_FOUND[lang]}</h1>
          <Link to={`/${lang}/blog`} className="text-sm text-[hsl(var(--primary))] hover:underline">{BACK_LABELS[lang]}</Link>
        </main>
        <Footer t={t} />
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en-GB", {
      year: "numeric", month: "long", day: "numeric",
    });

  // Build alternates from siblings
  const alternates: Partial<Record<Lang, string>> = {};
  (Object.keys(siblings) as Lang[]).forEach((l) => {
    alternates[l] = `${l}/blog/${siblings[l]}`;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={post.seo_title}
        description={post.seo_description}
        lang={lang}
        path={`${lang}/blog/${post.slug}`}
        alternates={alternates}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.seo_description,
            image: post.cover_image_url || undefined,
            datePublished: post.published_at,
            dateModified: post.published_at,
            author: { "@type": "Organization", name: "klaar Studio", url: "https://klaar-studio.ch" },
            publisher: {
              "@type": "Organization",
              name: "klaar Studio",
              logo: { "@type": "ImageObject", url: "https://klaar-studio.ch/favicon.ico" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://klaar-studio.ch/${lang}/blog/${post.slug}` },
            keywords: post.tags?.join(", "),
            inLanguage: lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en",
          })}
        </script>
      </Helmet>

      <PageHeader title="Journal" subtitle="klaar Studio" backTo={`/${lang}/blog`} />

      <main className="flex-1">
        {/* Hero */}
        <header className="container pt-12 md:pt-16 pb-8 max-w-3xl">
          <Link to={`/${lang}/blog`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft size={12} /> {BACK_LABELS[lang]}
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] uppercase tracking-widest font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
            <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(post.published_at)}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> {post.reading_time_min} min</span>
          </div>
        </header>

        {/* Cover */}
        {post.cover_image_url && (
          <div className="container max-w-4xl mb-12">
            <figure className="rounded-2xl overflow-hidden border border-border">
              <img src={post.cover_image_url} alt={post.title} className="w-full aspect-[16/9] object-cover" />
              {post.cover_attribution && (
                <figcaption className="text-[10px] text-muted-foreground bg-card px-4 py-2 border-t border-border">{post.cover_attribution}</figcaption>
              )}
            </figure>
          </div>
        )}

        {/* Body */}
        <article className="container max-w-3xl pb-16">
          <div className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-foreground/85 prose-p:leading-relaxed
            prose-a:text-[hsl(var(--primary))] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-4 prose-li:text-foreground/85
            prose-blockquote:border-l-[hsl(var(--primary))] prose-blockquote:bg-card prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-foreground/90
            prose-code:text-[hsl(var(--primary))] prose-code:bg-card prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
          </div>

          {/* External references */}
          {post.external_links?.length > 0 && (
            <aside className="mt-12 border-t border-border pt-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">{REFS_LABELS[lang]}</h2>
              <ul className="space-y-3">
                {post.external_links.map((l, i) => (
                  <li key={i} className="text-sm">
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-[hsl(var(--primary))] hover:underline font-semibold">
                      {l.label} <ExternalLink size={12} />
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.context}</p>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl border border-border bg-card text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">klaar Studio</p>
            <h3 className="text-xl font-bold text-foreground mb-3">
              {lang === "de" ? "Bereit für eine konforme Schweizer Website?" :
               lang === "fr" ? "Prêt pour un site web suisse conforme ?" :
               "Ready for a fully compliant Swiss website?"}
            </h3>
            <Link to={`/${lang}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
              {lang === "de" ? "Kostenloses Gespräch buchen" :
               lang === "fr" ? "Réserver un appel gratuit" :
               "Book a free call"} <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </div>
        </article>
      </main>

      <Footer t={t} />
    </div>
  );
}
