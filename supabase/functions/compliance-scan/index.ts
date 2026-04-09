const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// EU/EEA country codes
const EU_EEA_CODES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
  "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
  "IS","LI","NO"
]);

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

    // Also try to scrape /impressum and /kontakt pages where emails typically live
    const baseUrl = new URL(targetUrl);
    const subpageUrls = [
      `${baseUrl.origin}/impressum`,
      `${baseUrl.origin}/kontakt`,
      `${baseUrl.origin}/contact`,
      `${baseUrl.origin}/about`,
    ];

    const subpageFetches = subpageUrls.map(u =>
      fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: u, formats: ["html"], onlyMainContent: false }),
      }).catch(() => null)
    );

    const [scrapeRes, ipRes, ...subpageResults] = await Promise.all([
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
      ...subpageFetches,
    ]);

    // Process IP geolocation — 3-state: "green" | "yellow" | "red"
    let dataResidency: "green" | "yellow" | "red" = "red";
    let ipInfo: { country?: string; countryCode?: string; ip?: string } = {};
    try {
      const ipData = await ipRes.json();
      if (ipData.status === "success") {
        const cc = ipData.countryCode;
        if (cc === "CH") {
          dataResidency = "green";
        } else if (EU_EEA_CODES.has(cc)) {
          dataResidency = "yellow";
        } else {
          dataResidency = "red";
        }
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
    let fontsFound: string[] = [];
    let trackingTransparency = false;
    let trackersFound: string[] = [];
    let siteTitle = "";
    let siteDescription = "";

    // Legal presence — 3-state
    let legalPresence: "green" | "yellow" | "red" = "red";
    let legalDetails: {
      hasImpressumLink: boolean;
      impressumInFooter: boolean;
      hasAddress: boolean;
      hasEmail: boolean;
      hasVatId: boolean;
      hasCompanyName: boolean;
    } = {
      hasImpressumLink: false,
      impressumInFooter: false,
      hasAddress: false,
      hasEmail: false,
      hasVatId: false,
      hasCompanyName: false,
    };

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

      // --- Legal Presence Analysis ---
      // Check for any Impressum link
      const impressumLinkRegex = /<a[^>]*href=["'][^"']*impressum[^"']*["'][^>]*>/i;
      const hasImpressumLink = impressumLinkRegex.test(html) || htmlLower.includes(">impressum<");
      legalDetails.hasImpressumLink = hasImpressumLink;

      // Check if Impressum link is in the footer
      const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
      if (footerMatch) {
        const footerLower = footerMatch[0].toLowerCase();
        legalDetails.impressumInFooter = footerLower.includes("impressum");
      }

      // Check for legal info indicators (address, email, VAT)
      // Address: look for patterns like street numbers, postal codes
      const addressPatterns = [
        /\d{4,5}\s+\w/,  // postal code
        /str(aße|asse|\.)\s/i,
        /weg\s+\d/i,
        /platz\s+\d/i,
        /ulica|ul\./i,
      ];
      legalDetails.hasAddress = addressPatterns.some(p => p.test(html));

      // Email
      legalDetails.hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(html);

      // VAT/UID
      const vatPatterns = [
        /CHE[-\s]?\d{3}[\.\s]?\d{3}[\.\s]?\d{3}/i,  // Swiss UID
        /\b[A-Z]{2}\d{8,12}\b/,  // EU VAT
        /uid|vat|mwst|ust-id|ust\.?-?id/i,
      ];
      legalDetails.hasVatId = vatPatterns.some(p => p.test(html));

      // Company name (look for common legal forms)
      const companyPatterns = [
        /gmbh|ag\b|ltd|s\.r\.o|sp\.\s*z\s*o\.o|inc\b|corp\b|sarl|sàrl|sa\b/i,
      ];
      legalDetails.hasCompanyName = companyPatterns.some(p => p.test(html));

      // Determine legal presence status
      if (legalDetails.impressumInFooter && legalDetails.hasAddress && legalDetails.hasEmail) {
        legalPresence = "green";
      } else if (hasImpressumLink || (legalDetails.hasAddress && legalDetails.hasEmail)) {
        legalPresence = "yellow";
      } else {
        legalPresence = "red";
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
        legalDetails,
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
