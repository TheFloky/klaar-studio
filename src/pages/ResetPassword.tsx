import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthReady } from "@/hooks/useAuthReady";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasRecoveryParams] = useState(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      hash.includes("type=recovery") ||
      search.includes("type=recovery") ||
      hash.includes("access_token") ||
      search.includes("code=")
    );
  });
  const { isReady, session } = useAuthReady();
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError(error.message);
    });
  }, []);

  const ready = isReady && !!session;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ready) {
      setError("Die Sitzung fuer den Reset-Link ist noch nicht bereit.");
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setError("Passwoerter stimmen nicht ueberein.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/admin"), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
          <CheckCircle size={40} className="text-green-600 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">Passwort geaendert</h1>
          <p className="text-sm text-gray-500">Sie werden zum Login weitergeleitet…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Neues Passwort setzen</h1>
          <p className="text-sm text-gray-500 mt-1">
            {ready
              ? "Geben Sie Ihr neues Passwort ein."
              : hasRecoveryParams
                ? "Bitte warten, Sitzung wird ueberprueft…"
                : "Reset-Link ist ungueltig oder abgelaufen."}
          </p>
        </div>

        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Neues Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!ready}
            className="bg-gray-50"
          />
          <Input
            type="password"
            placeholder="Passwort bestaetigen"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={!ready}
            className="bg-gray-50"
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !ready}>
          {loading ? "Wird gespeichert…" : "Passwort speichern"}
        </Button>
      </form>
    </div>
  );
}
