import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SETTINGS_KEYS = [
  {
    key: "CAL_BOOKING_LINK",
    label: "Cal.com Booking Link",
    placeholder: "https://cal.com/your-username/30min",
    secret: false,
  },
];

export default function SettingsTab() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase.from("settings").select("key, value");
    const map: Record<string, string> = {};
    data?.forEach((row: any) => { map[row.key] = row.value; });
    setValues(map);
    setLoading(false);
  }

  async function saveSetting(key: string) {
    const value = values[key] || "";
    if (!value.trim()) return;

    const { error } = await supabase
      .from("settings")
      .upsert({ key, value: value.trim() }, { onConflict: "key" });

    if (!error) {
      setSaved((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading settings…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Integration Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure Cal.com for consultation booking.
        </p>
      </div>

      {SETTINGS_KEYS.map((setting) => (
        <div key={setting.key} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <label className="block text-sm font-semibold text-gray-700">{setting.label}</label>

          <div className="relative">
            <input
              type={setting.secret && !visible[setting.key] ? "password" : "text"}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#FF0000]/20 focus:border-[#FF0000] outline-none"
              placeholder={setting.placeholder}
              value={values[setting.key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
            />

            {setting.secret && (
              <button
                onClick={() => setVisible((prev) => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
              >
                {visible[setting.key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>

          <button
            onClick={() => saveSetting(setting.key)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            {saved[setting.key] ? (
              <>
                <CheckCircle2 size={16} className="text-green-400" />
                Saved
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        </div>
      ))}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Setup instructions:</strong>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>Sign up for a free <a href="https://cal.com" target="_blank" rel="noopener" className="underline">Cal.com</a> account</li>
          <li>Create an Event Type (e.g. "30 min consultation")</li>
          <li>Copy the booking link from your event type page</li>
          <li>Paste the full URL above (e.g. <code>https://cal.com/your-name/30min</code>)</li>
        </ol>
      </div>
    </div>
  );
}
