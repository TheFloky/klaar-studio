import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGS = ["de", "fr", "en"] as const;
type Lang = typeof LANGS[number];

type VersionMeta = {
  title: string;
  seo_title: string;
  seo_description: string;
  excerpt: string;
};

const LANG_NAMES: Record<Lang, string> = {
  de: "German (Swiss conventions: ALWAYS 'ss' instead of 'ß', use 'Sie' form)",
  fr: "French (formal 'vous')",
  en: "English (professional)",
};

const META_SYSTEM = `You are a senior SEO content strategist for "klaar Studio", a Swiss web agency specializing in nDSG-compliant websites, Swiss hosting sovereignty, and AI-driven web performance.

From the user's raw notes, extract shared metadata for a blog post (slug, tags, image query, reading time, external links). Return ONLY via the tool.

Rules:
- slug: kebab-case, ASCII only, no diacritics, max 60 chars, derived from the source-language topic
- tags: 4-8 SEPARATE tags, each 1-3 words MAX. NEVER concatenate multiple tags into one string. Examples: ["nDSG", "Datenschutz", "Cookie Banner"] — NOT ["nDSG Datenschutz Cookie Banner"]
- external_links: 2-4 authoritative sources. Allowed domains: fedlex.admin.ch, edoeb.admin.ch, eur-lex.europa.eu, bag.admin.ch, kmu.admin.ch, admin.ch, europa.eu. Never invent URLs — only use real, verifiable URLs you are confident exist.
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
- Use H2 headings phrased as questions people actually search (e.g. "Brauche ich ein Impressum?", "Comment gérer les cookies ?", "What does FADP require?").
- Do NOT include JSON, frontmatter, or code fences.
- Do NOT include a title line or H1 heading at the top.
- End with a single short CTA paragraph pointing to klaar-studio.ch services.
- Return only the markdown article body.`;

const REVISE_SYSTEM = `You are a senior editor for "klaar Studio". Revise the existing markdown blog article to address the feedback below. Keep the same language, tone, and structure rules (Swiss "ss", "Sie", H2/H3, 800-1400 words, no H1, no frontmatter, end with short CTA). Return ONLY the revised markdown article body.`;

const VERSION_META_SYSTEM = `You are a senior SEO editor for klaar Studio.

Given a completed markdown blog article in one language, return ONLY the metadata via the tool.

CRITICAL TITLE RULES — write for how people actually Google, not corporate brochures:
- title: a natural, conversational headline. Prefer question-form ("Brauche ich für meine Website ein Impressum?", "Comment rendre mon site web conforme à la LPD ?", "Do I need a cookie banner in Switzerland?") or strong how-to/listicle ("5 Schritte zur nDSG-Konformität", "How to make your Swiss website legal in 2026"). Avoid noun-stacked corporate titles like "Schweizer Website: Impressum, Datenschutz & Cookies rechtlich korrekt".
- title ≤ 70 chars
- seo_title ≤ 58 chars (HARD limit — Google truncates at 60). Match the conversational style of the title.
- seo_description ≤ 150 chars (HARD limit — Google truncates at ~160). Include the primary keyword AND a benefit. Active voice.
- excerpt ≤ 200 chars. Hook the reader.
- Use the language's natural search vocabulary (German: "Brauche ich…", "Wie…", "Was…"; French: "Comment…", "Faut-il…", "Dois-je…"; English: "How to…", "Do I need…", "What is…").`;

async function fetchGateway(body: unknown, apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.status === 429) throw new Error("RATE_LIMIT");
  if (response.status === 402) throw new Error("CREDITS_EXHAUSTED");
  if (!response.ok) {
    const text = await response.text();
    console.error("Gateway error", response.status, text);
    throw new Error(`AI gateway error: ${response.status}`);
  }
  return response.json();
}

async function callGatewayTool(body: unknown, apiKey: string) {
  const data = await fetchGateway(body, apiKey);
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    console.error("No tool call in response", JSON.stringify(data).slice(0, 1200));
    throw new Error("AI returned no tool call");
  }
  return JSON.parse(toolCall.function.arguments);
}

async function callGatewayText(body: unknown, apiKey: string) {
  const data = await fetchGateway(body, apiKey);
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    console.error("No text content in response", JSON.stringify(data).slice(0, 1200));
    throw new Error("AI returned empty content");
  }
  return text.trim();
}

async function generateMetadata(sourceText: string, topic: string, sourceLang: Lang, apiKey: string) {
  return callGatewayTool({
    model: "google/gemini-2.5-pro",
    max_completion_tokens: 4000,
    messages: [
      { role: "system", content: META_SYSTEM },
      { role: "user", content: `SOURCE LANGUAGE: ${sourceLang}\nTOPIC: ${topic || "(infer from notes)"}\n\nNOTES:\n"""\n${sourceText}\n"""` },
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
            tags: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
            stock_image_query: { type: "string" },
            reading_time_min: { type: "integer" },
            external_links: {
              type: "array",
              items: {
                type: "object",
                properties: { url: { type: "string" }, label: { type: "string" }, context: { type: "string" } },
                required: ["url", "label", "context"],
              },
            },
          },
          required: ["slug", "tags", "stock_image_query", "reading_time_min", "external_links"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "extract_metadata" } },
  }, apiKey);
}

async function generateArticleBody(sourceText: string, topic: string, lang: Lang, slug: string, apiKey: string) {
  return callGatewayText({
    model: "google/gemini-2.5-pro",
    max_completion_tokens: 12000,
    messages: [
      { role: "system", content: POST_SYSTEM },
      { role: "user", content: `TARGET LANGUAGE: ${LANG_NAMES[lang]}\nSHARED SLUG (do not change): ${slug}\nTOPIC HINT: ${topic || "(infer from notes)"}\n\nWrite the article in ${lang} using the notes below.\n\nNOTES:\n"""\n${sourceText}\n"""` },
    ],
  }, apiKey);
}

async function reviseArticleBody(currentMd: string, feedback: string, lang: Lang, apiKey: string) {
  return callGatewayText({
    model: "google/gemini-2.5-pro",
    max_completion_tokens: 12000,
    messages: [
      { role: "system", content: REVISE_SYSTEM },
      { role: "user", content: `LANGUAGE: ${LANG_NAMES[lang]}\n\nFEEDBACK / IMPROVEMENT POINTS:\n"""\n${feedback}\n"""\n\nCURRENT ARTICLE:\n"""\n${currentMd}\n"""` },
    ],
  }, apiKey);
}

async function generateVersionMeta(content_md: string, lang: Lang, apiKey: string) {
  return callGatewayTool({
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
        description: "Returns the metadata fields for one blog post version.",
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
}

function errorResponse(message: string) {
  if (message === "RATE_LIMIT") {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (message === "CREDITS_EXHAUSTED") {
    return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace settings." }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: message }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const mode: "generate" | "revise" = body.mode || "generate";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (mode === "revise") {
      const { current_md, feedback, lang } = body;
      if (!current_md || !feedback || !lang) {
        return new Response(JSON.stringify({ error: "current_md, feedback, lang required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const content_md = await reviseArticleBody(current_md, feedback, lang as Lang, LOVABLE_API_KEY);
      const meta = await generateVersionMeta(content_md, lang as Lang, LOVABLE_API_KEY) as VersionMeta;
      return new Response(JSON.stringify({ ...meta, content_md }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // mode === "generate" — source language only
    const { sourceText, topic, sourceLang = "de" } = body;
    if (!sourceText || sourceText.length < 30) {
      return new Response(JSON.stringify({ error: "sourceText too short (min 30 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const meta = await generateMetadata(sourceText, topic, sourceLang as Lang, LOVABLE_API_KEY);
    console.log("Metadata generated", { slug: meta.slug });

    const content_md = await generateArticleBody(sourceText, topic, sourceLang as Lang, meta.slug, LOVABLE_API_KEY);
    const versionMeta = await generateVersionMeta(content_md, sourceLang as Lang, LOVABLE_API_KEY) as VersionMeta;

    const versions: Record<string, VersionMeta & { content_md: string }> = {
      [sourceLang]: { ...versionMeta, content_md },
    };

    return new Response(JSON.stringify({ ...meta, versions, sourceLang }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("generate-blog-post error:", message);
    return errorResponse(message);
  }
});
