import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Lang = "de" | "fr" | "en";

const LANG_NAMES: Record<Lang, string> = {
  de: "German (Swiss conventions: ALWAYS 'ss' instead of 'ß', use 'Sie' form)",
  fr: "French (formal 'vous')",
  en: "English (professional)",
};

const TRANSLATE_SYSTEM = `You are a senior bilingual translator for "klaar Studio", a Swiss web agency.

Translate the provided markdown blog article into the target language. Preserve:
- All H2/H3 markdown headings and structure
- All bullet lists, links, code, and emphasis
- Tone: confident, expert, plain-language, Swiss-professional
- The final CTA paragraph

Rules:
- German: Swiss conventions — "ss" instead of "ß" ALWAYS. Use "Sie".
- French: formal "vous".
- English: professional.
- Do NOT add an H1 title or frontmatter.
- Adapt idioms naturally — this is a localization, not a literal translation.
- Return ONLY the translated markdown article body.`;

const VERSION_META_SYSTEM = `You are a senior SEO editor for klaar Studio.

Given a completed markdown blog article in one language, return ONLY the metadata via the tool.

CRITICAL TITLE RULES — write for how people actually Google:
- title: prefer question-form ("Brauche ich…", "Comment…", "Do I need…") or how-to ("How to…", "5 Schritte…"). Avoid noun-stacked corporate titles.
- title ≤ 70 chars
- seo_title ≤ 58 chars (HARD limit)
- seo_description ≤ 150 chars (HARD limit). Include keyword + benefit. Active voice.
- excerpt ≤ 200 chars. Hook the reader.
- Use natural search vocabulary in the target language.

ALT SLUGS — keyword clustering for long-tail SEO:
- Return 6 alt_slugs per language: kebab-case URL variants representing different real-world Google queries that should land on this same article.
- Each slug should reflect a DIFFERENT phrasing or angle: question form, how-to, problem statement, comparison, action.
- ASCII only, no diacritics, max 60 chars. Write fresh native-language slugs — do NOT translate them literally.`;

function sanitizeSlug(s: string): string {
  return String(s)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function fetchGateway(body: unknown, apiKey: string) {
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
  return r.json();
}

async function translateBody(sourceMd: string, sourceLang: Lang, targetLang: Lang, apiKey: string) {
  const data = await fetchGateway({
    model: "google/gemini-2.5-pro",
    max_completion_tokens: 12000,
    messages: [
      { role: "system", content: TRANSLATE_SYSTEM },
      { role: "user", content: `SOURCE LANGUAGE: ${LANG_NAMES[sourceLang]}\nTARGET LANGUAGE: ${LANG_NAMES[targetLang]}\n\nARTICLE:\n"""\n${sourceMd}\n"""` },
    ],
  }, apiKey);
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("AI returned empty translation");
  return text.trim();
}

async function generateVersionMeta(content_md: string, lang: Lang, apiKey: string) {
  const data = await fetchGateway({
    model: "google/gemini-2.5-flash",
    max_completion_tokens: 1500,
    messages: [
      { role: "system", content: VERSION_META_SYSTEM },
      { role: "user", content: `LANGUAGE: ${LANG_NAMES[lang]}\n\nARTICLE:\n"""\n${content_md}\n"""` },
    ],
    tools: [{
      type: "function",
      function: {
        name: "extract_version_meta",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", maxLength: 70 },
            seo_title: { type: "string", maxLength: 58 },
            seo_description: { type: "string", maxLength: 150 },
            excerpt: { type: "string", maxLength: 200 },
          },
          required: ["title", "seo_title", "seo_description", "excerpt"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "extract_version_meta" } },
  }, apiKey);
  const tc = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc) throw new Error("AI returned no tool call");
  return JSON.parse(tc.function.arguments);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { source_md, sourceLang, targetLangs } = await req.json();
    if (!source_md || !sourceLang || !Array.isArray(targetLangs) || targetLangs.length === 0) {
      return new Response(JSON.stringify({ error: "source_md, sourceLang, targetLangs[] required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const entries = await Promise.all(
      (targetLangs as Lang[]).map(async (lang) => {
        const content_md = await translateBody(source_md, sourceLang as Lang, lang, LOVABLE_API_KEY);
        const meta = await generateVersionMeta(content_md, lang, LOVABLE_API_KEY);
        return [lang, { ...meta, content_md }] as const;
      })
    );

    return new Response(JSON.stringify({ versions: Object.fromEntries(entries) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("translate-blog-post error:", message);
    if (message === "RATE_LIMIT") {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (message === "CREDITS_EXHAUSTED") {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
