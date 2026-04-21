import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a meticulous fact-checker and legal-compliance reviewer for blog posts about Swiss web development, nDSG/nFADP data protection, GDPR, and Swiss hosting.

Review the provided blog post and:
1. Identify any factual claims that may be inaccurate, outdated, or unverifiable.
2. Verify any law citations (article numbers, dates, official names) — flag if suspicious.
3. Verify external links look like they belong to legitimate authoritative sources (fedlex.admin.ch, edoeb.admin.ch, eur-lex.europa.eu). Flag suspicious or invented URLs.
4. Check Swiss-German conventions: must use "ss" not "ß".
5. Check tone consistency.

Return JSON via the tool with:
- confidence_score (0-100): overall accuracy confidence
- issues: array of concerns with severity (info/warn/critical)
- approved: boolean — true if confidence >= 75 and no critical issues`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, content_md, lang, external_links } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `LANGUAGE: ${lang}
TITLE: ${title}

EXTERNAL LINKS:
${JSON.stringify(external_links || [], null, 2)}

CONTENT:
"""
${content_md}
"""`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "fact_check_result",
            parameters: {
              type: "object",
              properties: {
                confidence_score: { type: "integer", minimum: 0, maximum: 100 },
                approved: { type: "boolean" },
                summary: { type: "string", maxLength: 400 },
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["info", "warn", "critical"] },
                      category: { type: "string", enum: ["factual", "legal-citation", "link", "language", "tone", "other"] },
                      message: { type: "string" },
                      suggestion: { type: "string" },
                    },
                    required: ["severity", "category", "message"],
                  },
                },
              },
              required: ["confidence_score", "approved", "summary", "issues"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "fact_check_result" } },
      }),
    });

    if (response.status === 429 || response.status === 402) {
      const msg = response.status === 429 ? "Rate limit exceeded" : "AI credits exhausted";
      return new Response(JSON.stringify({ error: msg }), { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!response.ok) throw new Error(`AI gateway: ${response.status}`);

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");

    return new Response(toolCall.function.arguments, {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fact-check error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
