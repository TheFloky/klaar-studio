const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    let hostname: string;
    try {
      hostname = new URL(targetUrl).hostname;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [scrapeRes, ipRes] = await Promise.all([
      fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ["html"],
          onlyMainContent: false,
        }),
      }),
      fetch(`http://ip-api.com/json/${hostname}?fields=status,country,countryCode,query`),
    ]);

    // Process IP geolocation
    let dataResidency = false;
    let ipInfo: { country?: string; countryCode?: string; ip?: string } = {};
    try {
      const ipData = await ipRes.json();
      if (ipData.status === "success") {
        dataResidency = ipData.countryCode === "CH";
        ipInfo = {
          country: ipData.country,
          countryCode: ipData.countryCode,
          ip: ipData.query,
        };
      }
    } catch {
      console.error("IP geolocation failed");
    }

    // Process HTML scrape
    let fontLeakage = false;
    let trackingTransparency = false;
    let legalPresence = false;
    let fontsFound: string[] = [];
    let trackersFound: string[] = [];
    let siteTitle = "";
    let siteDescription = "";

    try {
      const scrapeData = await scrapeRes.json();
      const html = scrapeData?.data?.html || scrapeData?.html || "";
      const htmlLower = html.toLowerCase();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) siteTitle = titleMatch[1].trim();

      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
      if (descMatch) siteDescription = descMatch[1].trim();

      // Check for Google Fonts
      if (htmlLower.includes("fonts.googleapis.com") || htmlLower.includes("fonts.gstatic.com")) {
        fontLeakage = true;
        if (htmlLower.includes("fonts.googleapis.com")) fontsFound.push("fonts.googleapis.com");
        if (htmlLower.includes("fonts.gstatic.com")) fontsFound.push("fonts.gstatic.com");
      }

      // Check for tracking scripts
      if (htmlLower.includes("google-analytics.com") || htmlLower.includes("googletagmanager.com")) {
        trackingTransparency = true;
        if (htmlLower.includes("google-analytics.com")) trackersFound.push("google-analytics.com");
        if (htmlLower.includes("googletagmanager.com")) trackersFound.push("googletagmanager.com");
      }

      // Check for Impressum
      if (htmlLower.includes("impressum")) {
        legalPresence = true;
      }
    } catch (e) {
      console.error("HTML scan failed:", e);
    }

    const results = {
      dataResidency,
      fontLeakage,
      trackingTransparency,
      legalPresence,
      details: {
        ip: ipInfo,
        fontsFound,
        trackersFound,
        siteTitle,
        siteDescription,
      },
    };

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Scan failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
