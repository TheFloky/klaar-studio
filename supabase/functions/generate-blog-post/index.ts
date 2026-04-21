import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a senior SEO content strategist and bilingual technical writer for "klaar Studio", a Swiss web agency specializing in nDSG-compliant websites, Swiss hosting sovereignty, and AI-driven web performance.

Your job: take the user's raw notes/input and produce a publication-ready blog post in the requested SOURCE language, then translate it to the other two languages.

Rules:
- Tone: confident, expert, plain-language. No fluff. Swiss-professional.
- German: use Swiss German conventions — "ss" instead of "ß" ALWAYS. Use "Sie" form.
- Length: 800–1400 words.
- Structure: clear H2/H3 markdown headings, short paragraphs, bullet lists, scannable.
- SEO: keyword-rich title (≤60 chars), meta description (≤155 chars), descriptive slug (kebab-case, ASCII only, no diacritics, max 60 chars), 4–8 relevant tags.
- Add 1–3 outbound links MAX to high-authority Swiss/EU legal sources (fedlex.admin.ch, edoeb.admin.ch, eur-lex.europa.eu) ONLY where contextually accurate. Never invent URLs.
- Add an internal link suggestion if relevant (e.g. /audit, /maintenance).
- Include a single short call-to-action paragraph at the end pointing to klaar-studio.ch services.
- The slug MUST be identical across all 3 languages (use the source-language slug).
- Generate a vivid, concise stock-photo search query (3-5 English words) that visually represents the topic.
- Reading time in minutes (integer, ~200 words/min).

Return ONLY a JSON object via the provided tool — no other text.`;

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

    const userPrompt = `SOURCE LANGUAGE: ${sourceLang}
TOPIC HINT: ${topic || "(infer from notes)"}

USER NOTES / RAW INPUT:
"""
${sourceText}
"""

Produce the blog post in ${sourceLang}, then translate to the other two of (de, fr, en). Use the same slug across languages.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "publish_blog_post",
            description: "Returns the blog post in 3 languages plus shared metadata.",
            parameters: {
              type: "object",
              properties: {
                slug: { type: "string", description: "Shared kebab-case slug, ASCII only, max 60 chars" },
                tags: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 8 },
                stock_image_query: { type: "string", description: "3-5 English words describing visual" },
                reading_time_min: { type: "integer", minimum: 2, maximum: 20 },
                external_links: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: { type: "string" },
                      label: { type: "string" },
                      context: { type: "string", description: "Why this link is relevant" }
                    },
                    required: ["url", "label", "context"],
                  },
                  maxItems: 3,
                },
                versions: {
                  type: "object",
                  properties: {
                    de: { "$ref": "#/$defs/version" },
                    fr: { "$ref": "#/$defs/version" },
                    en: { "$ref": "#/$defs/version" },
                  },
                  required: ["de", "fr", "en"],
                },
              },
              required: ["slug", "tags", "stock_image_query", "reading_time_min", "external_links", "versions"],
              "$defs": {
                version: {
                  type: "object",
                  properties: {
                    title: { type: "string", maxLength: 80 },
                    seo_title: { type: "string", maxLength: 60 },
                    seo_description: { type: "string", maxLength: 160 },
                    excerpt: { type: "string", maxLength: 220 },
                    content_md: { type: "string", description: "Full blog body in markdown, 800-1400 words" },
                  },
                  required: ["title", "seo_title", "seo_description", "excerpt", "content_md"],
                }
              }
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "publish_blog_post" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace settings." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("Gateway error", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned by AI");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-blog-post error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
