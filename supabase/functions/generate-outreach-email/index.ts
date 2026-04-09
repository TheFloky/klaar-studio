const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prospect, language, includeDemoSite, demoSiteUrl, demoSitePassword, auditPdfUrl } = await req.json();

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

    const niche = (prospect.niche || "").toLowerCase();
    const isSensitiveSector = ["medical", "medizin", "arzt", "praxis", "gesundheit", "legal", "recht", "anwalt", "kanzlei", "law"].some(k => niche.includes(k));

    const complianceIssues: string[] = [];
    const cd = prospect.compliance_details;
    if (cd) {
      if (cd.dataResidency === "red") complianceIssues.push("Server in den USA gehostet – Risiko durch den US Cloud Act (nDSG & DSGVO)");
      else if (cd.dataResidency === "yellow") complianceIssues.push("Server in der EU, aber nicht in der Schweiz – Datensouveränität nicht vollständig gewährleistet");
      if (cd.fontLeakage) complianceIssues.push("Google Fonts werden extern geladen – IP-Adressen der Besucher werden ohne Einwilligung an US-Server übermittelt");
      if (cd.trackingTransparency) complianceIssues.push("US-basierte Tracking-Skripte ohne transparente Einwilligungsmechanismen erkannt");
      if (cd.legalPresence === "red") complianceIssues.push("Kein Impressum gefunden – gesetzlich vorgeschrieben nach Art. 3 UWG (CH) und EU-Recht");
      else if (cd.legalPresence === "yellow") complianceIssues.push("Impressum vorhanden, aber unvollständig oder nicht korrekt platziert (Art. 3 UWG)");
    }

    const reputation = prospect.reputation || {};
    const painPoints = reputation.pain_points || [];

    const contactName = prospect.contacts?.[0]?.name || "Geschäftsführer/in";
    const contactRole = prospect.contacts?.[0]?.role || "";

    const demoSection = includeDemoSite && demoSiteUrl
      ? `\n\nINCLUDE DEMO SITE SECTION:
Present a personalized preview/demo site we've prepared. Format it like this:
- Mention that we have prepared a personalized preview of what their refreshed online presence could look like
- Add: "Optimiert für Desktop und Smartphone"
- Place the URL on its own line: ${demoSiteUrl}
${demoSitePassword ? `- Place the password on its own line, bold: **Passwort: ${demoSitePassword}**` : ""}`
      : "";

    const auditSection = auditPdfUrl
      ? `\n\nINCLUDE AUDIT PDF SECTION:
Mention that we have prepared a detailed Compliance-Audit-Bericht (PDF) specifically for their website.
Include this link on its own line: ${auditPdfUrl}
Frame it as: "Den vollständigen Compliance-Audit-Bericht für Ihre Webseite finden Sie hier:"`
      : `\n\nMention that we have prepared a detailed Compliance-Audit-Bericht (PDF) that we can share with them upon request.`;

    const prompt = `You are writing a professional cold outreach email from KLAAR, a Swiss web design and compliance agency (klaar-studio.ch) specializing in creating privacy-compliant, user-friendly websites for Swiss and EU businesses, with a focus on local businesses in and around Basel.

RECIPIENT INFO:
- Company: ${prospect.company_name}
- Contact: ${contactName}${contactRole ? ` (${contactRole})` : ""}
- Industry/Niche: ${prospect.niche || "Unknown"}
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
${auditSection}

WRITE THE EMAIL IN ${(langNames[language] || "German").toUpperCase()}.

CRITICAL GUIDELINES:

1. PERSONAL INTRODUCTION:
- The email MUST begin with a personal introduction from Julian Vidal. Example: "Mein Name ist Julian Vidal und ich leite KLAAR, eine Schweizer Webdesign- und Compliance-Agentur mit Fokus auf lokale Unternehmen in und um Basel."
- Make it warm and personal, as if Julian is personally reaching out.

2. SECTOR-SPECIFIC LANGUAGE:
${isSensitiveSector ? `- This is a ${prospect.niche} business. You MUST include the phrase "besonders schützenswerte Personendaten" (sensitive personal data) when discussing data protection. This carries much higher legal weight in Switzerland for medical/legal sectors.` : ""}
- For SMEs (KMU), use "Datensouveränität" instead of technical jargon like "Data Residency".
- Use accessible business language, not developer jargon.

3. COMPLIANCE SCORE ANCHORING:
- Always mention their specific compliance score (${prospect.compliance_score}%).
- Frame KLAAR's services as the "bridge" to reach 100% compliance — e.g., "Wir können Ihnen helfen, diesen Wert auf 100% zu bringen."

4. UPGRADE NARRATIVE (GENTLE):
- NEVER criticize their current website or make them feel bad about their choices.
- Frame everything as "modernization" and "how a refreshed website can help their business grow".
- Focus on what they gain, not what's wrong.

5. LEGAL ACCURACY:
- For Impressum issues: cite "Art. 3 UWG"
- For data/hosting issues: cite "nDSG (Schweiz)" and "DSGVO (EU)"
- For personal liability: mention "Art. 60 nDSG" and "CHF 250'000 persönliche Haftung"

6. CALL-TO-ACTION:
- Offer a "10-minütiges Telefonat" or "unverbindliches Kennenlernen"
- Use concrete timeframes like "nächste Woche" instead of vague "bald"

7. REGIONAL TONE:
- Use Standard High German but Swiss conventions: "ss" instead of "ß" (e.g., "Grüsse" not "Grüße", "Strasse" not "Straße")
- Close with "Freundliche Grüsse" NOT "Mit freundlichen Grüßen"
- Maintain a Swiss formal but warm tone

8. POSITIONING:
- NEVER mention Poland or that the agency is based in Poland.
- Position as: "Als Schweizer Webdesign- und Compliance-Agentur sind wir darauf spezialisiert, Webseiten für Schweizer und EU-Unternehmen datenschutzkonform und benutzerfreundlich zu gestalten."
- Mention focus on local businesses in and around Basel.

9. ALWAYS include a link to our website: klaar-studio.ch

- Sign off as Julian Vidal, KLAAR
- Email: info@klaar-studio.ch | Telefon: +41 79 750 83 50
- Keep it under 350 words

Return ONLY the email text, no subject line prefix or metadata.`;

    // Generate 3 email variants + 3 subjects in parallel
    const generateOne = async (variant: number) => {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: `You write compelling, professional business emails. You use Swiss German conventions (ss instead of ß). Output only the email body text. This is variant ${variant} of 3 — make each version distinct in tone and structure while following all guidelines. Variant 1: formal and data-driven. Variant 2: warm and relationship-focused. Variant 3: concise and direct.` },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiRes.ok) return { email: "", subject: "" };
      const aiData = await aiRes.json();
      const emailDraft = aiData.choices?.[0]?.message?.content || "";

      // Generate subject
      const subjectRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "Generate a compelling email subject line. Output ONLY the subject line, nothing else. No quotes around it. Use Swiss German conventions (ss instead of ß)." },
            {
              role: "user",
              content: `Write a subject line in ${langNames[language] || "German"} for this cold outreach email to ${prospect.company_name}. The email is about improving their website and fixing data compliance issues we found (score: ${prospect.compliance_score}%). The subject should spark curiosity and feel personally relevant — like a helpful observation, not a sales pitch or a threat. Avoid words like "warning", "urgent", "risk", "danger", "Warnung", "dringend", "Risiko", "Gefahr". Keep it under 60 characters. Variant ${variant}: ${variant === 1 ? "focus on their compliance score" : variant === 2 ? "focus on their business growth" : "ask a thoughtful question about their website"}.`,
            },
          ],
        }),
      });

      let subject = "";
      if (subjectRes.ok) {
        const subData = await subjectRes.json();
        subject = subData.choices?.[0]?.message?.content?.trim() || "";
      }

      return { email: emailDraft, subject };
    };

    console.log("Generating 3 email variants in parallel...");
    const [v1, v2, v3] = await Promise.all([generateOne(1), generateOne(2), generateOne(3)]);

    const variants = [v1, v2, v3].filter(v => v.email);

    return new Response(JSON.stringify({
      success: true,
      variants,
      // Keep backward compat
      email: variants[0]?.email || "",
      subject: variants[0]?.subject || "",
    }), {
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
