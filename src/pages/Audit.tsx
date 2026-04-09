import { useState, useEffect, useRef, useCallback } from "react";
import { Shield, Globe, Type, BarChart3, FileText, AlertTriangle, CheckCircle, XCircle, Search, FileDown, ExternalLink, Loader2 } from "lucide-react";
import { generateAuditPdf } from "@/lib/generateAuditPdf";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";

type TriState = "green" | "yellow" | "red" | null;

interface ScanDetails {
  ip?: { country?: string; countryCode?: string; ip?: string };
  fontsFound?: string[];
  trackersFound?: string[];
  legalDetails?: {
    hasImpressumLink: boolean;
    impressumInFooter: boolean;
    hasAddress: boolean;
    hasEmail: boolean;
    hasVatId: boolean;
    hasCompanyName: boolean;
  };
}

interface ScanResults {
  dataResidency: TriState;
  fontLeakage: TriState;
  trackingTransparency: TriState;
  legalPresence: TriState;
  details?: ScanDetails;
}

const STATUS_MESSAGES = [
  "Initializing secure connection...",
  "Resolving DNS records...",
  "Analyzing server IP geolocation...",
  "Scanning DOM for external font imports...",
  "Detecting US-based tracking scripts...",
  "Verifying Data Residency compliance...",
  "Scanning footer for Impressum link...",
  "Compiling risk assessment...",
];

const NDSG_URL = "https://www.fedlex.admin.ch/eli/cc/2022/491/en";

const RISK_EXPLANATIONS: Record<string, {
  red: { risk: string; law: string };
  yellow: { risk: string; law: string };
  lawRef: string;
}> = {
  dataResidency: {
    red: {
      risk: "Your website is hosted in the USA. Under the US Cloud Act, US authorities can access data stored on US servers — even if the data belongs to Swiss or EU citizens. This creates a critical conflict with nFADP requirements for cross-border data transfers.",
      law: "Art. 16–17 nFADP (nDSG): Cross-border data transfer is only permitted if the destination country ensures adequate protection. The US does not meet this standard without additional safeguards.",
    },
    yellow: {
      risk: "Your server is in the EU/EEA, which offers adequate data protection under GDPR. However, for maximum nFADP compliance and Swiss data sovereignty, hosting in Switzerland is recommended.",
      law: "Art. 16 nFADP (nDSG): The EU is recognized as providing adequate protection, but Swiss hosting ensures full sovereignty over your data.",
    },
    lawRef: NDSG_URL,
  },
  fontLeakage: {
    red: {
      risk: "Loading Google Fonts from Google's servers causes every visitor's IP address to be sent to Google (a US company) without consent. The German courts have already ruled this a GDPR violation (LG München, Jan 2022) — and the same logic applies under Swiss law. Self-hosting fonts eliminates this risk entirely.",
      law: "Art. 6 nFADP (nDSG): Personal data must be processed lawfully. Sending IPs to third parties without consent or legitimate interest violates this principle.",
    },
    yellow: {
      risk: "Loading Google Fonts from Google's servers causes every visitor's IP address to be sent to Google (a US company) without consent. The German courts have already ruled this a GDPR violation (LG München, Jan 2022) — and the same logic applies under Swiss law. Self-hosting fonts eliminates this risk entirely.",
      law: "Art. 6 nFADP (nDSG): Personal data must be processed lawfully. Sending IPs to third parties without consent or legitimate interest violates this principle.",
    },
    lawRef: NDSG_URL,
  },
  trackingTransparency: {
    red: {
      risk: "Google Analytics and Tag Manager collect detailed visitor profiles — including IP addresses, device info, and browsing behaviour — and transfer this data to US servers. Without proper consent management (cookie banner + opt-in), this constitutes unlawful data processing and an unauthorised cross-border transfer.",
      law: "Art. 6 & Art. 16 nFADP (nDSG): Data processing requires a lawful basis, and cross-border transfers to countries without adequate protection require additional safeguards or explicit consent.",
    },
    yellow: {
      risk: "Google Analytics and Tag Manager collect detailed visitor profiles — including IP addresses, device info, and browsing behaviour — and transfer this data to US servers. Without proper consent management (cookie banner + opt-in), this constitutes unlawful data processing and an unauthorised cross-border transfer.",
      law: "Art. 6 & Art. 16 nFADP (nDSG): Data processing requires a lawful basis, and cross-border transfers to countries without adequate protection require additional safeguards or explicit consent.",
    },
    lawRef: NDSG_URL,
  },
  legalPresence: {
    red: {
      risk: "No Impressum link was found on your website. Swiss and EU law require businesses to provide clear identification. A missing Impressum means visitors and authorities cannot verify who is responsible for the site — this can lead to regulatory action and undermines trust.",
      law: "Art. 3 UWG (Unfair Competition Act) & Art. 19–21 nFADP (nDSG): Businesses must clearly identify themselves and provide transparent information about data processing.",
    },
    yellow: {
      risk: "Some legal information was found, but there is no explicit 'Impressum' link in the footer, or mandatory details like a physical address, email, or VAT/UID number may be missing. This should be optimized to ensure full compliance.",
      law: "Art. 3 UWG: Businesses must provide complete identification. Missing details (address, VAT ID) can be considered incomplete compliance.",
    },
    lawRef: NDSG_URL,
  },
};

function ScoreGauge({ score, scanning }: { score: number; scanning: boolean }) {
  const radius = 90;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = scanning ? 0 : (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg width="224" height="224" viewBox="0 0 224 224" className="-rotate-90">
          <circle cx="112" cy="112" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle
            cx="112" cy="112" r={radius} fill="none"
            stroke={scanning ? "#9ca3af" : color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tracking-tight" style={{ color: scanning ? "#9ca3af" : color }}>
            {scanning ? "—" : `${score}%`}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Compliance Score</span>
        </div>
      </div>
    </div>
  );
}

function RiskCard({ title, riskKey, icon: Icon, status, description, detail }: {
  title: string;
  riskKey: string;
  icon: React.ElementType;
  status: TriState;
  description: string;
  detail?: string;
}) {
  const isPending = status === null;
  const isGreen = status === "green";
  const isYellow = status === "yellow";
  const isRed = status === "red";
  const explanation = RISK_EXPLANATIONS[riskKey];

  const borderBg = isPending
    ? "border-border bg-card"
    : isGreen
    ? "border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/30"
    : isYellow
    ? "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30"
    : "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30";

  const iconBg = isPending
    ? "bg-muted text-muted-foreground"
    : isGreen
    ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
    : isYellow
    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
    : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400";

  const statusLabel = isGreen ? "Compliant" : isYellow ? "Optimization Required" : "Risk Detected";
  const statusBadge = isGreen
    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
    : isYellow
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400";

  const StatusIcon = isGreen ? CheckCircle : isYellow ? AlertTriangle : XCircle;
  const statusColor = isGreen ? "text-green-500" : isYellow ? "text-amber-500" : "text-red-500";

  const showExplanation = (isRed || isYellow) && explanation;
  const explanationData = isRed ? explanation?.red : explanation?.yellow;
  const explanationBg = isRed
    ? "bg-red-100/50 dark:bg-red-950/40 border-red-200 dark:border-red-900"
    : "bg-amber-100/50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900";

  return (
    <div className={`rounded-xl border-2 p-5 transition-all duration-500 shadow-sm ${borderBg}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            {!isPending && <StatusIcon size={18} className={`${statusColor} shrink-0`} />}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          {detail && !isPending && (
            <p className="text-[11px] text-muted-foreground/70 mt-1 font-mono">{detail}</p>
          )}
          {!isPending && (
            <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusBadge}`}>
              {statusLabel}
            </span>
          )}

          {showExplanation && explanationData && (
            <div className={`mt-4 p-3 rounded-lg border ${explanationBg}`}>
              <p className="text-xs text-foreground leading-relaxed font-medium mb-2">
                <AlertTriangle size={12} className="inline mr-1" />
                Why this matters:
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{explanationData.risk}</p>
              <p className="text-xs text-foreground/80 leading-relaxed italic mb-1">
                📜 {explanationData.law}
              </p>
              <a
                href={explanation.lawRef}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                Read the full law (Fedlex) <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Weighted scoring: Data Residency (35%), Legal Presence (30%), Font Leakage (15%), Tracking (20%)
const CATEGORY_WEIGHTS = {
  dataResidency: 35,
  legalPresence: 30,
  tracking: 20,
  fonts: 15,
};

function stateToPercent(state: TriState): number {
  if (state === "green") return 1;
  if (state === "yellow") return 0.5;
  return 0;
}

function calculateComplianceScore(
  dataResidency: TriState,
  fontState: TriState,
  trackingState: TriState,
  legalPresence: TriState
): number {
  return Math.round(
    stateToPercent(dataResidency) * CATEGORY_WEIGHTS.dataResidency +
    stateToPercent(legalPresence) * CATEGORY_WEIGHTS.legalPresence +
    stateToPercent(trackingState) * CATEGORY_WEIGHTS.tracking +
    stateToPercent(fontState) * CATEGORY_WEIGHTS.fonts
  );
}

export default function Audit() {
  const [searchParams] = useSearchParams();
  const { lang } = useParams<{ lang: string }>();
  const { toast } = useToast();
  const backPath = `/${lang || 'de'}`;
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [results, setResults] = useState<ScanResults>({ dataResidency: null, fontLeakage: null, trackingTransparency: null, legalPresence: null });
  const [score, setScore] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRan = useRef(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfFallbackUrl, setPdfFallbackUrl] = useState<string | null>(null);



  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const runAudit = async () => {
    if (!url.trim() || scanning) return;
    setScanning(true);
    setScanComplete(false);
    setProgress(0);
    setScore(0);
    setError("");
    setResults({ dataResidency: null, fontLeakage: null, trackingTransparency: null, legalPresence: null });

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      const pct = Math.min(Math.round((step / STATUS_MESSAGES.length) * 90), 90);
      setProgress(pct);
      setStatusMsg(STATUS_MESSAGES[Math.min(step - 1, STATUS_MESSAGES.length - 1)]);
      if (step >= STATUS_MESSAGES.length && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 800);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("compliance-scan", {
        body: { url: url.trim() },
      });

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (fnError || !data?.success) {
        setError(fnError?.message || data?.error || "Scan failed");
        setScanning(false);
        return;
      }

      const r = data.results;

      // Convert boolean font/tracking to tri-state
      const fontState: TriState = r.fontLeakage ? "red" : "green";
      const trackingState: TriState = r.trackingTransparency ? "red" : "green";

      setResults({
        dataResidency: r.dataResidency, // already tri-state from server
        fontLeakage: fontState,
        trackingTransparency: trackingState,
        legalPresence: r.legalPresence, // already tri-state from server
        details: r.details,
      });

      const totalScore = Math.round(
        stateToScore(r.dataResidency) +
        stateToScore(fontState) +
        stateToScore(trackingState) +
        stateToScore(r.legalPresence)
      );
      setScore(totalScore);
      setProgress(100);
      setStatusMsg("Scan complete.");
      setScanComplete(true);
    } catch (e) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  // Auto-run if URL passed via query param
  useEffect(() => {
    if (url.trim() && !autoRan.current) {
      autoRan.current = true;
      runAudit();
    }
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const ipDetail = results.details?.ip
    ? `IP: ${results.details.ip.ip || "?"} → ${results.details.ip.country || "Unknown"} (${results.details.ip.countryCode || "?"})`
    : undefined;
  const fontsDetail = results.details?.fontsFound?.length
    ? `Found: ${results.details.fontsFound.join(", ")}`
    : undefined;
  const trackersDetail = results.details?.trackersFound?.length
    ? `Found: ${results.details.trackersFound.join(", ")}`
    : undefined;

  const legalDetail = results.details?.legalDetails
    ? [
        results.details.legalDetails.impressumInFooter ? "Impressum in footer ✓" : results.details.legalDetails.hasImpressumLink ? "Impressum link found (not in footer)" : "No Impressum link",
        results.details.legalDetails.hasAddress ? "Address ✓" : "No address found",
        results.details.legalDetails.hasEmail ? "Email ✓" : "No email found",
        results.details.legalDetails.hasVatId ? "VAT/UID ✓" : "No VAT/UID found",
      ].join(" · ")
    : undefined;

  const generatePDF = useCallback(async () => {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    setPdfFallbackUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });

    try {
      const blob = generateAuditPdf({
        targetUrl: url,
        siteTitle: results.details?.legalDetails?.hasCompanyName ? undefined : undefined,
        score,
        dataResidency: typeof results.dataResidency === "string" ? results.dataResidency : results.dataResidency ? "green" : "red",
        fontLeakage: results.fontLeakage === "red",
        trackingTransparency: results.trackingTransparency === "red",
        legalPresence: typeof results.legalPresence === "string" ? results.legalPresence : results.legalPresence ? "green" : "red",
        details: results.details,
      }, { returnBlob: true });

      const objectUrl = URL.createObjectURL(blob);
      setPdfFallbackUrl(objectUrl);

      const fileName = `compliance-report-${url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "-") || "website"}.pdf`;
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
      }, 150);

      toast({
        title: "PDF ready",
        description: "If the download didn't start automatically, use the fallback link below.",
      });
    } catch (e) {
      console.error("PDF generation failed:", e);
      toast({
        title: "PDF generation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
  }, [url, score, results, generatingPdf, toast]);

  const dataResidencyDesc =
    results.dataResidency === "red"
      ? "Server is hosted in the USA — critical risk under nFADP and US Cloud Act."
      : results.dataResidency === "yellow"
      ? "Server is in the EU/EEA — adequate but lacks Swiss data sovereignty."
      : "Verifies hosting IP is geolocated within Swiss borders (CH).";

  const legalDesc =
    results.legalPresence === "red"
      ? "No Impressum link found on the website."
      : results.legalPresence === "yellow"
      ? "Legal information found but incomplete — explicit Impressum in footer or mandatory details may be missing."
      : "Checks for a visible 'Impressum' link with required legal information.";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Swiss Compliance Audit" subtitle="nFADP / nDSG Conformity Scanner" backTo={backPath} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* URL Input */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Target Website</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.ch"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/30 text-foreground"
                onKeyDown={(e) => e.key === "Enter" && runAudit()}
              />
            </div>
            <button
              onClick={runAudit}
              disabled={!url.trim() || scanning}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
            >
              <Search size={16} />
              Run Audit
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        {/* Scanning Progress */}
        {scanning && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">{statusMsg}</span>
              <span className="font-bold text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Score + Risk Cards */}
        {scanComplete && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex items-center justify-center">
                <ScoreGauge score={score} scanning={false} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <RiskCard title="Data Residency" riskKey="dataResidency" icon={Shield} status={results.dataResidency} description={dataResidencyDesc} detail={ipDetail} />
                <RiskCard title="IP Leakage (Fonts)" riskKey="fontLeakage" icon={Type} status={results.fontLeakage} description="Detects calls to fonts.googleapis.com or fonts.gstatic.com that leak visitor IPs." detail={fontsDetail} />
                <RiskCard title="Tracking Transparency" riskKey="trackingTransparency" icon={BarChart3} status={results.trackingTransparency} description="Scans for google-analytics.com or googletagmanager.com tracking scripts." detail={trackersDetail} />
                <RiskCard title="Legal Presence" riskKey="legalPresence" icon={FileText} status={results.legalPresence} description={legalDesc} detail={legalDetail} />
              </div>
            </div>

            {/* Summary */}
            {score < 100 && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-destructive" />
                  What You Should Fix
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Each issue above exposes your business to legal risk under Swiss data protection law. Scroll through the cards to see detailed explanations and the specific articles of law that apply.
                </p>
                <a
                  href={NDSG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                >
                  📜 Read the full nFADP / nDSG on Fedlex <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* CTA + Report */}
        {scanComplete && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`${backPath}#contact`}
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm swiss-red-glow"
            >
              <Shield size={16} />
              {score < 100 ? 'Fix Your Compliance Issues' : 'Let\'s Create a Fresh Look for Your Site'}
            </Link>
            <button
              onClick={generatePDF}
              disabled={generatingPdf}
              className="px-6 py-3 border-2 border-border rounded-lg text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {generatingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              {generatingPdf ? 'Generating...' : 'Generate Risk Report PDF'}
            </button>
          </div>
        )}

        {scanComplete && pdfFallbackUrl && (
          <div className="flex justify-center">
            <a
              href={pdfFallbackUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Download the PDF manually
            </a>
          </div>
        )}

        {/* AI Privacy Toggle */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <text x="12" y="17" textAnchor="middle" fill="currentColor" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="14">K</text>
                <circle cx="20" cy="4" r="3.5" fill="currentColor" opacity="0.2" />
                <path d="M18.5 4h3M20 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider mb-2">Sovereign AI — Replace Non-Compliant AI Calls</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We can bridge your existing workflows to <strong className="text-foreground">Infomaniak's Swiss-hosted LLM API</strong>, replacing non-compliant US-based AI calls with Sovereign Swiss alternatives. Your data stays in Switzerland, remains your property, and is never used to train third-party models.
              </p>
            </div>
          </div>
        </div>

        {/* CEO Liability Warning */}
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-destructive shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-destructive text-sm uppercase tracking-wider mb-2">CEO Personal Liability Warning</h2>
              <p className="text-sm text-foreground leading-relaxed">
                Under <strong className="text-destructive">Art. 60 of the Swiss Federal Act on Data Protection (nFADP/nDSG)</strong>, individuals — including company executives — who wilfully violate data protection obligations may face <strong className="text-destructive">personal fines of up to CHF 250'000</strong>. Unlike the EU GDPR, Swiss law targets <strong className="text-destructive">natural persons, not corporations</strong>, making C-level executives personally accountable for non-compliance.
              </p>
              <a
                href={NDSG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-3"
              >
                Read the full law on Fedlex (official Swiss legislation) <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
