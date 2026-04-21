import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getTranslations, type Lang } from "@/lib/i18n";
import { Calendar, Clock, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";

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
  alt_slugs: string[];
  external_links: { url: string; label: string; context: string }[];
  reading_time_min: number;
  published_at: string;
}

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  reading_time_min: number;
  tags: string[];
}

const BACK_LABELS: Record<Lang, string> = { de: "Zurück zum Journal", fr: "Retour au journal", en: "Back to journal" };
const REFS_LABELS: Record<Lang, string> = { de: "Quellen & Referenzen", fr: "Sources et références", en: "Sources & references" };
const NOT_FOUND: Record<Lang, string> = { de: "Beitrag nicht gefunden", fr: "Article introuvable", en: "Post not found" };
const RELATED_LABELS: Record<Lang, string> = { de: "Weiterlesen", fr: "À lire aussi", en: "Continue reading" };
const HOME_LABEL: Record<Lang, string> = { de: "Start", fr: "Accueil", en: "Home" };
const JOURNAL_LABEL: Record<Lang, string> = { de: "Journal", fr: "Journal", en: "Journal" };

/** Extract H2 questions for FAQ schema */
function extractFaqs(md: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const lines = md.split("\n");
  let currentQ: string | null = null;
  let buffer: string[] = [];
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      if (currentQ && buffer.length) {
        const a = buffer.join(" ").replace(/[#*_`>]/g, "").replace(/\s+/g, " ").trim().slice(0, 500);
        if (a.length > 30 && /[?？]$/.test(currentQ)) faqs.push({ q: currentQ, a });
      }
      currentQ = h2[1].trim();
      buffer = [];
    } else if (currentQ && line.trim() && !line.startsWith("#")) {
      buffer.push(line.trim());
    }
  }
  if (currentQ && buffer.length) {
    const a = buffer.join(" ").replace(/[#*_`>]/g, "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (a.length > 30 && /[?？]$/.test(currentQ)) faqs.push({ q: currentQ, a });
  }
  return faqs.slice(0, 8);
}

/** Auto-link distinctive keywords (5+ chars, max 1 occurrence per term) to other published posts */
function autoLink(md: string, lang: Lang, currentSlug: string, others: { slug: string; title: string; tags: string[] }[]): string {
  if (!others.length) return md;
  // Build a candidate map: distinctive keyword/tag → slug
  const candidates: { term: string; slug: string }[] = [];
  for (const o of others) {
    if (o.slug === currentSlug) continue;
    for (const tag of o.tags || []) {
      if (tag.length >= 5 && tag.length <= 30) candidates.push({ term: tag, slug: o.slug });
    }
  }
  // Sort longest-first so multi-word matches win
  candidates.sort((a, b) => b.term.length - a.term.length);
  const used = new Set<string>();
  let out = md;
  for (const { term, slug } of candidates) {
    if (used.has(term.toLowerCase())) continue;
    if (slug === currentSlug) continue;
    // Don't link inside existing markdown links/images/code blocks/headings
    const re = new RegExp(`(?<![\\w\\[\\(\\!])(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\w\\]\\)])`, "i");
    if (re.test(out)) {
      out = out.replace(re, `[$1](/${lang}/blog/${slug})`);
      used.add(term.toLowerCase());
    }
  }
  return out;
}

export default function BlogPost() {
  const { lang: rawLang, slug } = useParams<{ lang: string; slug: string }>();
  const lang = (["de", "fr", "en"].includes(rawLang || "") ? rawLang : "de") as Lang;
  const t = getTranslations(lang);

  const [post, setPost] = useState<PostFull | null>(null);
  const [siblings, setSiblings] = useState<Record<Lang, string>>({} as Record<Lang, string>);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [otherPosts, setOtherPosts] = useState<{ slug: string; title: string; tags: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAltSlug, setIsAltSlug] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      // 1. Try canonical slug
      let { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .eq("lang", lang)
        .eq("slug", slug)
        .maybeSingle();

      let viaAlt = false;
      // 2. Fallback: alt_slugs lookup → render the post but mark as alt (for canonical override)
      if (!data) {
        const { data: altMatch } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .eq("lang", lang)
          .contains("alt_slugs", [slug])
          .maybeSingle();
        if (altMatch) {
          data = altMatch;
          viaAlt = true;
        }
      }

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data as unknown as PostFull);
      setIsAltSlug(viaAlt);

      // Translation siblings
      const { data: sibs } = await supabase
        .from("blog_posts")
        .select("lang, slug")
        .eq("status", "published")
        .eq("translation_group_id", data.translation_group_id);
      const map: Record<string, string> = {};
      (sibs || []).forEach((s) => { map[s.lang] = s.slug; });
      setSiblings(map as Record<Lang, string>);

      // Related: same lang, overlapping tags, exclude self. Limit 3.
      if (data.tags?.length) {
        const { data: rel } = await supabase
          .from("blog_posts")
          .select("slug, title, excerpt, cover_image_url, reading_time_min, tags")
          .eq("status", "published")
          .eq("lang", lang)
          .neq("id", data.id)
          .overlaps("tags", data.tags as string[])
          .order("published_at", { ascending: false })
          .limit(3);
        setRelated((rel as RelatedPost[]) || []);
      }

      // Auto-link pool: all other published posts in this lang
      const { data: others } = await supabase
        .from("blog_posts")
        .select("slug, title, tags")
        .eq("status", "published")
        .eq("lang", lang)
        .neq("id", data.id);
      setOtherPosts((others as { slug: string; title: string; tags: string[] }[]) || []);

      setLoading(false);
    })();
  }, [lang, slug]);

  // Pre-process markdown with auto-internal-links (memoized)
  const processedMd = useMemo(() => {
    if (!post) return "";
    return autoLink(post.content_md, lang, post.slug, otherPosts);
  }, [post, lang, otherPosts]);

  const faqs = useMemo(() => post ? extractFaqs(post.content_md) : [], [post]);

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

  // hreflang alternates from siblings
  const alternates: Partial<Record<Lang, string>> = {};
  (Object.keys(siblings) as Lang[]).forEach((l) => {
    alternates[l] = `${l}/blog/${siblings[l]}`;
  });

  // Canonical = always the main slug, even when accessed via alt slug
  const canonicalPath = `${lang}/blog/${post.slug}`;
  const currentPath = `${lang}/blog/${slug}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={post.seo_title}
        description={post.seo_description}
        lang={lang}
        path={currentPath}
        canonicalPath={canonicalPath}
        alternates={alternates}
        type="article"
        image={post.cover_image_url || undefined}
      />
      <Helmet>
        {/* Article schema */}
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
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://klaar-studio.ch/${canonicalPath}` },
            keywords: post.tags?.join(", "),
            inLanguage: lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en",
          })}
        </script>
        {/* Breadcrumb schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: HOME_LABEL[lang], item: `https://klaar-studio.ch/${lang}` },
              { "@type": "ListItem", position: 2, name: JOURNAL_LABEL[lang], item: `https://klaar-studio.ch/${lang}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: `https://klaar-studio.ch/${canonicalPath}` },
            ],
          })}
        </script>
        {/* FAQPage schema (rich-result eligible) */}
        {faqs.length >= 2 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            })}
          </script>
        )}
      </Helmet>

      <PageHeader title="Journal" subtitle="klaar Studio" backTo={`/${lang}/blog`} />

      <main className="flex-1">
        {/* Hero */}
        <header className="container pt-12 md:pt-16 pb-8 max-w-3xl">
          <Link to={`/${lang}/blog`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft size={12} /> {BACK_LABELS[lang]}
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.slice(0, 4).map((tag) => {
              const tagSlug = tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              return (
                <Link
                  key={tag}
                  to={`/${lang}/blog/topic/${tagSlug}`}
                  className="text-[10px] uppercase tracking-widest font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 hover:bg-[hsl(var(--primary))]/20 px-2 py-1 rounded transition-colors"
                >
                  {tag}
                </Link>
              );
            })}
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
              <img
                src={post.cover_image_url}
                alt={post.title}
                width={1600}
                height={900}
                fetchPriority="high"
                className="w-full aspect-[16/9] object-cover bg-muted"
              />
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{processedMd}</ReactMarkdown>
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

        {/* Related posts */}
        {related.length > 0 && (
          <section className="border-t border-border bg-card/30">
            <div className="container max-w-5xl py-12 md:py-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">{RELATED_LABELS[lang]}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/${lang}/blog/${r.slug}`}
                    className="group block rounded-xl overflow-hidden border border-border hover:border-foreground/20 transition-all bg-background"
                  >
                    {r.cover_image_url && (
                      <div className="aspect-[16/10] bg-muted overflow-hidden">
                        <img
                          src={r.cover_image_url}
                          alt={r.title}
                          width={800}
                          height={500}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">{r.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{r.excerpt}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        <Clock size={11} /> {r.reading_time_min} min <ArrowRight size={11} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer t={t} />
      {/* Hidden hint when reached via alt slug — purely informational, not user-visible */}
      {isAltSlug && <link rel="canonical" href={`https://klaar-studio.ch/${canonicalPath}`} />}
    </div>
  );
}
