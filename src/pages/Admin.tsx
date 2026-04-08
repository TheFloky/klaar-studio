import { useState, useEffect } from "react";
import { ArrowLeft, Shield, Users, Settings, CalendarDays, LogOut, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import ClientsTab from "@/components/admin/ClientsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import BookingsTab from "@/components/admin/BookingsTab";
import AuditTab from "@/components/admin/AuditTab";

const TABS = [
  { id: "audit", label: "Compliance Audit", icon: Shield },
  { id: "clients", label: "Clients", icon: Users },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>("clients");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>;
  }

  if (!session) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif" }}>
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/de" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <div className="w-8 h-8 bg-[#FF0000] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight text-gray-900">klaar-Studio Admin</h1>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest">Internal Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[#FF0000] text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "clients" && <ClientsTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
