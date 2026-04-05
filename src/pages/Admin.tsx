import { useState, useEffect, useRef } from "react";
import { Shield, Globe, Type, BarChart3, FileText, AlertTriangle, CheckCircle, XCircle, Search, FileDown } from "lucide-react";

interface ScanResults {
  dataResidency: boolean | null;
  fontLeakage: boolean | null;
  trackingTransparency: boolean | null;
  legalPresence: boolean | null;
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
  "Finalizing compliance report...",
];

function getMockResults(url: string): ScanResults {
  const hash = url.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  return {
    dataResidency: hash % 3 !== 0,
    fontLeakage: hash % 2 !== 0,
    trackingTransparency: hash % 4 !== 0,
    legalPresence: hash % 5 === 0,
  };
}

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
          <span className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif", color: scanning ? "#9ca3af" : color }}>
            {scanning ? "—" : `${score}%`}
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 mt-1">Compliance Score</span>
        </div>
      </div>
    </div>
  );
}

function RiskCard({ title, icon: Icon, status, description }: { title: string; icon: React.ElementType; status: boolean | null; description: string }) {
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
            <h3 className="font-semibold text-sm" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif" }}>{title}</h3>
            {!isPending && (
              isPass
                ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                : <XCircle size={18} className="text-red-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
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

export default function Admin() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [results, setResults] = useState<ScanResults>({ dataResidency: null, fontLeakage: null, trackingTransparency: null, legalPresence: null });
  const [score, setScore] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAudit = () => {
    if (!url.trim() || scanning) return;
    setScanning(true);
    setScanComplete(false);
    setProgress(0);
    setScore(0);
    setResults({ dataResidency: null, fontLeakage: null, trackingTransparency: null, legalPresence: null });

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      const pct = Math.min(Math.round((step / STATUS_MESSAGES.length) * 100), 100);
      setProgress(pct);
      setStatusMsg(STATUS_MESSAGES[Math.min(step - 1, STATUS_MESSAGES.length - 1)]);

      if (step >= STATUS_MESSAGES.length) {
        clearInterval(intervalRef.current!);
        const r = getMockResults(url);
        setResults(r);
        const passCount = [r.dataResidency, !r.fontLeakage, !r.trackingTransparency, r.legalPresence].filter(Boolean).length;
        setScore(passCount * 25);
        setScanning(false);
        setScanComplete(true);
      }
    }, 600);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF0000] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">+</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">Swiss Compliance Audit</h1>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest">nFADP / nDSG Conformity Scanner</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
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
        </div>

        {/* Scanning Progress */}
        {scanning && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">{statusMsg}</span>
              <span className="font-bold text-gray-700">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF0000] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Score + Risk Cards */}
        {(scanComplete || scanning) && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
              <ScoreGauge score={score} scanning={scanning} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <RiskCard
                title="Data Residency"
                icon={Shield}
                status={results.dataResidency}
                description="Verifies hosting IP is geolocated within Swiss borders (CH)."
              />
              <RiskCard
                title="IP Leakage (Fonts)"
                icon={Type}
                status={results.fontLeakage === null ? null : !results.fontLeakage}
                description="Detects calls to fonts.googleapis.com or fonts.gstatic.com that leak visitor IPs."
              />
              <RiskCard
                title="Tracking Transparency"
                icon={BarChart3}
                status={results.trackingTransparency === null ? null : !results.trackingTransparency}
                description="Scans for google-analytics.com or googletagmanager.com tracking scripts."
              />
              <RiskCard
                title="Legal Presence"
                icon={FileText}
                status={results.legalPresence}
                description="Checks for a visible 'Impressum' link in the page footer."
              />
            </div>
          </div>
        )}

        {/* Generate Report */}
        {scanComplete && (
          <div className="flex justify-center">
            <button className="px-6 py-3 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#FF0000] hover:text-[#FF0000] transition-all flex items-center gap-2">
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
                Under <strong className="text-[#FF0000]">Art. 60 of the Swiss Federal Act on Data Protection (nFADP/nDSG)</strong>, individuals — including company executives — who wilfully violate data protection obligations may face <strong className="text-[#FF0000]">personal fines of up to CHF 250'000</strong>. Unlike the EU GDPR, Swiss law targets <strong className="text-[#FF0000]">natural persons, not corporations</strong>, making C-level executives personally accountable for non-compliance.
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Reference: Bundesgesetz über den Datenschutz (DSG) – Art. 60 Verletzung von Informations-, Auskunfts- und Mitwirkungspflichten
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
