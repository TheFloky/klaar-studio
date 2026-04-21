import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGS = ["de", "fr", "en"] as const;
type Lang = typeof LANGS[number];

const LANG_NAMES: Record<Lang, string> = {
  de: "German (Swiss conventions: ALWAYS 'ss' instead of 'ß', use 'Sie' form)",
  fr: "French (formal 'vous')",
  en: "English (professional)",
};

const META_SYSTEM = `You are a senior SEO content strategist for "klaar Studio", a Swiss web agency specializing in nDSG-compliant websites, Swiss hosting sovereignty, and AI-driven web performance.

From the user's raw notes, extract shared metadata for a blog post (slug, tags, image query, reading time, external links). Return ONLY via the tool.

Rules:
- slug: kebab-case, ASCII only, no diacritics, max 60 chars, derived from the source-language topic
- tags: 4-8 relevant
- external_links: 1-3 MAX, only fedlex.admin.ch, edoeb.admin.ch, eur-lex.europa.eu — never invent URLs. Empty array is OK.
- stock_image_query: 3-5 English words for stock photo search
- reading_time_min: integer (~200 words/min), assume 1000 words`;

const POST_SYSTEM = `You are a senior bilingual technical writer for "klaar Studio", a Swiss web agency.

Write a publication-ready blog post in the requested language from the user's notes.

Rules:
- Tone: confident, expert, plain-language, Swiss-professional. No fluff.
- German: Swiss conventions — "ss" instead of "ß" ALWAYS. Use "Sie".
- French: formal "vous".
- Length: 800-1400 words.
- Structure: clear H2/H3 markdown headings, short paragraphs, bullet lists.
- End with a single short CTA paragraph pointing to klaar-studio.ch services.
- title ≤ 80 chars, seo_title ≤ 60 chars, seo_description ≤ 155 chars, excerpt ≤ 220 chars.
- content_md is the full body in markdown.

Return ONLY via the tool.`;

async function callGateway(body: unknown, apiKey: string) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (r.status === 402) throw new Error("CREDITS_EXHAUSTED");
  if (!r.ok) {
    const t = await r.text();
    console.error("Gateway error", r.status, t);
    throw new Error(`AI gateway error: ${r.status}`);
  }
  const data = await r.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    console.error("No tool call in response", JSON.stringify(data).slice(0, 500));
    throw new Error("AI returned no tool call");
  }
  return JSON.parse(toolCall.function.arguments);
}

async function generateMetadata(sourceText: string, topic: string, sourceLang: Lang, apiKey: string) {
  return callGateway({
    model: "google/gemini-2.5-pro",
    max_completion_tokens: 4000,
    messages: [
      { role: "system", content: META_SYSTEM },
      { role: "user", content: `SOURCE LANG: ${sourceLang}\nTOPIC: ${topic || "(infer)"}\n\nNOTES:\n"""\n${sourceText}\n"""` },
    ],
    tools: [{
      type: "function",
      function: {
        name: "extract_metadata",
        description: "Shared metadata for the multilingual blog post.",
        parameters: {
          type: "object",
          properties: {
            slug: { type: "string", description: "kebab-case, ASCII only, max 60 chars" },
            tags: { type: "array", items: { type: "string" } },
            stock_image_query: { type: "string" },
            reading_time_min: { type: "integer" },
            external_links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  label: { type: "string" },
                  context: { type: "string" },
                },
                required: ["url", "label", "context"],
              },
            },
          },
          required: ["slug", "tags", "stock_image_query", "reading_time_min", "external_links"],
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "extract_metadata" } },
  }, apiKey);
}

async function generateVersion(sourceText: string, topic: string, lang: Lang, sourceLang: Lang, slug: string, apiKey: string) {
  const isSource = lang === sourceLang;
  const userPrompt = `TARGET LANGUAGE: ${LANG_NAMES[lang]}
SLUG (must match across languages, do not change): ${slug}
TOPIC HINT: ${topic || "(infer from notes)"}

${isSource ? "Write the blog post" : `The source language is ${sourceLang}. Translate and adapt the post into ${lang}, keeping the same structure and meaning`} from the notes below.

NOTES:
"""
${sourceText}
"""`;

  return callGateway({
    model: "google/gemini-2.5-pro",
    max_completion_tokens: 16000,
    messages: [
      { role: "system", content: POST_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    tools: [{
      type: "function",
      function: {
        name: "write_post_version",
        description: "Returns the blog post in one language.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            seo_title: { type: "string" },
            seo_description: { type: "string" },
            excerpt: { type: "string" },
            content_md: { type: "string", description: "Full blog body in markdown, 800-1400 words" },
          },
          required: ["title", "seo_title", "seo_description", "excerpt", "content_md"],
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "write_post_version" } },
  }, apiKey);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sourceText, topic, sourceLang = "de" } = await req.json();
    if (!sourceText || sourceText.length < 30) {
      return new Response(JSON.stringify({ error: "sourceText too short (min 30 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // 1) Metadata
    const meta = await generateMetadata(sourceText, topic, sourceLang as Lang, LOVABLE_API_KEY);
    console.log("Metadata generated, slug:", meta.slug);

    // 2) Generate all 3 versions in parallel (each in its own request)
    const versionEntries = await Promise.all(
      LANGS.map(async (lang) => {
        const v = await generateVersion(sourceText, topic, lang, sourceLang as Lang, meta.slug, LOVABLE_API_KEY);
        console.log(`Version ${lang} done: title="${v.title?.slice(0, 50)}", body=${v.content_md?.length || 0} chars`);
        return [lang, v] as const;
      })
    );

    const versions = Object.fromEntries(versionEntries) as Record<Lang, unknown>;

    return new Response(JSON.stringify({ ...meta, versions }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("generate-blog-post error:", msg);
    if (msg === "RATE_LIMIT") {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (msg === "CREDITS_EXHAUSTED") {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace settings." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
