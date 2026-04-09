const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prospect, language, includeDemoSite, demoSiteUrl, demoSitePassword } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langNames: Record<string, string> = {
      de: "German",
      en: "English",
      fr: "French",
      it: "Italian",
    };

    const complianceIssues: string[] = [];
    const cd = prospect.compliance_details;
    if (cd) {
      if (cd.dataResidency === "red") complianceIssues.push("Server hosted in the USA (US Cloud Act risk, nFADP/GDPR non-compliance)");
      else if (cd.dataResidency === "yellow") complianceIssues.push("Server hosted in EU but not Switzerland (adequate but lacks Swiss data sovereignty)");
      if (cd.fontLeakage) complianceIssues.push("Google Fonts loaded externally (IP addresses leaked to US servers without consent)");
      if (cd.trackingTransparency) complianceIssues.push("US-based tracking scripts detected without transparent consent mechanisms");
      if (cd.legalPresence === "red") complianceIssues.push("No Impressum / legal notice found (legally required under EU and Swiss law)");
      else if (cd.legalPresence === "yellow") complianceIssues.push("Impressum exists but is incomplete or not properly placed");
    }

    const reputation = prospect.reputation || {};
    const painPoints = reputation.pain_points || [];

    const contactName = prospect.contacts?.[0]?.name || "Geschäftsführer/in";
    const contactRole = prospect.contacts?.[0]?.role || "";

    const demoSection = includeDemoSite && demoSiteUrl
      ? `\n\nIMPORTANT: Include a section about a personalized demo/preview site we've prepared for them. The URL is: ${demoSiteUrl} and the access password is: ${demoSitePassword || "none"}. Present this as a preview of what their refreshed online presence could look like.`
      : "";

    const prompt = `You are writing a professional cold outreach email from klaar-Studio, a Swiss web design and compliance agency specializing in creating privacy-compliant, user-friendly websites for Swiss and EU businesses, with a focus on local businesses in and around Basel.

RECIPIENT INFO:
- Company: ${prospect.company_name}
- Contact: ${contactName}${contactRole ? ` (${contactRole})` : ""}
- Industry: ${prospect.niche || "Unknown"}
- Website: ${prospect.website}
- Company description: ${prospect.description || "N/A"}
- Current website quality: ${reputation.website_quality || "Unknown"}
- Digital maturity: ${reputation.digital_maturity || "Unknown"}

COMPLIANCE ISSUES FOUND (use as the email hook):
${complianceIssues.length > 0 ? complianceIssues.map((i) => `- ${i}`).join("\n") : "- No critical issues found"}
Compliance Score: ${prospect.compliance_score}%

ADDITIONAL PAIN POINTS:
${painPoints.length > 0 ? painPoints.map((p: string) => `- ${p}`).join("\n") : "- None identified"}

${demoSection}

WRITE THE EMAIL IN ${(langNames[language] || "German").toUpperCase()}.

GUIDELINES:
- Start with a personalized hook about their specific compliance issues (this creates urgency)
- Be specific about THEIR problems, not generic
- Transition naturally to how a website refresh would solve both compliance AND business goals
- Mention that klaar-Studio specializes in Swiss data protection standards (nDSG) and GDPR compliance
- NEVER mention Poland or that the agency is based in Poland. Position the agency as a Swiss compliance-focused web agency based around Basel.
- Keep it professional but warm, not salesy
- End with a clear call to action (suggest a brief call)
- Sign off as Julian Vidal, klaar-Studio
- Email: info@klaar-studio.ch, Phone: +41 79 750 83 50
- Keep it under 300 words

Return ONLY the email text, no subject line prefix or metadata.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You write compelling business emails. Output only the email body text." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "Email generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const emailDraft = aiData.choices?.[0]?.message?.content || "";

    // Also generate a subject line
    const subjectRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Generate a compelling email subject line. Output ONLY the subject line, nothing else." },
          {
            role: "user",
            content: `Write a subject line in ${langNames[language] || "German"} for this cold outreach email about data compliance issues found on ${prospect.company_name}'s website. Make it intriguing but professional, mentioning compliance/data protection. Under 60 characters.`,
          },
        ],
      }),
    });

    let subject = "";
    if (subjectRes.ok) {
      const subData = await subjectRes.json();
      subject = subData.choices?.[0]?.message?.content?.trim() || "";
    }

    return new Response(JSON.stringify({ success: true, email: emailDraft, subject }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
