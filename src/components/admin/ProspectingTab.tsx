import { useState, useEffect } from "react";
import {
  Globe, Search, Loader2, Trash2, Mail, Copy, CheckCircle2, AlertTriangle,
  XCircle, Building2, Users, Phone, AtSign, TrendingUp, Shield, ExternalLink,
  ChevronDown, ChevronUp, Eye, EyeOff, Lock, Star, Target, FileText, Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateAuditPdf } from "@/lib/generateAuditPdf";

interface Prospect {
  id: string;
  website: string;
  company_name: string | null;
  niche: string | null;
  description: string | null;
  contacts: any;
  financials: any;
  reputation: any;
  compliance_score: number;
  compliance_details: any;
  research_summary: string | null;
  email_draft: string | null;
  email_subject: string | null;
  email_language: string | null;
  demo_site_url: string | null;
  demo_site_password: string | null;
  status: string;
  created_at: string;
  email_demo_sent: boolean;
  email_sent: boolean;
  meeting_done: boolean;
}

interface EmailVariant {
  email: string;
  subject: string;
}

const LANGUAGES = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

function ComplianceBadge({ level }: { level: string }) {
  if (level === "green") return <CheckCircle2 size={14} className="text-green-500" />;
  if (level === "yellow") return <AlertTriangle size={14} className="text-amber-500" />;
  return <XCircle size={14} className="text-red-500" />;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "text-green-600 bg-green-50" : score >= 50 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>{score}%</span>;
}

export default function ProspectingTab() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [researching, setResearching] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingEmailId, setGeneratingEmailId] = useState<string | null>(null);
  const [emailLanguage, setEmailLanguage] = useState("de");
  const [includeDemoSite, setIncludeDemoSite] = useState(false);
  const [demoUrl, setDemoUrl] = useState("");
  const [demoPassword, setDemoPassword] = useState("");
  const [emailVariants, setEmailVariants] = useState<EmailVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null);
  const [auditPdfUrls, setAuditPdfUrls] = useState<Record<string, string>>({});
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferFee, setTransferFee] = useState("");
  const [transferMaintenance, setTransferMaintenance] = useState("");
  const { toast } = useToast();

  const fetchProspects = async () => {
    const { data } = await supabase
      .from("prospects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProspects(data as unknown as Prospect[]);
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const startResearch = async () => {
    if (!newUrl.trim() || researching) return;
    setResearching(true);

    try {
      const { data: inserted, error: insertErr } = await supabase
        .from("prospects")
        .insert({ website: newUrl.trim(), status: "researching" })
        .select()
        .single();

      if (insertErr || !inserted) throw new Error(insertErr?.message || "Insert failed");

      setNewUrl("");
      await fetchProspects();

      const { data: resData, error: resErr } = await supabase.functions.invoke("prospect-research", {
        body: { url: newUrl.trim() },
      });

      if (resErr || !resData?.success) {
        await supabase.from("prospects").update({ status: "failed" }).eq("id", inserted.id);
        toast({ title: "Research failed", description: resErr?.message || "Could not research this website", variant: "destructive" });
        await fetchProspects();
        return;
      }

      const r = resData.result;
      await supabase
        .from("prospects")
        .update({
          company_name: r.company_name,
          niche: r.niche,
          description: r.description,
          contacts: r.contacts ? JSON.stringify(r.contacts) === "[]" ? r.contacts : r.contacts : [],
          financials: r.financials,
          reputation: r.reputation,
          compliance_score: r.compliance_score,
          compliance_details: r.compliance_details,
          research_summary: r.research_summary,
          email_language: r.website_language || "de",
          status: "completed",
        } as any)
        .eq("id", inserted.id);

      const scanInfo = r.scan_count ? ` (${r.scan_count} scans merged)` : "";
      toast({ title: "Research complete", description: `${r.company_name} has been analyzed.${scanInfo}` });
      await fetchProspects();
      setExpandedId(inserted.id);
    } catch (e: any) {
      console.error("Research error:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setResearching(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const uploadAuditPdf = async (prospect: Prospect) => {
    setUploadingPdf(prospect.id);
    try {
      const cd = prospect.compliance_details || {};
      const pdfBlob = generateAuditPdf({
        targetUrl: prospect.website,
        siteTitle: prospect.company_name || undefined,
        score: prospect.compliance_score,
        dataResidency: cd.dataResidency || "red",
        fontLeakage: cd.fontLeakage || false,
        trackingTransparency: cd.trackingTransparency || false,
        legalPresence: cd.legalPresence || "red",
        details: cd.details,
      }, { returnBlob: true });

      const slug = generateSlug(prospect.company_name || prospect.website);
      const filePath = `${slug}.pdf`;

      const { error: uploadErr } = await supabase.storage
        .from("audit-reports")
        .upload(filePath, pdfBlob, { contentType: "application/pdf", upsert: true });

      if (uploadErr) throw uploadErr;

      const publishedUrl = "https://klaar-studio.lovable.app";
      const auditUrl = `${publishedUrl}/audits/${slug}`;
      setAuditPdfUrls(prev => ({ ...prev, [prospect.id]: auditUrl }));
      toast({ title: "Audit PDF uploaded", description: `Shareable link: ${auditUrl}` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploadingPdf(null);
    }
  };

  const generateEmail = async (prospect: Prospect) => {
    setGeneratingEmailId(prospect.id);
    setEmailVariants([]);
    setSelectedVariant(0);
    try {
      const { data, error } = await supabase.functions.invoke("generate-outreach-email", {
        body: {
          prospect: {
            company_name: prospect.company_name,
            website: prospect.website,
            niche: prospect.niche,
            description: prospect.description,
            contacts: prospect.contacts,
            compliance_score: prospect.compliance_score,
            compliance_details: prospect.compliance_details,
            reputation: {
              ...(prospect.reputation as any || {}),
              pain_points: ((prospect.reputation as any)?.pain_points || []).filter(
                (p: string) => !((prospect.reputation as any)?.muted_pain_points || []).includes(p)
              ),
            },
          },
          language: emailLanguage,
          includeDemoSite,
          demoSiteUrl: demoUrl || null,
          demoSitePassword: demoPassword || null,
          auditPdfUrl: auditPdfUrls[prospect.id] || null,
        },
      });

      if (error || !data?.success) throw new Error(error?.message || "Email generation failed");

      const variants: EmailVariant[] = data.variants || [{ email: data.email, subject: data.subject }];
      setEmailVariants(variants);

      // Save the first variant by default
      await supabase
        .from("prospects")
        .update({
          email_draft: variants[0]?.email || data.email,
          email_subject: variants[0]?.subject || data.subject || null,
          email_language: emailLanguage,
          demo_site_url: includeDemoSite ? demoUrl : null,
          demo_site_password: includeDemoSite ? demoPassword : null,
        } as any)
        .eq("id", prospect.id);

      toast({ title: `${variants.length} email variants generated` });
      await fetchProspects();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingEmailId(null);
    }
  };

  const selectVariant = async (prospect: Prospect, index: number) => {
    setSelectedVariant(index);
    const v = emailVariants[index];
    if (!v) return;
    await supabase
      .from("prospects")
      .update({ email_draft: v.email, email_subject: v.subject || null } as any)
      .eq("id", prospect.id);
    await fetchProspects();
    toast({ title: `Variant ${index + 1} selected` });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const deleteProspect = async (id: string) => {
    await supabase.from("prospects").delete().eq("id", id);
    setProspects((prev) => prev.filter((p) => p.id !== id));
  };

  const removePainPoint = async (prospectId: string, index: number) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return;
    const rep = prospect.reputation || {};
    const painPoints = [...(rep.pain_points || [])];
    const muted = [...(rep.muted_pain_points || [])];
    // Also remove from muted if it was muted
    const removedPoint = painPoints[index];
    painPoints.splice(index, 1);
    const newMuted = muted.filter((m: string) => m !== removedPoint);
    const updatedRep = { ...rep, pain_points: painPoints, muted_pain_points: newMuted };
    await supabase.from("prospects").update({ reputation: updatedRep } as any).eq("id", prospectId);
    setProspects((prev) => prev.map((p) => p.id === prospectId ? { ...p, reputation: updatedRep } : p));
    toast({ title: "Pain point removed" });
  };

  const toggleMutePainPoint = async (prospectId: string, painPoint: string) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return;
    const rep = prospect.reputation || {};
    const muted = [...(rep.muted_pain_points || [])];
    const isMuted = muted.includes(painPoint);
    const newMuted = isMuted ? muted.filter((m: string) => m !== painPoint) : [...muted, painPoint];
    const updatedRep = { ...rep, muted_pain_points: newMuted };
    await supabase.from("prospects").update({ reputation: updatedRep } as any).eq("id", prospectId);
    setProspects((prev) => prev.map((p) => p.id === prospectId ? { ...p, reputation: updatedRep } : p));
    toast({ title: isMuted ? "Pain point will be mentioned in email" : "Pain point won't be mentioned in email" });
  };

  const toggleProspectCheckbox = async (id: string, field: "email_demo_sent" | "email_sent" | "meeting_done") => {
    const prospect = prospects.find((p) => p.id === id);
    if (!prospect) return;
    const newVal = !prospect[field];
    await supabase.from("prospects").update({ [field]: newVal } as any).eq("id", id);
    setProspects((prev) => prev.map((p) => p.id === id ? { ...p, [field]: newVal } : p));
  };

  const openTransferModal = (id: string) => {
    setTransferId(id);
    setTransferFee("");
    setTransferMaintenance("");
  };

  const executeTransfer = async () => {
    const prospect = prospects.find((p) => p.id === transferId);
    if (!prospect) return;
    const { error } = await supabase.from("clients").insert({
      website: prospect.website,
      name: prospect.company_name,
      niche: prospect.niche,
      compliance_score: prospect.compliance_score,
      compliance_details: prospect.compliance_details,
      project_fee: parseFloat(transferFee) || 0,
      maintenance_fee: parseFloat(transferMaintenance) || 0,
    } as any);
    if (!error) {
      await supabase.from("prospects").delete().eq("id", prospect.id);
      setProspects((prev) => prev.filter((p) => p.id !== prospect.id));
      toast({ title: "Client transferred", description: `${prospect.company_name} moved to Clients tab.` });
    } else {
      toast({ title: "Transfer failed", description: error.message, variant: "destructive" });
    }
    setTransferId(null);
  };

  const convertToClient = async (prospect: Prospect) => {
    openTransferModal(prospect.id);
  };

  const VARIANT_LABELS = ["Formal & Data-driven", "Warm & Personal", "Concise & Direct"];

  return (
    <div className="space-y-6">
      {/* Research Input */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
          Research a Potential Client
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Enter a website URL to gather company intelligence (3x scans merged for accuracy), compliance audit, and generate 3 outreach email variants.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://company-website.ch"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] transition-all bg-gray-50 dark:bg-gray-800 dark:text-white"
              onKeyDown={(e) => e.key === "Enter" && startResearch()}
            />
          </div>
          <button
            onClick={startResearch}
            disabled={!newUrl.trim() || researching}
            className="px-5 py-3 bg-[#FF0000] text-white font-semibold text-sm rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {researching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {researching ? "Researching (3x scan)…" : "Research"}
          </button>
        </div>
      </div>

      {/* Prospect List */}
      {prospects.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
          <Search size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No prospects yet. Enter a website URL above to start researching.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prospects.map((prospect) => {
            const isExpanded = expandedId === prospect.id;
            const contacts = Array.isArray(prospect.contacts) ? prospect.contacts : [];
            const financials = prospect.financials || {};
            const reputation = prospect.reputation || {};
            const cd = prospect.compliance_details || {};

            return (
              <div key={prospect.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : prospect.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {prospect.company_name || "Researching…"}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          prospect.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          prospect.status === "researching" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          prospect.status === "emailed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          {prospect.status}
                        </span>
                        {prospect.compliance_score > 0 && <ScoreBadge score={prospect.compliance_score} />}
                        {reputation.client_quality_score?.score != null && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1" title="Client Quality Score">
                            <Target size={10} /> {reputation.client_quality_score.score}%
                          </span>
                        )}
                        {reputation.reputation_score?.score != null && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1" title="Reputation Score">
                            <Star size={10} /> {reputation.reputation_score.score}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <a href={prospect.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-[#FF0000] inline-flex items-center gap-1">
                          {prospect.website} <ExternalLink size={10} />
                        </a>
                        {prospect.niche && <span>• {prospect.niche}</span>}
                      </div>
                    </div>
                    {/* Tracking Checkboxes */}
                    {prospect.status === "completed" && (
                      <div className="flex items-center gap-4 mt-2" onClick={(e) => e.stopPropagation()}>
                        {([
                          { field: "email_demo_sent" as const, label: "Website demo" },
                          { field: "email_sent" as const, label: "Email sent" },
                          { field: "meeting_done" as const, label: "Meeting done" },
                        ]).map(({ field, label }) => (
                          <label key={field} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={prospect[field]}
                              onChange={() => toggleProspectCheckbox(prospect.id, field)}
                              className="rounded border-gray-300 text-[#FF0000] focus:ring-[#FF0000]/20 h-3.5 w-3.5"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); deleteProspect(prospect.id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && prospect.status === "completed" && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    {/* Summary */}
                    {prospect.research_summary && (
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Executive Summary</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{prospect.research_summary}</p>
                      </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                      {/* Contacts */}
                      <div className="bg-white dark:bg-gray-900 p-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1">
                          <Users size={12} /> Contacts
                        </h4>
                        {contacts.length > 0 ? contacts.map((c: any, i: number) => (
                          <div key={i} className="mb-2 last:mb-0">
                            {c.name && <p className="text-xs font-medium text-gray-900 dark:text-white">{c.name}</p>}
                            {c.role && <p className="text-[11px] text-gray-500">{c.role}</p>}
                            {c.email && (
                              <button onClick={() => copyToClipboard(c.email)} className="text-[11px] text-[#FF0000] hover:underline flex items-center gap-1 mt-0.5">
                                <AtSign size={10} /> {c.email}
                              </button>
                            )}
                            {c.phone && <p className="text-[11px] text-gray-500 flex items-center gap-1"><Phone size={10} /> {c.phone}</p>}
                          </div>
                        )) : <p className="text-xs text-gray-400">No contacts found</p>}
                      </div>

                      {/* Financials */}
                      <div className="bg-white dark:bg-gray-900 p-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1">
                          <TrendingUp size={12} /> Company Profile
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          <div><span className="text-gray-400">Size:</span> <span className="text-gray-700 dark:text-gray-300">{financials.estimated_size || "—"}</span></div>
                          <div><span className="text-gray-400">Employees:</span> <span className="text-gray-700 dark:text-gray-300">{financials.estimated_employees || "—"}</span></div>
                          <div><span className="text-gray-400">Revenue:</span> <span className="text-gray-700 dark:text-gray-300">{financials.estimated_revenue || "—"}</span></div>
                        </div>
                      </div>

                      {/* Compliance */}
                      <div className="bg-white dark:bg-gray-900 p-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1">
                          <Shield size={12} /> Compliance Audit
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <ComplianceBadge level={cd.dataResidency || "red"} />
                            <span className="text-gray-700 dark:text-gray-300">Server: {cd.details?.ip?.country || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ComplianceBadge level={cd.fontLeakage ? "red" : "green"} />
                            <span className="text-gray-700 dark:text-gray-300">Font Privacy</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ComplianceBadge level={cd.trackingTransparency ? "red" : "green"} />
                            <span className="text-gray-700 dark:text-gray-300">Tracking</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ComplianceBadge level={cd.legalPresence || "red"} />
                            <span className="text-gray-700 dark:text-gray-300">Legal Presence</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scores */}
                    {(reputation.client_quality_score || reputation.reputation_score) && (
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {reputation.client_quality_score && (
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-3 flex items-center gap-1">
                                <Target size={12} /> Client Quality Score: {reputation.client_quality_score.score}%
                              </h4>
                              <div className="space-y-2">
                                {["website_condition", "outreach_likelihood", "budget_potential"].map((key) => (
                                  <div key={key} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">{key.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${reputation.client_quality_score[key] || 0}%` }} />
                                      </div>
                                      <span className="text-gray-700 dark:text-gray-300 font-medium w-8 text-right">{reputation.client_quality_score[key]}%</span>
                                    </div>
                                  </div>
                                ))}
                                {reputation.client_quality_score.reasoning && (
                                  <p className="text-[11px] text-gray-500 mt-1 italic">{reputation.client_quality_score.reasoning}</p>
                                )}
                              </div>
                            </div>
                          )}
                          {reputation.reputation_score && (
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-3 flex items-center gap-1">
                                <Star size={12} /> Reputation Score: {reputation.reputation_score.score}%
                              </h4>
                              <div className="space-y-2 text-xs">
                                {reputation.reputation_score.google_rating_estimate && (
                                  <div className="flex items-center gap-1.5">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{reputation.reputation_score.google_rating_estimate}</span>
                                    <span className="text-gray-400">Google Maps</span>
                                  </div>
                                )}
                                {reputation.reputation_score.trust_signals?.length > 0 && (
                                  <div>
                                    <span className="text-gray-400 text-[10px] uppercase">Trust Signals</span>
                                    <ul className="mt-1 space-y-0.5">
                                      {reputation.reputation_score.trust_signals.map((s: string, i: number) => (
                                        <li key={i} className="text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                          <CheckCircle2 size={10} className="text-green-400 shrink-0 mt-0.5" /> {s}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {reputation.reputation_score.red_flags?.length > 0 && (
                                  <div>
                                    <span className="text-gray-400 text-[10px] uppercase">Red Flags</span>
                                    <ul className="mt-1 space-y-0.5">
                                      {reputation.reputation_score.red_flags.map((f: string, i: number) => (
                                        <li key={i} className="text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                          <XCircle size={10} className="text-red-400 shrink-0 mt-0.5" /> {f}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {reputation.reputation_score.reasoning && (
                                  <p className="text-[11px] text-gray-500 mt-1 italic">{reputation.reputation_score.reasoning}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reputation */}
                    {(reputation.pain_points?.length > 0 || reputation.strengths?.length > 0) && (
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                          {reputation.pain_points?.length > 0 && (
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">Pain Points</h4>
                              <ul className="space-y-1">
                                {reputation.pain_points.map((p: string, i: number) => {
                                  const isMuted = (reputation.muted_pain_points || []).includes(p);
                                  return (
                                    <li key={i} className={`text-xs flex items-start gap-1.5 group ${isMuted ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
                                      <XCircle size={12} className={`shrink-0 mt-0.5 ${isMuted ? 'text-gray-300 dark:text-gray-600' : 'text-red-400'}`} />
                                      <span className="flex-1">{p}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMutePainPoint(prospect.id, p); }}
                                        className={`shrink-0 p-1 rounded transition-all ${isMuted ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                        title={isMuted ? "Include in email" : "Don't mention in email"}
                                      >
                                        {isMuted ? <Eye size={14} /> : <EyeOff size={14} />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removePainPoint(prospect.id, i); }}
                                        className="text-gray-400 hover:text-red-500 transition-all shrink-0 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Delete this pain point"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                          {reputation.strengths?.length > 0 && (
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider text-green-400 font-semibold mb-2">Strengths</h4>
                              <ul className="space-y-1">
                                {reputation.strengths.map((s: string, i: number) => (
                                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                                    <CheckCircle2 size={12} className="text-green-400 shrink-0 mt-0.5" /> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Audit PDF & Email Generation */}
                    <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/30">
                      {/* Audit PDF Section */}
                      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1">
                          <FileText size={12} /> Audit Report PDF
                        </h4>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => uploadAuditPdf(prospect)}
                            disabled={uploadingPdf === prospect.id}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-800 dark:bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-all flex items-center gap-2"
                          >
                            {uploadingPdf === prospect.id ? (
                              <><Loader2 size={12} className="animate-spin" /> Uploading…</>
                            ) : (
                              <><FileText size={12} /> Generate & Upload PDF</>
                            )}
                          </button>
                          {auditPdfUrls[prospect.id] && (
                            <div className="flex items-center gap-2">
                              <a
                                href={auditPdfUrls[prospect.id]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#FF0000] hover:underline flex items-center gap-1"
                              >
                                <LinkIcon size={10} /> {auditPdfUrls[prospect.id]}
                              </a>
                              <button
                                onClick={() => copyToClipboard(auditPdfUrls[prospect.id])}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Copy link"
                              >
                                <Copy size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email Section */}
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1">
                        <Mail size={12} /> Outreach Email (3 variants)
                      </h4>

                      {/* Email Controls */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <select
                          value={emailLanguage}
                          onChange={(e) => setEmailLanguage(e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>{l.label}</option>
                          ))}
                        </select>

                        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeDemoSite}
                            onChange={(e) => setIncludeDemoSite(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <Eye size={12} /> Include preview/demo site
                        </label>

                        <button
                          onClick={() => generateEmail(prospect)}
                          disabled={generatingEmailId === prospect.id}
                          className="ml-auto px-4 py-1.5 bg-[#FF0000] text-white text-xs font-semibold rounded-lg hover:bg-red-600 disabled:opacity-40 transition-all flex items-center gap-2"
                        >
                          {generatingEmailId === prospect.id ? (
                            <><Loader2 size={12} className="animate-spin" /> Generating 3 variants…</>
                          ) : (
                            <><Mail size={12} /> Generate 3 Emails</>
                          )}
                        </button>
                      </div>

                      {/* Demo site fields */}
                      {includeDemoSite && (
                        <div className="flex gap-3 mb-3">
                          <div className="relative flex-1">
                            <Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="url"
                              value={demoUrl}
                              onChange={(e) => setDemoUrl(e.target.value)}
                              placeholder="https://demo-site.lovable.app"
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs bg-white dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <div className="relative flex-1">
                            <Lock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={demoPassword}
                              onChange={(e) => setDemoPassword(e.target.value)}
                              placeholder="Access password"
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs bg-white dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* Email Variants */}
                      {emailVariants.length > 1 && (
                        <div className="mb-3">
                          <div className="flex gap-2">
                            {emailVariants.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => selectVariant(prospect, i)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                  selectedVariant === i
                                    ? "bg-[#FF0000] text-white border-[#FF0000]"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-[#FF0000]/50"
                                }`}
                              >
                                Variant {i + 1}: {VARIANT_LABELS[i] || `#${i + 1}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show current variant or saved draft */}
                      {(() => {
                        const currentEmail = emailVariants.length > 0 ? emailVariants[selectedVariant]?.email : prospect.email_draft;
                        const currentSubject = emailVariants.length > 0 ? emailVariants[selectedVariant]?.subject : prospect.email_subject;

                        if (!currentEmail) return null;

                        return (
                          <div className="mt-3">
                            {currentSubject && (
                              <div className="mb-2 flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Subject:</span>
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{currentSubject}</span>
                                <button
                                  onClick={() => copyToClipboard(currentSubject)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  title="Copy subject"
                                >
                                  <Copy size={10} />
                                </button>
                              </div>
                            )}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                                {currentEmail}
                              </pre>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => copyToClipboard(currentEmail)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5"
                              >
                                <Copy size={12} /> Copy Email
                              </button>
                              {contacts[0]?.email && (
                                <a
                                  href={`mailto:${contacts[0].email}?subject=${encodeURIComponent(currentSubject || "")}&body=${encodeURIComponent(currentEmail)}`}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#FF0000] rounded-lg hover:bg-red-600 transition-all flex items-center gap-1.5"
                                >
                                  <Mail size={12} /> Open in Mail Client
                                </a>
                              )}
                              <button
                                onClick={() => convertToClient(prospect)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 ml-auto"
                              >
                                <Building2 size={12} /> Transfer to Client
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer to Client Modal */}
      {transferId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setTransferId(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Transfer to Client</h3>
            <p className="text-xs text-gray-400 mb-4">
              Move <strong>{prospects.find(p => p.id === transferId)?.company_name}</strong> to the Clients tab with pricing details.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">Project Fee (CHF)</label>
                <input
                  type="number"
                  value={transferFee}
                  onChange={(e) => setTransferFee(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">Monthly Maintenance Fee (CHF)</label>
                <input
                  type="number"
                  value={transferMaintenance}
                  onChange={(e) => setTransferMaintenance(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setTransferId(null)}
                className="flex-1 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeTransfer}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-1.5"
              >
                <Building2 size={14} /> Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
