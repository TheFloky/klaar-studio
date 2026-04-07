import { useState, useEffect } from "react";
import { Globe, Plus, CheckCircle2, Circle, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientTodo {
  mock_website: boolean;
  client_outreach: boolean;
  create_website: boolean;
  revision: boolean;
  host_website: boolean;
}

interface Client {
  id: string;
  name: string | null;
  website: string;
  niche: string | null;
  tier: string;
  compliance_score: number;
  compliance_details: Record<string, unknown>;
  status: string;
  todos: ClientTodo;
  created_at: string;
}

const TODO_LABELS: Record<keyof ClientTodo, string> = {
  mock_website: "Mock Website",
  client_outreach: "Client Outreach",
  create_website: "Create Website",
  revision: "Revision",
  host_website: "Host Website",
};

const TIERS = ["Starter", "Business", "E-commerce", "Elite"];

function suggestTier(details: Record<string, unknown>): string {
  const desc = ((details as any)?.details?.siteDescription || "").toLowerCase();
  const title = ((details as any)?.details?.siteTitle || "").toLowerCase();
  const combined = `${title} ${desc}`;

  if (combined.includes("shop") || combined.includes("store") || combined.includes("ecommerce") || combined.includes("e-commerce") || combined.includes("cart") || combined.includes("buy")) {
    return "E-commerce";
  }
  if (combined.includes("enterprise") || combined.includes("global") || combined.includes("solutions") || combined.includes("consulting") || combined.includes("group")) {
    return "Elite";
  }
  if (combined.includes("service") || combined.includes("agency") || combined.includes("company") || combined.includes("gmbh") || combined.includes("business")) {
    return "Business";
  }
  return "Starter";
}

function guessNiche(details: Record<string, unknown>): string {
  const desc = ((details as any)?.details?.siteDescription || "").toLowerCase();
  const title = ((details as any)?.details?.siteTitle || "").toLowerCase();
  const combined = `${title} ${desc}`;

  const niches: [string, string[]][] = [
    ["Technology", ["tech", "software", "saas", "app", "digital", "cloud", "ai", "data"]],
    ["Finance", ["finance", "bank", "invest", "insurance", "fintech", "crypto"]],
    ["Healthcare", ["health", "medical", "pharma", "clinic", "doctor", "wellness"]],
    ["E-commerce", ["shop", "store", "retail", "ecommerce", "fashion", "buy"]],
    ["Real Estate", ["real estate", "property", "immobilien", "wohnung"]],
    ["Legal", ["law", "legal", "attorney", "anwalt", "recht"]],
    ["Hospitality", ["hotel", "restaurant", "travel", "tourism", "gastro"]],
    ["Education", ["education", "school", "university", "learn", "training"]],
    ["Construction", ["construction", "bau", "building", "architect"]],
  ];

  for (const [niche, keywords] of niches) {
    if (keywords.some((k) => combined.includes(k))) return niche;
  }
  return "General";
}

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setClients(data as unknown as Client[]);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async () => {
    if (!newUrl.trim() || loading) return;
    setLoading(true);

    try {
      // Insert client with just the URL first
      const { data: inserted, error: insertErr } = await supabase
        .from("clients")
        .insert({ website: newUrl.trim() })
        .select()
        .single();

      if (insertErr || !inserted) throw new Error(insertErr?.message || "Insert failed");

      setNewUrl("");
      await fetchClients();

      // Now run compliance scan to auto-fill
      setScanningId(inserted.id);
      const { data: scanData, error: scanErr } = await supabase.functions.invoke("compliance-scan", {
        body: { url: newUrl.trim() },
      });

      if (!scanErr && scanData?.success) {
        const r = scanData.results;
        const passCount = [r.dataResidency, !r.fontLeakage, !r.trackingTransparency, r.legalPresence].filter(Boolean).length;
        const score = passCount * 25;
        const tier = suggestTier({ details: r.details });
        const niche = guessNiche({ details: r.details });
        const name = r.details?.siteTitle || new URL(newUrl.trim().startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`).hostname;

        await supabase
          .from("clients")
          .update({
            name,
            niche,
            tier,
            compliance_score: score,
            compliance_details: r,
          })
          .eq("id", inserted.id);

        await fetchClients();
      }
    } catch (e) {
      console.error("Failed to add client:", e);
    } finally {
      setLoading(false);
      setScanningId(null);
    }
  };

  const toggleTodo = async (clientId: string, todoKey: keyof ClientTodo) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const updated = { ...client.todos, [todoKey]: !client.todos[todoKey] };
    await supabase.from("clients").update({ todos: updated }).eq("id", clientId);
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, todos: updated } : c)));
  };

  const updateField = async (clientId: string, field: string, value: string) => {
    const updateData: Record<string, string> = {};
    updateData[field] = value;
    await supabase.from("clients").update(updateData as any).eq("id", clientId);
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, [field]: value } : c)));
  };

  const deleteClient = async (clientId: string) => {
    await supabase.from("clients").delete().eq("id", clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  };

  const rescan = async (client: Client) => {
    setScanningId(client.id);
    try {
      const { data: scanData, error: scanErr } = await supabase.functions.invoke("compliance-scan", {
        body: { url: client.website },
      });
      if (!scanErr && scanData?.success) {
        const r = scanData.results;
        const passCount = [r.dataResidency, !r.fontLeakage, !r.trackingTransparency, r.legalPresence].filter(Boolean).length;
        const score = passCount * 25;
        const tier = suggestTier({ details: r.details });
        const niche = guessNiche({ details: r.details });
        const name = r.details?.siteTitle || client.name;

        await supabase.from("clients").update({ name, niche, tier, compliance_score: score, compliance_details: r }).eq("id", client.id);
        await fetchClients();
      }
    } finally {
      setScanningId(null);
    }
  };

  const todoProgress = (todos: ClientTodo) => {
    const total = Object.keys(todos).length;
    const done = Object.values(todos).filter(Boolean).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  };

  return (
    <div className="space-y-6">
      {/* Add Client */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
          Add Client by Website URL
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://client-website.ch"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] transition-all bg-gray-50"
              onKeyDown={(e) => e.key === "Enter" && addClient()}
            />
          </div>
          <button
            onClick={addClient}
            disabled={!newUrl.trim() || loading}
            className="px-5 py-3 bg-[#FF0000] text-white font-semibold text-sm rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            Add & Scan
          </button>
        </div>
      </div>

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No clients yet. Add one by entering their website URL above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const prog = todoProgress(client.todos);
            const isScanning = scanningId === client.id;
            return (
              <div key={client.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Client Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900 truncate">
                          {client.name || "Scanning..."}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          client.status === "active" ? "bg-green-100 text-green-700" :
                          client.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#FF0000] transition-colors inline-flex items-center gap-1">
                        {client.website} <ExternalLink size={10} />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => rescan(client)} disabled={isScanning} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40" title="Rescan">
                        <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
                      </button>
                      <button onClick={() => deleteClient(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Niche</span>
                      <span className="text-xs font-medium text-gray-700">{client.niche || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Tier</span>
                      <select
                        value={client.tier}
                        onChange={(e) => updateField(client.id, "tier", e.target.value)}
                        className="text-xs font-medium text-gray-700 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                      >
                        {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Compliance</span>
                      <span className={`text-xs font-bold ${
                        client.compliance_score >= 75 ? "text-green-600" :
                        client.compliance_score >= 50 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {client.compliance_score}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Status</span>
                      <select
                        value={client.status}
                        onChange={(e) => updateField(client.id, "status", e.target.value)}
                        className="text-xs font-medium text-gray-700 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                      >
                        <option value="prospect">Prospect</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Todo Checklist */}
                <div className="px-5 py-3 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Progress</span>
                    <span className="text-[10px] font-bold text-gray-500">{prog.done}/{prog.total} ({prog.pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-[#FF0000] rounded-full transition-all duration-300" style={{ width: `${prog.pct}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {(Object.keys(TODO_LABELS) as (keyof ClientTodo)[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleTodo(client.id, key)}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors py-0.5"
                      >
                        {client.todos[key] ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <Circle size={14} className="text-gray-300" />
                        )}
                        <span className={client.todos[key] ? "line-through text-gray-400" : ""}>
                          {TODO_LABELS[key]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
