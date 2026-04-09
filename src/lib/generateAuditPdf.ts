import jsPDF from "jspdf";

interface AuditPdfData {
  targetUrl: string;
  siteTitle?: string;
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

const BRAND_RED: [number, number, number] = [213, 43, 30];
const DARK: [number, number, number] = [13, 13, 13];
const GRAY: [number, number, number] = [107, 114, 128];
const LIGHT_BG: [number, number, number] = [250, 250, 250];
const GREEN: [number, number, number] = [34, 197, 94];
const AMBER: [number, number, number] = [234, 179, 8];
const RED: [number, number, number] = [239, 68, 68];
const WHITE: [number, number, number] = [255, 255, 255];

function statusColor(status: string): readonly [number, number, number] {
  if (status === "green") return GREEN;
  if (status === "yellow") return AMBER;
  return RED;
}

function statusLabel(status: string): string {
  if (status === "green") return "Compliant";
  if (status === "yellow") return "Optimization Required";
  return "Critical Risk";
}

function boolToStatus(leakage: boolean): string {
  return leakage ? "red" : "green";
}

export function generateAuditPdf(data: AuditPdfData): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pw = 210;
  const margin = 20;
  const contentW = pw - margin * 2;
  let y = 0;

  // ── Header Bar ──
  doc.setFillColor(...BRAND_RED);
  doc.rect(0, 0, pw, 42, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("KLAAR", margin, 18);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("DIGITAL AGENCY", margin, 24);

  doc.setFontSize(10);
  doc.text("Compliance Audit Report", pw - margin, 16, { align: "right" });
  doc.setFontSize(8);
  const dateStr = new Date().toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(dateStr, pw - margin, 23, { align: "right" });

  // Thin accent line
  doc.setFillColor(...DARK);
  doc.rect(0, 42, pw, 1.5, "F");

  y = 54;

  // ── Target Info ──
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, "F");
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Geprüfte Webseite", margin + 6, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(data.targetUrl, margin + 6, y + 15);
  if (data.siteTitle) {
    doc.text(`(${data.siteTitle})`, margin + 6 + doc.getTextWidth(data.targetUrl) + 4, y + 15);
  }

  y += 30;

  // ── Score Section ──
  const scoreColor = data.score >= 75 ? GREEN : data.score >= 50 ? AMBER : RED;
  
  doc.setFillColor(...WHITE);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, y, contentW, 36, 3, 3, "FD");
  
  // Score number
  doc.setTextColor(...scoreColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(`${data.score}%`, margin + 14, y + 24);
  
  // Score label
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("COMPLIANCE SCORE", margin + 14, y + 31);

  // Score bar
  const barX = margin + 60;
  const barW = contentW - 70;
  const barY = y + 16;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(barX, barY, barW, 6, 3, 3, "F");
  doc.setFillColor(...scoreColor);
  doc.roundedRect(barX, barY, barW * (data.score / 100), 6, 3, 3, "F");

  // Path to 100%
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.text("Wir helfen Ihnen, diesen Wert auf 100% zu bringen → klaar-studio.ch", barX, barY + 12);

  y += 44;

  // ── Risk Cards ──
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Ergebnisse im Detail", margin, y);
  y += 8;

  const checks = [
    {
      title: "Datensouveränität (Server-Standort)",
      status: data.dataResidency,
      detail: data.details?.ip ? `IP: ${data.details.ip.ip || "?"} → ${data.details.ip.country || "Unbekannt"} (${data.details.ip.countryCode || "?"})` : undefined,
      lawRef: "nDSG (Schweiz) · DSGVO Art. 44-49 (EU)",
      whyGreen: "Der Server befindet sich in der Schweiz – volle Datensouveränität gewährleistet.",
      whyYellow: "Der Server befindet sich in der EU/EWR – adäquates Schutzniveau, aber keine Schweizer Datensouveränität.",
      whyRed: "Der Server befindet sich in den USA – Daten sind dem US Cloud Act ausgesetzt. Personendaten können ohne richterliche Anordnung eingesehen werden.",
    },
    {
      title: "IP-Leakage (Schriftarten)",
      status: boolToStatus(data.fontLeakage),
      detail: data.details?.fontsFound?.length ? `Gefunden: ${data.details.fontsFound.join(", ")}` : undefined,
      lawRef: "nDSG Art. 6 · DSGVO Art. 5(1)(c)",
      whyGreen: "Keine externen Schriftarten-Dienste erkannt – keine IP-Adressen werden an Dritte übermittelt.",
      whyRed: "Google Fonts werden extern geladen. Jeder Seitenbesuch übermittelt die IP-Adresse des Besuchers an Google-Server in den USA.",
    },
    {
      title: "Tracking-Transparenz",
      status: boolToStatus(data.trackingTransparency),
      detail: data.details?.trackersFound?.length ? `Gefunden: ${data.details.trackersFound.join(", ")}` : undefined,
      lawRef: "nDSG Art. 6 · DSGVO Art. 6-7 · ePrivacy",
      whyGreen: "Keine US-basierten Tracking-Skripte erkannt.",
      whyRed: "US-basierte Tracking-Skripte ohne transparente Einwilligungsmechanismen erkannt. Besucherdaten werden potenziell ohne Zustimmung erfasst.",
    },
    {
      title: "Impressum (Rechtliche Präsenz)",
      status: data.legalPresence,
      detail: (() => {
        const ld = data.details?.legalDetails;
        if (!ld) return undefined;
        const items: string[] = [];
        if (ld.hasImpressumLink) items.push("Impressum-Link ✓");
        if (ld.impressumInFooter) items.push("Im Footer ✓");
        if (ld.hasAddress) items.push("Adresse ✓");
        if (ld.hasEmail) items.push("E-Mail ✓");
        if (ld.hasVatId) items.push("UID ✓");
        return items.length ? items.join(" · ") : "Keine Angaben gefunden";
      })(),
      lawRef: "Art. 3 UWG (Schweiz) · §5 TMG (DE) · EU e-Commerce-Richtlinie",
      whyGreen: "Vollständiges Impressum mit Firmenname, Adresse, E-Mail und UID im Footer gefunden.",
      whyYellow: "Impressum vorhanden, aber unvollständig – es fehlen wichtige Pflichtangaben wie UID, Adresse oder E-Mail.",
      whyRed: "Kein Impressum gefunden. Gesetzlich vorgeschrieben nach Art. 3 UWG (Schweiz).",
    },
  ];

  for (const check of checks) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const sc = statusColor(check.status);
    const cardH = 30 + (check.detail ? 4 : 0);

    // Card background
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...sc);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, y, contentW, cardH, 2, 2, "FD");

    // Status indicator dot
    doc.setFillColor(...sc);
    doc.circle(margin + 7, y + 8, 3, "F");

    // Title
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(check.title, margin + 14, y + 9);

    // Status label
    const label = statusLabel(check.status);
    doc.setTextColor(...sc);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), pw - margin - 6, y + 9, { align: "right" });

    // Why text
    const whyText = check.status === "green" ? check.whyGreen : check.status === "yellow" ? (check.whyYellow || check.whyRed) : check.whyRed;
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const whyLines = doc.splitTextToSize(whyText, contentW - 20);
    doc.text(whyLines, margin + 14, y + 16);

    // Detail
    if (check.detail) {
      doc.setFontSize(6.5);
      doc.setTextColor(160, 160, 160);
      doc.text(check.detail, margin + 14, y + 16 + whyLines.length * 3.5);
    }

    // Law reference
    doc.setFontSize(6);
    doc.setTextColor(180, 180, 180);
    doc.text(`Rechtsgrundlage: ${check.lawRef}`, margin + 14, y + cardH - 3);

    y += cardH + 4;
  }

  // ── CEO Liability Warning ──
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentW, 24, 3, 3, "FD");
  
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("⚠ PERSÖNLICHE HAFTUNG – ART. 60 nDSG/nFADP", margin + 6, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 50, 50);
  const liabilityText = "Natürliche Personen können mit Bussen bis zu CHF 250'000 bestraft werden. Das Schweizer Datenschutzgesetz richtet sich gegen natürliche Personen, nicht gegen Unternehmen.";
  const liabilityLines = doc.splitTextToSize(liabilityText, contentW - 14);
  doc.text(liabilityLines, margin + 6, y + 14);

  y += 32;

  // ── Relevant Laws Section ──
  if (y > 245) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Relevante Gesetzesgrundlagen", margin, y);
  y += 6;
  
  const laws = [
    { name: "nDSG/nFADP (Schweiz)", url: "https://www.fedlex.admin.ch/eli/cc/2022/491/de", desc: "Neues Datenschutzgesetz der Schweiz (seit 1. September 2023)" },
    { name: "DSGVO/GDPR (EU)", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj", desc: "Datenschutz-Grundverordnung der Europäischen Union" },
    { name: "Art. 3 UWG (Schweiz)", url: "https://www.fedlex.admin.ch/eli/cc/1988/223_223_223/de", desc: "Pflicht zur Impressum-Angabe für Geschäftstätige" },
    { name: "US Cloud Act", url: "https://www.justice.gov/dag/cloudact", desc: "Zugriff auf im Ausland gespeicherte Daten durch US-Behörden" },
  ];

  doc.setFontSize(7);
  for (const law of laws) {
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(`• ${law.name}`, margin + 4, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(` – ${law.desc}`, margin + 4 + doc.getTextWidth(`• ${law.name}`), y);
    y += 3.5;
    doc.setTextColor(100, 120, 200);
    doc.text(law.url, margin + 8, y);
    y += 5;
  }

  // ── Footer ──
  y = 280;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pw - margin, y);
  y += 5;

  doc.setFillColor(...BRAND_RED);
  doc.roundedRect(margin, y, 2, 8, 1, 1, "F");

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("KLAAR Digital Agency", margin + 6, y + 3.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text("klaar-studio.ch · info@klaar-studio.ch · +41 79 750 83 50", margin + 6, y + 7);

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(5.5);
  doc.text("Dieses Dokument wurde automatisch erstellt und dient ausschliesslich zu Informationszwecken.", margin, y + 13);

  // Save
  const fileName = `Compliance-Audit_${data.targetUrl.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9.-]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
