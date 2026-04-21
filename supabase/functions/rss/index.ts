import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://klaar-studio.ch";

const TITLES: Record<string, string> = {
  de: "klaar Studio Journal",
  fr: "klaar Studio Journal",
  en: "klaar Studio Journal",
};
const DESCS: Record<string, string> = {
  de: "Einblicke zu Schweizer Web-Compliance, Performance und souveräner Technologie.",
  fr: "Réflexions sur la conformité web suisse, la performance et la technologie souveraine.",
  en: "Insights on Swiss web compliance, performance, and sovereign technology.",
};

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const lang = (["de", "fr", "en"].includes(url.searchParams.get("lang") || "")
      ? url.searchParams.get("lang")
      : "de") as string;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, published_at, cover_image_url, tags")
      .eq("status", "published")
      .eq("lang", lang)
      .order("published_at", { ascending: false })
      .limit(50);

    const now = new Date().toUTCString();
    const items = (posts || []).map((p) => {
      const link = `${SITE}/${lang}/blog/${p.slug}`;
      const pubDate = p.published_at ? new Date(p.published_at).toUTCString() : now;
      const cats = (p.tags || []).map((c: string) => `      <category>${escapeXml(c)}</category>`).join("\n");
      const enclosure = p.cover_image_url
        ? `      <enclosure url="${escapeXml(p.cover_image_url)}" type="image/jpeg" />`
        : "";
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.excerpt || "")}</description>
${enclosure}
${cats}
    </item>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(TITLES[lang])}</title>
    <link>${SITE}/${lang}/blog</link>
    <atom:link href="${SITE}/rss.xml?lang=${lang}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(DESCS[lang])}</description>
    <language>${lang === "de" ? "de-CH" : lang === "fr" ? "fr-CH" : "en"}</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("rss error:", err);
    return new Response(`<?xml version="1.0"?><error>${err}</error>`, {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
