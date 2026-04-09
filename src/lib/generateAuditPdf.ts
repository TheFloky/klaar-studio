import jsPDF from "jspdf";
import { INTER_REGULAR, INTER_BOLD } from "./interFontData";

function registerFonts(doc: jsPDF) {
  doc.addFileToVFS("Inter-Regular.ttf", INTER_REGULAR);
  doc.addFont("Inter-Regular.ttf", "Inter", "normal");
  doc.addFileToVFS("Inter-Bold.ttf", INTER_BOLD);
  doc.addFont("Inter-Bold.ttf", "Inter", "bold");
}

export interface AuditPdfData {
  targetUrl: string;
  siteTitle?: string;
  companyName?: string;
  score: number;
  dataResidency: string; // "green" | "yellow" | "red"
  fontLeakage: boolean;
  trackingTransparency: boolean;
  legalPresence: string; // "green" | "yellow" | "red"
  details?: {
    ip?: { country?: string; countryCode?: string; ip?: string };
    fontsFound?: string[];
    trackersFound?: string[];
    legalDetails?: {
      hasImpressumLink?: boolean;
      impressumInFooter?: boolean;
      hasAddress?: boolean;
      hasEmail?: boolean;
      hasVatId?: boolean;
      hasCompanyName?: boolean;
    };
  };
}

// ── Colors ──
const BRAND_RED: [number, number, number] = [213, 43, 30];
const DARK: [number, number, number] = [13, 13, 13];
const GRAY: [number, number, number] = [107, 114, 128];
const LIGHT_BG: [number, number, number] = [250, 250, 250];
const GREEN: [number, number, number] = [34, 197, 94];
const AMBER: [number, number, number] = [234, 179, 8];
const RED: [number, number, number] = [239, 68, 68];
const WHITE: [number, number, number] = [255, 255, 255];
const LINK_BLUE: [number, number, number] = [59, 130, 246];

function statusColor(status: string): readonly [number, number, number] {
  if (status === "green") return GREEN;
  if (status === "yellow") return AMBER;
  return RED;
}

function statusLabel(status: string): string {
  if (status === "green") return "Konform";
  if (status === "yellow") return "Optimierung nötig";
  return "Kritisches Risiko";
}

function boolToStatus(leakage: boolean): string {
  return leakage ? "red" : "green";
}

// ── Page break helper ──
function ensureSpace(doc: jsPDF, y: number, needed: number, margin: number): number {
  if (y + needed > 275) {
    doc.addPage();
    return margin;
  }
  return y;
}

// ── Footer on every page ──
function addPageFooters(doc: jsPDF) {
  const pw = 210;
  const margin = 20;
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, 280, pw - margin, 280);

    doc.setFillColor(...BRAND_RED);
    doc.roundedRect(margin, 283, 2, 6, 1, 1, "F");

    doc.setTextColor(...DARK);
    doc.setFont("Inter", "bold");
    doc.setFontSize(7);
    doc.text("KLAAR Digital Agency", margin + 5, 286);
    doc.setFont("Inter", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...GRAY);
    doc.text("klaar-studio.ch  ·  info@klaar-studio.ch  ·  +41 79 750 83 50", margin + 5, 289);

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(5.5);
    doc.text(`Seite ${i} von ${pageCount}`, pw - margin, 289, { align: "right" });
    doc.text("Dieses Dokument wurde automatisch erstellt und dient ausschliesslich zu Informationszwecken.", margin, 293);
  }
}

// ── Checks data builder ──
function buildChecks(data: AuditPdfData) {
  return [
    {
      title: "Datensouveränität (Server-Standort)",
      status: data.dataResidency,
      techDetail: data.details?.ip
        ? `IP: ${data.details.ip.ip || "?"} → ${data.details.ip.country || "Unbekannt"} (${data.details.ip.countryCode || "?"})`
        : undefined,
      summary: {
        green: "Der Server befindet sich in der Schweiz – volle Datensouveränität gewährleistet.",
        yellow: "Der Server befindet sich in der EU/EWR – adäquates Schutzniveau vorhanden, aber keine Schweizer Datensouveränität.",
        red: "Der Server befindet sich in den USA – Daten sind dem US Cloud Act ausgesetzt. US-Behörden können auf gespeicherte Daten zugreifen, auch wenn diese Schweizer oder EU-Bürgern gehören.",
      },
      whyItMatters: {
        green: "Schweizer Hosting garantiert, dass Ihre Daten ausschliesslich der Schweizer Gesetzgebung unterliegen. Keine ausländische Behörde hat Zugriff ohne ein Schweizer Rechtshilfegesuch.",
        yellow: "Die EU bietet ein angemessenes Datenschutzniveau gemäss nDSG. Für maximale Schweizer Datensouveränität und volle Kontrolle empfiehlt sich jedoch ein Hosting in der Schweiz.",
        red: "Gemäss dem US Cloud Act können US-Behörden auf Daten zugreifen, die auf US-Servern gespeichert sind – unabhängig davon, wo sich die betroffene Person befindet. Dies widerspricht den Anforderungen des nDSG an die grenzüberschreitende Datenübermittlung.",
      },
      lawArticle: {
        green: "Art. 16 nDSG: Daten dürfen ins Ausland übermittelt werden, wenn ein angemessenes Schutzniveau gewährleistet ist.",
        yellow: "Art. 16 nDSG: Die EU wird als Land mit angemessenem Schutz anerkannt. Schweizer Hosting bietet jedoch vollständige Souveränität.",
        red: "Art. 16–17 nDSG: Die grenzüberschreitende Datenübermittlung ist nur zulässig, wenn das Zielland einen angemessenen Schutz bietet. Die USA erfüllen diesen Standard ohne zusätzliche Massnahmen nicht.",
      },
      lawUrl: "https://www.fedlex.admin.ch/eli/cc/2022/491/de",
      lawLabel: "nDSG auf Fedlex lesen",
    },
    {
      title: "IP-Leakage (Schriftarten)",
      status: boolToStatus(data.fontLeakage),
      techDetail: data.details?.fontsFound?.length
        ? `Erkannt: ${data.details.fontsFound.join(", ")}`
        : undefined,
      summary: {
        green: "Keine externen Schriftarten-Dienste erkannt – keine IP-Adressen werden an Dritte übermittelt.",
        yellow: "Externe Schriftarten erkannt. IP-Adressen der Besucher werden möglicherweise an Dritte übermittelt.",
        red: "Google Fonts werden extern geladen. Bei jedem Seitenbesuch wird die IP-Adresse des Besuchers an Google-Server in den USA übermittelt.",
      },
      whyItMatters: {
        green: "Alle Schriftarten werden lokal gehostet. Es findet keine unbeabsichtigte Datenübermittlung an Drittanbieter statt.",
        yellow: "Externe Schriftarten können IP-Adressen der Besucher ohne deren Einwilligung an Dritte übermitteln.",
        red: "Das Landgericht München hat im Januar 2022 entschieden, dass das externe Laden von Google Fonts einen DSGVO-Verstoss darstellt (LG München, Az. 3 O 17493/20). Dieselbe Logik gilt unter Schweizer Recht. Jeder Seitenbesuch übermittelt die IP-Adresse des Besuchers ohne Einwilligung an Google.",
      },
      lawArticle: {
        green: "Art. 6 nDSG: Personendaten müssen rechtmässig bearbeitet werden.",
        yellow: "Art. 6 nDSG: Die Übermittlung von IP-Adressen an Dritte ohne Einwilligung oder berechtigtes Interesse verstösst gegen das Rechtmässigkeitsprinzip.",
        red: "Art. 6 nDSG: Die Übermittlung von IP-Adressen an Dritte ohne Einwilligung oder berechtigtes Interesse verstösst gegen das Rechtmässigkeitsprinzip.",
      },
      lawUrl: "https://www.fedlex.admin.ch/eli/cc/2022/491/de",
      lawLabel: "nDSG auf Fedlex lesen",
    },
    {
      title: "Tracking-Transparenz",
      status: boolToStatus(data.trackingTransparency),
      techDetail: data.details?.trackersFound?.length
        ? `Erkannt: ${data.details.trackersFound.join(", ")}`
        : undefined,
      summary: {
        green: "Keine US-basierten Tracking-Skripte erkannt.",
        yellow: "Tracking-Skripte erkannt, die möglicherweise ohne vollständige Einwilligung Daten sammeln.",
        red: "US-basierte Tracking-Skripte erkannt. Besucherdaten werden potenziell ohne Einwilligung an US-Server übermittelt.",
      },
      whyItMatters: {
        green: "Ihre Webseite sammelt keine Besucherdaten über US-basierte Analyse-Dienste. Dies ist die datenschutzkonformste Lösung.",
        yellow: "Tracking-Skripte erfassen detaillierte Besucherprofile – einschliesslich IP-Adressen, Geräteinformationen und Surfverhalten. Ohne korrekte Einwilligungsmechanismen stellt dies eine unrechtmässige Datenbearbeitung dar.",
        red: "Google Analytics und Tag Manager erfassen detaillierte Besucherprofile – einschliesslich IP-Adressen, Geräteinformationen und Surfverhalten – und übermitteln diese Daten an US-Server. Ohne ordnungsgemässes Consent-Management (Cookie-Banner + Opt-in) stellt dies eine unrechtmässige Datenbearbeitung und eine unzulässige grenzüberschreitende Übermittlung dar.",
      },
      lawArticle: {
        green: "Art. 6 & Art. 16 nDSG: Konforme Verarbeitung ohne grenzüberschreitende Risiken.",
        yellow: "Art. 6 & Art. 16 nDSG: Datenbearbeitung erfordert eine rechtliche Grundlage. Grenzüberschreitende Übermittlungen erfordern zusätzliche Sicherungsmassnahmen oder ausdrückliche Einwilligung.",
        red: "Art. 6 & Art. 16 nDSG: Datenbearbeitung erfordert eine rechtliche Grundlage. Grenzüberschreitende Übermittlungen in Länder ohne angemessenen Schutz erfordern zusätzliche Sicherungsmassnahmen oder ausdrückliche Einwilligung.",
      },
      lawUrl: "https://www.fedlex.admin.ch/eli/cc/2022/491/de",
      lawLabel: "nDSG auf Fedlex lesen",
    },
    {
      title: "Impressum (Rechtliche Präsenz)",
      status: data.legalPresence,
      techDetail: (() => {
        const ld = data.details?.legalDetails;
        if (!ld) return undefined;
        const items: string[] = [];
        if (ld.hasImpressumLink) items.push("Impressum-Link ✓");
        if (ld.impressumInFooter) items.push("Im Footer ✓");
        if (ld.hasCompanyName) items.push("Firmenname ✓");
        if (ld.hasAddress) items.push("Adresse ✓");
        if (ld.hasEmail) items.push("E-Mail ✓");
        if (ld.hasVatId) items.push("UID ✓");
        return items.length ? items.join("  ·  ") : "Keine Pflichtangaben gefunden";
      })(),
      summary: {
        green: "Vollständiges Impressum mit Firmenname, Adresse, E-Mail und UID im Footer gefunden.",
        yellow: "Impressum vorhanden, aber unvollständig – es fehlen wichtige Pflichtangaben wie UID, Adresse oder E-Mail.",
        red: "Kein Impressum gefunden. Ein Impressum ist gesetzlich vorgeschrieben.",
      },
      whyItMatters: {
        green: "Ihr Impressum enthält alle gesetzlich vorgeschriebenen Angaben. Besucher und Behörden können den Verantwortlichen der Webseite eindeutig identifizieren.",
        yellow: "Ein Impressum ist vorhanden, enthält jedoch nicht alle Pflichtangaben. Fehlende Informationen wie physische Adresse, E-Mail oder UID können bei behördlicher Prüfung beanstandet werden.",
        red: "Ohne Impressum können Besucher und Behörden den Verantwortlichen der Webseite nicht identifizieren. Dies kann zu Abmahnungen und Bussgeldern führen. In der Schweiz ist dies nach Art. 3 UWG vorgeschrieben.",
      },
      lawArticle: {
        green: "Art. 3 UWG: Pflicht zur Identifikation für Geschäftstätige ist erfüllt.",
        yellow: "Art. 3 UWG: Unternehmen müssen eine vollständige Identifikation bereitstellen. Fehlende Angaben gelten als unvollständige Einhaltung.",
        red: "Art. 3 UWG (Bundesgesetz gegen den unlauteren Wettbewerb): Geschäftstätige müssen sich klar identifizieren. Zusätzlich Art. 19–21 nDSG: transparente Informationspflicht.",
      },
      lawUrl: "https://www.fedlex.admin.ch/eli/cc/1988/223_223_223/de",
      lawLabel: "UWG auf Fedlex lesen",
    },
  ];
}

// ── Main PDF Generator ──
export function generateAuditPdf(data: AuditPdfData, options?: { returnBlob?: boolean }): any {
  const doc = new jsPDF("p", "mm", "a4");
  registerFonts(doc);
  doc.setFont("Inter", "normal");
  const pw = 210;
  const margin = 18;
  const contentW = pw - margin * 2;
  let y = 0;

  // ═══════════════════════════════════════════
  // PAGE 1 — HEADER
  // ═══════════════════════════════════════════

  // Red header bar
  doc.setFillColor(...BRAND_RED);
  doc.rect(0, 0, pw, 38, "F");

  // KLAAR branding top-left
  doc.setTextColor(...WHITE);
  doc.setFont("Inter", "bold");
  doc.setFontSize(20);
  doc.text("KLAAR", margin, 16);
  doc.setFontSize(7);
  doc.setFont("Inter", "normal");
  doc.text("DIGITAL AGENCY", margin, 21);
  doc.setFontSize(6.5);
  doc.text("klaar-studio.ch", margin, 26);

  // Report title top-right
  doc.setFont("Inter", "bold");
  doc.setFontSize(11);
  doc.text("Compliance Audit Report", pw - margin, 14, { align: "right" });
  doc.setFont("Inter", "normal");
  doc.setFontSize(8);
  const dateStr = new Date().toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(dateStr, pw - margin, 21, { align: "right" });

  // Dark accent line
  doc.setFillColor(...DARK);
  doc.rect(0, 38, pw, 1.2, "F");

  y = 48;

  // ═══════════════════════════════════════════
  // AUDITED COMPANY INFO
  // ═══════════════════════════════════════════
  const displayName = data.companyName || data.siteTitle || data.targetUrl;

  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "F");

  // Left: company info
  doc.setTextColor(...DARK);
  doc.setFont("Inter", "bold");
  doc.setFontSize(13);
  doc.text(displayName, margin + 8, y + 11);

  doc.setFont("Inter", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(data.targetUrl, margin + 8, y + 18);

  // Right: "Geprüft von KLAAR"
  doc.setFontSize(6.5);
  doc.setTextColor(160, 160, 160);
  doc.text("Geprüft von", pw - margin - 8, y + 10, { align: "right" });
  doc.setFont("Inter", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_RED);
  doc.text("KLAAR", pw - margin - 8, y + 16, { align: "right" });
  doc.setFont("Inter", "normal");
  doc.setFontSize(6);
  doc.setTextColor(160, 160, 160);
  doc.text("Digital Agency", pw - margin - 8, y + 20, { align: "right" });

  y += 36;

  // ═══════════════════════════════════════════
  // SCORE SECTION
  // ═══════════════════════════════════════════
  const scoreColor = data.score >= 75 ? GREEN : data.score >= 50 ? AMBER : RED;

  doc.setFillColor(...WHITE);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, y, contentW, 32, 3, 3, "FD");

  // Score number
  doc.setTextColor(...scoreColor);
  doc.setFont("Inter", "bold");
  doc.setFontSize(32);
  doc.text(`${data.score}%`, margin + 14, y + 21);

  // Score label
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.setFont("Inter", "normal");
  doc.text("COMPLIANCE SCORE", margin + 14, y + 27);

  // Score bar
  const barX = margin + 55;
  const barW = contentW - 65;
  const barY = y + 14;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(barX, barY, barW, 5, 2.5, 2.5, "F");
  doc.setFillColor(...scoreColor);
  const filledW = Math.max(5, barW * (data.score / 100));
  doc.roundedRect(barX, barY, filledW, 5, 2.5, 2.5, "F");

  // CTA
  doc.setTextColor(...GRAY);
  doc.setFontSize(6.5);
  doc.text("Wir helfen Ihnen, diesen Wert auf 100% zu bringen → klaar-studio.ch", barX, barY + 11);

  y += 40;

  // ═══════════════════════════════════════════
  // DETAILED RISK CARDS
  // ═══════════════════════════════════════════
  doc.setTextColor(...DARK);
  doc.setFont("Inter", "bold");
  doc.setFontSize(12);
  doc.text("Ergebnisse im Detail", margin, y);
  y += 8;

  const checks = buildChecks(data);

  for (const check of checks) {
    const sc = statusColor(check.status) as [number, number, number];
    const statusKey = check.status === "green" ? "green" : check.status === "yellow" ? "yellow" : "red";
    const summaryText = check.summary[statusKey] || check.summary.red;
    const whyText = check.whyItMatters[statusKey] || check.whyItMatters.red;
    const lawText = check.lawArticle[statusKey] || check.lawArticle.red;

    // Split text into lines for width calculation
    const textInset = 10;
    const textWidth = contentW - textInset - 12; // padding on both sides
    const summaryLines = doc.splitTextToSize(summaryText, textWidth);
    const whyLines = doc.splitTextToSize(whyText, textWidth);
    const lawLines = doc.splitTextToSize(lawText, textWidth);
    const techDetailH = check.techDetail ? 5 : 0;

    // Calculate exact card height by simulating the layout
    let innerH = 16; // title area (dot + title + gap)
    innerH += summaryLines.length * 3.5 + 2; // summary text
    innerH += techDetailH; // tech detail
    innerH += 6; // gap + "Warum" header
    innerH += whyLines.length * 3.5 + 2; // why text
    const lawBoxH = lawLines.length * 3.5 + 8;
    innerH += lawBoxH; // law box
    innerH += 6; // law link + bottom padding
    const cardH = innerH;

    y = ensureSpace(doc, y, cardH + 5, 20);

    // Card border + background
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...sc);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentW, cardH, 2.5, 2.5, "FD");

    // Status dot
    doc.setFillColor(...sc);
    doc.circle(margin + 7, y + 8, 2.5, "F");

    // Title
    doc.setTextColor(...DARK);
    doc.setFont("Inter", "bold");
    doc.setFontSize(9.5);
    doc.text(check.title, margin + 14, y + 9);

    // Status label
    const label = statusLabel(check.status);
    doc.setTextColor(...sc);
    doc.setFontSize(7);
    doc.setFont("Inter", "bold");
    doc.text(label.toUpperCase(), pw - margin - 6, y + 9, { align: "right" });

    let cy = y + 16;

    // Summary text
    doc.setTextColor(60, 60, 60);
    doc.setFont("Inter", "normal");
    doc.setFontSize(7.5);
    doc.text(summaryLines, margin + textInset, cy);
    cy += summaryLines.length * 3.5 + 2;

    // Tech detail (IP, fonts found, etc.)
    if (check.techDetail) {
      doc.setFontSize(6.5);
      doc.setTextColor(140, 140, 140);
      doc.text(check.techDetail, margin + textInset, cy);
      cy += 5;
    }

    // "Warum das wichtig ist:" section
    cy += 2;
    doc.setFont("Inter", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...DARK);
    doc.text("Warum das wichtig ist:", margin + textInset, cy);
    cy += 4;

    doc.setFont("Inter", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(whyLines, margin + textInset, cy);
    cy += whyLines.length * 3.5 + 2;

    // Law reference with article text
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin + 8, cy - 1, contentW - 16, lawBoxH, 1.5, 1.5, "F");

    doc.setFont("Inter", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(80, 90, 110);
    doc.text(lawLines, margin + 12, cy + 3);
    cy += lawBoxH - 2;

    // Link to full law
    doc.setTextColor(...LINK_BLUE);
    doc.setFontSize(6);
    doc.text(`→ ${check.lawLabel}: ${check.lawUrl}`, margin + 12, cy + 2);

    y += cardH + 5;
  }

  // ═══════════════════════════════════════════
  // CEO LIABILITY WARNING
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 30, 20);

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "FD");

  doc.setTextColor(...RED);
  doc.setFont("Inter", "bold");
  doc.setFontSize(8);
  doc.text("⚠  PERSÖNLICHE HAFTUNG – ART. 60 nDSG/nFADP", margin + 8, y + 8);
  doc.setFont("Inter", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 50, 50);
  const liabilityText =
    "Natürliche Personen können mit Bussen bis zu CHF 250'000 bestraft werden. Das Schweizer Datenschutzgesetz richtet sich gegen natürliche Personen, nicht gegen Unternehmen. Als Geschäftsführer oder Verwaltungsrat tragen Sie die persönliche Verantwortung.";
  const liabilityLines = doc.splitTextToSize(liabilityText, contentW - 18);
  doc.text(liabilityLines, margin + 8, y + 14);

  doc.setTextColor(...LINK_BLUE);
  doc.setFontSize(6);
  doc.text("→ Vollständiges Gesetz auf Fedlex lesen: https://www.fedlex.admin.ch/eli/cc/2022/491/de", margin + 8, y + 24);

  y += 36;

  // ═══════════════════════════════════════════
  // RELEVANT LAWS BIBLIOGRAPHY
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 50, 20);

  doc.setTextColor(...DARK);
  doc.setFont("Inter", "bold");
  doc.setFontSize(10);
  doc.text("Relevante Gesetzesgrundlagen", margin, y);
  y += 7;

  const laws = [
    {
      name: "nDSG / nFADP (Schweiz)",
      desc: "Neues Datenschutzgesetz der Schweiz – in Kraft seit 1. September 2023. Regelt die Bearbeitung von Personendaten durch private Personen und Bundesorgane.",
      url: "https://www.fedlex.admin.ch/eli/cc/2022/491/de",
    },
    {
      name: "DSGVO / GDPR (EU)",
      desc: "Datenschutz-Grundverordnung der Europäischen Union. Gilt für alle Unternehmen, die Daten von EU-Bürgern bearbeiten.",
      url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    },
    {
      name: "Art. 3 UWG (Schweiz)",
      desc: "Bundesgesetz gegen den unlauteren Wettbewerb – regelt die Pflicht zur Impressum-Angabe für Geschäftstätige.",
      url: "https://www.fedlex.admin.ch/eli/cc/1988/223_223_223/de",
    },
    {
      name: "US Cloud Act (USA)",
      desc: "Ermöglicht US-Behörden den Zugriff auf Daten, die auf US-Servern gespeichert sind – unabhängig vom Standort des Datensubjekts.",
      url: "https://www.justice.gov/dag/cloudact",
    },
    {
      name: "LG München I (3 O 17493/20)",
      desc: "Urteil vom 20. Januar 2022 – Google Fonts ohne Einwilligung einzubinden verstösst gegen die DSGVO.",
      url: "https://www.gesetze-bayern.de/Content/Document/Y-300-Z-GRURRS-B-2022-N-612",
    },
  ];

  for (const law of laws) {
    y = ensureSpace(doc, y, 14, 20);
    doc.setTextColor(...DARK);
    doc.setFont("Inter", "bold");
    doc.setFontSize(7);
    doc.text(`•  ${law.name}`, margin + 4, y);
    doc.setFont("Inter", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(law.desc, contentW - 16);
    doc.text(descLines, margin + 8, y + 4);
    const descH = descLines.length * 3;
    doc.setTextColor(...LINK_BLUE);
    doc.setFontSize(6);
    doc.text(law.url, margin + 8, y + 4 + descH + 1);
    y += 4 + descH + 5;
  }

  // ═══════════════════════════════════════════
  // CTA SECTION
  // ═══════════════════════════════════════════
  y = ensureSpace(doc, y, 24, 20);
  y += 4;

  doc.setFillColor(245, 245, 250);
  doc.roundedRect(margin, y, contentW, 20, 3, 3, "F");

  doc.setTextColor(...DARK);
  doc.setFont("Inter", "bold");
  doc.setFontSize(9);
  doc.text("Ihre Webseite datenschutzkonform machen?", margin + 8, y + 8);
  doc.setFont("Inter", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("Wir helfen Ihnen, alle Compliance-Probleme zu beheben und Ihren Score auf 100% zu bringen.", margin + 8, y + 13);
  doc.setTextColor(...BRAND_RED);
  doc.setFont("Inter", "bold");
  doc.setFontSize(7);
  doc.text("→ klaar-studio.ch  ·  info@klaar-studio.ch  ·  +41 79 750 83 50", margin + 8, y + 17);

  // ═══════════════════════════════════════════
  // ADD FOOTERS TO ALL PAGES
  // ═══════════════════════════════════════════
  addPageFooters(doc);

  // Save or return blob
  const fileName = `Compliance-Audit_${data.targetUrl
    .replace(/https?:\/\//, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;

  if (options?.returnBlob) {
    return doc.output("blob");
  }
  doc.save(fileName);
}
