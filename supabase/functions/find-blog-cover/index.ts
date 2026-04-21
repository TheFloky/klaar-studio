import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PexelsPhoto {
  id: number;
  src: { large2x: string; large: string; original: string };
  photographer: string;
  photographer_url: string;
  alt: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, fallbackToAi = true } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "query required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PEXELS_KEY = Deno.env.get("PEXELS_API_KEY");
    let stockResults: any[] = [];

    if (PEXELS_KEY) {
      try {
        const pexResp = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
          { headers: { Authorization: PEXELS_KEY } },
        );
        if (pexResp.ok) {
          const pexData = await pexResp.json();
          stockResults = (pexData.photos as PexelsPhoto[] || []).map((p) => ({
            url: p.src.large2x,
            thumb: p.src.large,
            attribution: `Photo by ${p.photographer} on Pexels`,
            attribution_url: p.photographer_url,
            source: "pexels" as const,
            alt: p.alt,
          }));
        } else {
          console.warn("Pexels error:", pexResp.status, await pexResp.text());
        }
      } catch (e) {
        console.warn("Pexels fetch failed:", e);
      }
    }

    let aiImage: { url: string; source: "ai" } | null = null;

    // AI fallback only if no stock results AND fallback is requested
    if (stockResults.length === 0 && fallbackToAi) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{
                role: "user",
                content: `Editorial blog cover photo, professional quality, 16:9 widescreen composition: ${query}. Cinematic lighting, modern minimal aesthetic, suitable for a Swiss tech/legal publication.`,
              }],
              modalities: ["image", "text"],
            }),
          });
          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            if (imageUrl) aiImage = { url: imageUrl, source: "ai" };
          }
        } catch (e) {
          console.warn("AI image fallback failed:", e);
        }
      }
    }

    return new Response(JSON.stringify({ stock: stockResults, ai: aiImage }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("find-blog-cover error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
