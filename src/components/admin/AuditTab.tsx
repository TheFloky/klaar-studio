import { useState, useEffect, useRef } from "react";
import { Shield, Globe, Type, BarChart3, FileText, AlertTriangle, CheckCircle, XCircle, Search, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateAuditPdf } from "@/lib/generateAuditPdf";

interface ScanDetails {
  ip?: { country?: string; countryCode?: string; ip?: string };
  fontsFound?: string[];
  trackersFound?: string[];
  siteTitle?: string;
  siteDescription?: string;
  legalDetails?: any;
}

interface ScanResults {
  dataResidency: boolean | null;
  fontLeakage: boolean | null;
  trackingTransparency: boolean | null;
  legalPresence: boolean | null;
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

function ScoreGauge({ score, scanning }: { score: number; scanning: boolean }) {
  const radius = 90;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = scanning ? 0 : (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#FF0000";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg width="224" height="224" viewBox="0 0 224 224" className="-rotate-90">
          <circle cx="112" cy="112" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle
            cx="112" cy="112" r={radius} fill="none"
            stroke={scanning ? "#d1d5db" : color}
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
          <span className="text-xs uppercase tracking-widest text-gray-400 mt-1">Compliance Score</span>
        </div>
      </div>
    </div>
  );
}

function RiskCard({ title, icon: Icon, status, description, detail }: { title: string; icon: React.ElementType; status: boolean | null; description: string; detail?: string }) {
  const isPass = status === true;
  const isFail = status === false;
  const isPending = status === null;

  return (
    <div className={`rounded-xl border-2 p-5 transition-all duration-500 shadow-sm ${
      isPending ? "border-gray-200 bg-white" :
      isPass ? "border-green-200 bg-green-50/60" :
      "border-red-200 bg-red-50/60"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${
          isPending ? "bg-gray-100 text-gray-400" :
          isPass ? "bg-green-100 text-green-600" :
          "bg-red-100 text-red-600"
        }`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">{title}</h3>
            {!isPending && (
              isPass
                ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                : <XCircle size={18} className="text-red-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
          {detail && !isPending && (
            <p className="text-[11px] text-gray-400 mt-1 font-mono">{detail}</p>
          )}
          {!isPending && (
            <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {isPass ? "Compliant" : "Risk Detected"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuditTab() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [results, setResults] = useState<ScanResults>({ dataResidency: null, fontLeakage: null, trackingTransparency: null, legalPresence: null });
  const [score, setScore] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setResults({
        dataResidency: r.dataResidency,
        fontLeakage: r.fontLeakage,
        trackingTransparency: r.trackingTransparency,
        legalPresence: r.legalPresence,
        details: r.details,
      });

      const passCount = [
        r.dataResidency,
        !r.fontLeakage,
        !r.trackingTransparency,
        r.legalPresence,
      ].filter(Boolean).length;
      setScore(passCount * 25);
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

  return (
    <div className="space-y-8">
      {/* URL Input */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Target Website</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.ch"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] transition-all bg-gray-50"
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
            />
          </div>
          <button
            onClick={runAudit}
            disabled={!url.trim() || scanning}
            className="px-6 py-3 bg-[#FF0000] text-white font-semibold text-sm rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            <Search size={16} />
            Run Audit
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Scanning Progress */}
      {scanning && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">{statusMsg}</span>
            <span className="font-bold text-gray-700">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#FF0000] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Score + Risk Cards */}
      {scanComplete && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
            <ScoreGauge score={score} scanning={false} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <RiskCard title="Data Residency" icon={Shield} status={results.dataResidency} description="Verifies hosting IP is geolocated within Swiss borders (CH)." detail={ipDetail} />
            <RiskCard title="IP Leakage (Fonts)" icon={Type} status={results.fontLeakage === null ? null : !results.fontLeakage} description="Detects calls to fonts.googleapis.com that leak visitor IPs." detail={fontsDetail} />
            <RiskCard title="Tracking Transparency" icon={BarChart3} status={results.trackingTransparency === null ? null : !results.trackingTransparency} description="Scans for tracking scripts." detail={trackersDetail} />
            <RiskCard title="Legal Presence" icon={FileText} status={results.legalPresence} description="Checks for a visible 'Impressum' link." />
          </div>
        </div>
      )}

      {/* Generate Report */}
      {scanComplete && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              generateAuditPdf({
                targetUrl: url,
                siteTitle: results.details?.siteTitle,
                score,
                dataResidency: typeof results.dataResidency === "string" ? results.dataResidency : results.dataResidency ? "green" : "red",
                fontLeakage: results.fontLeakage === true,
                trackingTransparency: results.trackingTransparency === true,
                legalPresence: typeof results.legalPresence === "string" ? results.legalPresence : results.legalPresence ? "green" : "red",
                details: results.details,
              });
            }}
            className="px-6 py-3 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#FF0000] hover:text-[#FF0000] transition-all flex items-center gap-2"
          >
            <FileDown size={16} />
            Generate Risk Report PDF
          </button>
        </div>
      )}

      {/* CEO Liability Warning */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-[#FF0000] shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-[#FF0000] text-sm uppercase tracking-wider mb-2">CEO Personal Liability Warning</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Under <strong className="text-[#FF0000]">Art. 60 nFADP/nDSG</strong>, individuals may face <strong className="text-[#FF0000]">personal fines up to CHF 250'000</strong>. Swiss law targets <strong className="text-[#FF0000]">natural persons, not corporations</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
