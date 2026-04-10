import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, Clock, Monitor, Smartphone, Tablet, Globe, ArrowRight } from "lucide-react";

type Pageview = {
  id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  device_type: string | null;
  language: string | null;
  duration_ms: number | null;
  created_at: string;
};

type SessionGroup = {
  session_id: string;
  pages: Pageview[];
  device: string;
  language: string;
  started: string;
  totalDuration: number;
};

export default function AnalyticsTab() {
  const [pageviews, setPageviews] = useState<Pageview[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await supabase
      .from("pageviews")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(1000);

    setPageviews((data as Pageview[]) || []);
    setLoading(false);
  };

  // Group by session
  const sessions: SessionGroup[] = [];
  const sessionMap = new Map<string, Pageview[]>();
  for (const pv of pageviews) {
    if (!sessionMap.has(pv.session_id)) sessionMap.set(pv.session_id, []);
    sessionMap.get(pv.session_id)!.push(pv);
  }
  for (const [sid, pages] of sessionMap) {
    const sorted = pages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    sessions.push({
      session_id: sid,
      pages: sorted,
      device: sorted[0].device_type || "unknown",
      language: sorted[0].language || "unknown",
      started: sorted[0].created_at,
      totalDuration: sorted.reduce((sum, p) => sum + (p.duration_ms || 0), 0),
    });
  }
  sessions.sort((a, b) => new Date(b.started).getTime() - new Date(a.started).getTime());

  // Stats
  const uniqueSessions = sessions.length;
  const totalPageviews = pageviews.length;
  const avgPages = uniqueSessions ? (totalPageviews / uniqueSessions).toFixed(1) : "0";

  // Page popularity
  const pageCounts = new Map<string, number>();
  for (const pv of pageviews) {
    pageCounts.set(pv.path, (pageCounts.get(pv.path) || 0) + 1);
  }
  const topPages = [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Device breakdown
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
  for (const s of sessions) {
    if (s.device in deviceCounts) deviceCounts[s.device as keyof typeof deviceCounts]++;
  }

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === "mobile") return <Smartphone size={14} />;
    if (type === "tablet") return <Tablet size={14} />;
    return <Monitor size={14} />;
  };

  const formatDuration = (ms: number) => {
    if (!ms) return "—";
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading analytics…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {[1, 7, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              days === d ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d === 1 ? "Today" : `${d} days`}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Eye size={14} /> Sessions
          </div>
          <p className="text-2xl font-bold text-gray-900">{uniqueSessions}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <BarChart3 size={14} /> Pageviews
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPageviews}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Clock size={14} /> Pages / Session
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgPages}</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top pages */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Pages</h3>
          <div className="space-y-2">
            {topPages.map(([path, count]) => (
              <div key={path} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate font-mono text-xs">{path}</span>
                <span className="text-gray-500 font-medium ml-2">{count}</span>
              </div>
            ))}
            {topPages.length === 0 && <p className="text-gray-400 text-xs">No data yet</p>}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Devices</h3>
          <div className="space-y-2">
            {Object.entries(deviceCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <DeviceIcon type={type} />
                  <span className="capitalize">{type}</span>
                </div>
                <span className="text-gray-500 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session list */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Recent Sessions
          <span className="text-gray-400 font-normal ml-2">({sessions.length})</span>
        </h3>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sessions.slice(0, 50).map((s) => (
            <div key={s.session_id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <DeviceIcon type={s.device} />
                <span className="text-xs text-gray-500">{formatTime(s.started)}</span>
                <span className="text-xs text-gray-400">•</span>
                <Globe size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">{s.language}</span>
                {s.totalDuration > 0 && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{formatDuration(s.totalDuration)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {s.pages.map((p, i) => (
                  <span key={p.id} className="flex items-center gap-1">
                    <span className="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">
                      {p.path}
                    </span>
                    {p.duration_ms ? (
                      <span className="text-[10px] text-gray-400">{formatDuration(p.duration_ms)}</span>
                    ) : null}
                    {i < s.pages.length - 1 && <ArrowRight size={10} className="text-gray-300 mx-0.5" />}
                  </span>
                ))}
              </div>
              {s.pages[0]?.referrer && (
                <p className="text-[10px] text-gray-400 mt-1">
                  via {new URL(s.pages[0].referrer).hostname}
                </p>
              )}
            </div>
          ))}
          {sessions.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No sessions recorded yet</p>}
        </div>
      </div>
    </div>
  );
}
