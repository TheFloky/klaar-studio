import { useState, useEffect } from "react";
import {
  Globe, Search, Loader2, Trash2, Mail, Copy, CheckCircle2, AlertTriangle,
  XCircle, Building2, Users, Phone, AtSign, TrendingUp, Shield, ExternalLink,
  ChevronDown, ChevronUp, Eye, Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  email_language: string | null;
  demo_site_url: string | null;
  demo_site_password: string | null;
  status: string;
  created_at: string;
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
      // Insert prospect
      const { data: inserted, error: insertErr } = await supabase
        .from("prospects")
        .insert({ website: newUrl.trim(), status: "researching" })
        .select()
        .single();

      if (insertErr || !inserted) throw new Error(insertErr?.message || "Insert failed");

      setNewUrl("");
      await fetchProspects();

      // Run research
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

      toast({ title: "Research complete", description: `${r.company_name} has been analyzed.` });
      await fetchProspects();
      setExpandedId(inserted.id);
    } catch (e: any) {
      console.error("Research error:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setResearching(false);
    }
  };

  const generateEmail = async (prospect: Prospect) => {
    setGeneratingEmailId(prospect.id);
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
            reputation: prospect.reputation,
          },
          language: emailLanguage,
          includeDemoSite,
          demoSiteUrl: demoUrl || null,
          demoSitePassword: demoPassword || null,
        },
      });

      if (error || !data?.success) throw new Error(error?.message || "Email generation failed");

      await supabase
        .from("prospects")
        .update({
          email_draft: data.email,
          email_language: emailLanguage,
          demo_site_url: includeDemoSite ? demoUrl : null,
          demo_site_password: includeDemoSite ? demoPassword : null,
        } as any)
        .eq("id", prospect.id);

      toast({ title: "Email draft generated" });
      await fetchProspects();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingEmailId(null);
    }
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
    painPoints.splice(index, 1);
    const updatedRep = { ...rep, pain_points: painPoints };
    await supabase.from("prospects").update({ reputation: updatedRep } as any).eq("id", prospectId);
    setProspects((prev) => prev.map((p) => p.id === prospectId ? { ...p, reputation: updatedRep } : p));
    toast({ title: "Pain point removed" });
  };

  const convertToClient = async (prospect: Prospect) => {
    const { error } = await supabase.from("clients").insert({
      website: prospect.website,
      name: prospect.company_name,
      niche: prospect.niche,
      compliance_score: prospect.compliance_score,
      compliance_details: prospect.compliance_details,
    });
    if (!error) {
      toast({ title: "Client created", description: `${prospect.company_name} added to Clients.` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Research Input */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
          Research a Potential Client
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Enter a website URL to gather company intelligence, compliance audit, and generate an outreach email.
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
            {researching ? "Researching…" : "Research"}
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
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <a href={prospect.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-[#FF0000] inline-flex items-center gap-1">
                          {prospect.website} <ExternalLink size={10} />
                        </a>
                        {prospect.niche && <span>• {prospect.niche}</span>}
                      </div>
                    </div>
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

                    {/* Reputation */}
                    {(reputation.pain_points?.length > 0 || reputation.strengths?.length > 0) && (
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                          {reputation.pain_points?.length > 0 && (
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">Pain Points</h4>
                              <ul className="space-y-1">
                                {reputation.pain_points.map((p: string, i: number) => (
                                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5 group">
                                    <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" /> 
                                    <span className="flex-1">{p}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removePainPoint(prospect.id, i);
                                      }}
                                      className="text-gray-400 hover:text-red-500 transition-all shrink-0 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                      title="Remove this pain point"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </li>
                                ))}
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

                    {/* Email Generation */}
                    <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/30">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1">
                        <Mail size={12} /> Outreach Email
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
                            <><Loader2 size={12} className="animate-spin" /> Generating…</>
                          ) : (
                            <><Mail size={12} /> Generate Email</>
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

                      {/* Email Draft */}
                      {prospect.email_draft && (
                        <div className="mt-3">
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                              {prospect.email_draft}
                            </pre>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => copyToClipboard(prospect.email_draft || "")}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5"
                            >
                              <Copy size={12} /> Copy Email
                            </button>
                            {contacts[0]?.email && (
                              <a
                                href={`mailto:${contacts[0].email}?body=${encodeURIComponent(prospect.email_draft || "")}`}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-[#FF0000] rounded-lg hover:bg-red-600 transition-all flex items-center gap-1.5"
                              >
                                <Mail size={12} /> Open in Mail Client
                              </a>
                            )}
                            <button
                              onClick={() => convertToClient(prospect)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <Building2 size={12} /> Add to Clients
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
