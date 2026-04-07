import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Loader2, Trash2 } from "lucide-react";

type Booking = {
  id: string;
  name: string;
  email: string | null;
  business: string;
  needs: string;
  tier: string | null;
  slot_start: string;
  slot_end: string;
  calendar_event_id: string | null;
  status: string;
  created_at: string;
};

export default function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("slot_start", { ascending: true });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const deleteBooking = async (id: string) => {
    await supabase.from("bookings").delete().eq("id", id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Zurich" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
        <Loader2 className="animate-spin" size={20} />
        Loading bookings…
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Calendar size={40} className="mx-auto mb-3 opacity-50" />
        <p className="font-medium">No bookings yet</p>
        <p className="text-sm">Consultation requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Consultation Bookings</h2>
      {bookings.map((b) => (
        <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{b.name}</p>
              <p className="text-sm text-gray-500">{b.business}</p>
            </div>
            <div className="flex items-center gap-2">
              {b.tier && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 font-medium">{b.tier}</span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                b.status === "confirmed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
              }`}>
                {b.status}
              </span>
              <button onClick={() => deleteBooking(b.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{b.needs}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(b.slot_start)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatTime(b.slot_start)} – {formatTime(b.slot_end)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
