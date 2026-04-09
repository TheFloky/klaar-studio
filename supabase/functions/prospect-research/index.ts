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
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "Firecrawl not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    let hostname: string;
    try {
      hostname = new URL(targetUrl).hostname;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Scrape website + IP geolocation + crawl for more pages
    const [scrapeRes, ipRes, mapRes] = await Promise.all([
      fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ["markdown", "html"],
          onlyMainContent: false,
        }),
      }),
      fetch(`http://ip-api.com/json/${hostname}?fields=status,country,countryCode,query`),
      fetch("https://api.firecrawl.dev/v1/map", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: targetUrl,
          limit: 50,
          includeSubdomains: false,
        }),
      }),
    ]);

    const scrapeData = await scrapeRes.json();
    const ipData = await ipRes.json();
    const mapData = await mapRes.json();

    const mainHtml = scrapeData?.data?.html || scrapeData?.html || "";
    const mainMarkdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
    const sitePages = mapData?.links || [];

    // Step 2: Scrape key subpages
    const importantPages = sitePages
      .filter((p: string) =>
        /about|ueber|über|kontakt|contact|team|impressum|legal|datenschutz|privacy/i.test(p)
      )
      .slice(0, 4);

    let subpageContent = "";
    if (importantPages.length > 0) {
      try {
        const subScrapes = await Promise.all(
          importantPages.map((pageUrl: string) =>
            fetch("https://api.firecrawl.dev/v1/scrape", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: pageUrl,
                formats: ["markdown"],
                onlyMainContent: true,
              }),
            }).then((r) => r.json())
          )
        );
        subpageContent = subScrapes
          .map((d: any, i: number) => {
            const md = d?.data?.markdown || d?.markdown || "";
            return `--- Page: ${importantPages[i]} ---\n${md.slice(0, 2000)}`;
          })
          .join("\n\n");
      } catch (e) {
        console.error("Subpage scrape failed:", e);
      }
    }

    // Step 3: Run compliance scan logic inline
    const htmlLower = mainHtml.toLowerCase();
    let dataResidency: "green" | "yellow" | "red" = "red";
    const EU_EEA_CODES = new Set([
      "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
      "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
      "IS","LI","NO",
    ]);

    let ipInfo: any = {};
    if (ipData.status === "success") {
      const cc = ipData.countryCode;
      if (cc === "CH") dataResidency = "green";
      else if (EU_EEA_CODES.has(cc)) dataResidency = "yellow";
      ipInfo = { country: ipData.country, countryCode: ipData.countryCode, ip: ipData.query };
    }

    const fontLeakage = htmlLower.includes("fonts.googleapis.com") || htmlLower.includes("fonts.gstatic.com");
    const trackingTransparency = htmlLower.includes("google-analytics.com") || htmlLower.includes("googletagmanager.com");

    const impressumLinkRegex = /<a[^>]*href=["'][^"']*impressum[^"']*["'][^>]*>/i;
    const hasImpressumLink = impressumLinkRegex.test(mainHtml) || htmlLower.includes(">impressum<");
    const footerMatch = mainHtml.match(/<footer[\s\S]*?<\/footer>/i);
    const impressumInFooter = footerMatch ? footerMatch[0].toLowerCase().includes("impressum") : false;
    const hasAddress = [/\d{4,5}\s+\w/, /str(aße|asse|\.)\s/i, /ulica|ul\./i].some((p) => p.test(mainHtml));
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(mainHtml);
    const hasVatId = [/CHE[-\s]?\d{3}[\.\s]?\d{3}[\.\s]?\d{3}/i, /\b[A-Z]{2}\d{8,12}\b/].some((p) => p.test(mainHtml));

    let legalPresence: "green" | "yellow" | "red" = "red";
    if (impressumInFooter && hasAddress && hasEmail) legalPresence = "green";
    else if (hasImpressumLink || (hasAddress && hasEmail)) legalPresence = "yellow";

    const passCount = [
      dataResidency === "green" ? 1 : dataResidency === "yellow" ? 0.5 : 0,
      fontLeakage ? 0 : 1,
      trackingTransparency ? 0 : 1,
      legalPresence === "green" ? 1 : legalPresence === "yellow" ? 0.5 : 0,
    ].reduce((a, b) => a + b, 0);
    const complianceScore = Math.round((passCount / 4) * 100);

    const complianceDetails = {
      dataResidency,
      fontLeakage,
      trackingTransparency,
      legalPresence,
      details: {
        ip: ipInfo,
        fontsFound: fontLeakage ? ["fonts.googleapis.com"] : [],
        trackersFound: trackingTransparency ? ["googletagmanager.com"] : [],
        legalDetails: { hasImpressumLink, impressumInFooter, hasAddress, hasEmail, hasVatId },
      },
    };

    // Step 4: Run AI analysis 3 times in parallel for accuracy
    const allContent = `
MAIN PAGE CONTENT:
${mainMarkdown.slice(0, 4000)}

SUBPAGE CONTENT:
${subpageContent.slice(0, 6000)}

SITE PAGES FOUND:
${sitePages.slice(0, 30).join("\n")}

COMPLIANCE FINDINGS:
- Server Location: ${ipInfo.country || "Unknown"} (${dataResidency})
- Google Fonts leaking data: ${fontLeakage}
- US tracking scripts: ${trackingTransparency}
- Legal presence (Impressum): ${legalPresence}
- Compliance score: ${complianceScore}%
    `.trim();

    const aiPrompt = `You are a business intelligence analyst. Analyze this website data and extract a comprehensive company profile.

${allContent}

Return a JSON object with these exact fields:
{
  "company_name": "official company name",
  "niche": "industry/niche (1-2 words)",
  "description": "2-3 sentence company description",
  "website_language": "detected primary language code (de, en, fr, it, etc.)",
  "contacts": [
    {
      "name": "person name if found",
      "role": "their role/title",
      "email": "their email if found",
      "phone": "phone if found"
    }
  ],
  "general_email": "general contact email",
  "general_phone": "general phone number",
  "financials": {
    "estimated_size": "small/medium/large",
    "estimated_employees": "range like 1-10, 10-50, etc.",
    "estimated_revenue": "rough estimate if determinable",
    "funding_info": "any funding/investment info"
  },
  "reputation": {
    "website_quality": "poor/average/good/excellent - based on content quality and structure",
    "digital_maturity": "low/medium/high - how modern is their digital presence",
    "pain_points": ["list of visible issues with their website/digital presence"],
    "strengths": ["what they do well"]
  },
  "client_quality_score": {
    "score": 0-100,
    "website_condition": 0-100,
    "outreach_likelihood": 0-100,
    "budget_potential": 0-100,
    "reasoning": "1-2 sentence explanation of the score"
  },
  "reputation_score": {
    "score": 0-100,
    "google_rating_estimate": "estimated Google Maps rating if determinable (e.g. 4.2/5), or null",
    "trust_signals": ["list of trust signals found: certifications, awards, partnerships, longevity, etc."],
    "red_flags": ["any negative signals: outdated info, broken links, no reviews, etc."],
    "reasoning": "1-2 sentence explanation"
  },
  "research_summary": "A 3-5 sentence executive summary of this company, their market position, digital maturity, and key opportunities for us to help them."
}

SCORING GUIDELINES:
- client_quality_score.website_condition: How bad/outdated is the website? Higher = worse condition = more need for our services.
- client_quality_score.outreach_likelihood: How likely are they to respond positively to a cold email?
- client_quality_score.budget_potential: How likely they can afford a professional website (CHF 2500-15000+)?
- client_quality_score.score: Weighted average (40% website_condition + 30% outreach_likelihood + 30% budget_potential).
- reputation_score.score: Overall reputation estimate (0-100).

Be thorough but only include data you can actually verify from the content. For missing data, use null.`;

    const callAI = async () => {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a precise business analyst. Always respond with valid JSON only, no markdown fences." },
            { role: "user", content: aiPrompt },
          ],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      try {
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    };

    // Run 3 scans in parallel
    console.log("Running 3 AI scans in parallel...");
    const [scan1, scan2, scan3] = await Promise.all([callAI(), callAI(), callAI()]);
    const scans = [scan1, scan2, scan3].filter(Boolean);

    if (scans.length === 0) {
      return new Response(JSON.stringify({ error: "All AI scans failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Merge results using AI
    let companyIntel: any;
    if (scans.length === 1) {
      companyIntel = scans[0];
    } else {
      const mergePrompt = `You are merging ${scans.length} independent analyses of the same company into one definitive profile.

SCAN RESULTS:
${scans.map((s, i) => `--- Scan ${i + 1} ---\n${JSON.stringify(s, null, 2)}`).join("\n\n")}

MERGE RULES:
1. For text fields (company_name, niche, description): pick the most detailed/accurate version
2. For contacts: merge all unique contacts, prefer entries with more complete info
3. For scores (0-100): take the AVERAGE of all scans, rounded to nearest integer
4. For arrays (pain_points, strengths, trust_signals, red_flags): merge unique items, remove duplicates
5. For financial estimates: pick the most conservative/realistic estimate
6. For research_summary: write a new summary that incorporates the best insights from all scans

Return a single merged JSON object with the exact same structure.`;

      const mergeRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You merge business intelligence data. Always respond with valid JSON only, no markdown fences." },
            { role: "user", content: mergePrompt },
          ],
        }),
      });

      if (mergeRes.ok) {
        const mergeData = await mergeRes.json();
        const mergeContent = mergeData.choices?.[0]?.message?.content || "";
        try {
          const cleaned = mergeContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          companyIntel = JSON.parse(cleaned);
        } catch {
          companyIntel = scans[0]; // fallback to first scan
        }
      } else {
        companyIntel = scans[0];
      }
    }

    const result = {
      company_name: companyIntel.company_name || hostname,
      niche: companyIntel.niche || null,
      description: companyIntel.description || null,
      website_language: companyIntel.website_language || "de",
      contacts: companyIntel.contacts || [],
      general_email: companyIntel.general_email || null,
      general_phone: companyIntel.general_phone || null,
      financials: companyIntel.financials || {},
      reputation: {
        ...(companyIntel.reputation || {}),
        client_quality_score: companyIntel.client_quality_score || null,
        reputation_score: companyIntel.reputation_score || null,
      },
      research_summary: companyIntel.research_summary || null,
      compliance_score: complianceScore,
      compliance_details: complianceDetails,
      site_pages: sitePages.slice(0, 20),
      scan_count: scans.length,
    };

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Research error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Research failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
