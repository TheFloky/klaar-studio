import { useState } from "react";
import { ArrowLeft, Shield, Users, Settings, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import ClientsTab from "@/components/admin/ClientsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import BookingsTab from "@/components/admin/BookingsTab";

// Lazy import the existing audit content
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

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/en" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <div className="w-8 h-8 bg-[#FF0000] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">+</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">klaar-Studio Admin</h1>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest">Internal Dashboard</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
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
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
