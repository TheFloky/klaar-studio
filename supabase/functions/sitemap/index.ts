import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://klaar-studio.ch";
const STATIC_PATHS = ["", "/audit", "/maintenance", "/impressum", "/privacy", "/blog"];
const LANGS = ["de", "fr", "en"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, lang, published_at, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const today = new Date().toISOString().split("T")[0];

    let urls = "";

    // Static pages
    for (const lang of LANGS) {
      for (const path of STATIC_PATHS) {
        urls += `  <url>
    <loc>${SITE}/${lang}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${path === "" ? "1.0" : path === "/blog" ? "0.9" : "0.7"}</priority>
  </url>
`;
      }
    }

    // Blog posts
    for (const p of posts || []) {
      const lastmod = (p.updated_at || p.published_at || today).split("T")[0];
      urls += `  <url>
    <loc>${SITE}/${p.lang}/blog/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("sitemap error:", err);
    return new Response(`<?xml version="1.0"?><error>${err}</error>`, {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
