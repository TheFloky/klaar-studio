import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Download, Shield } from "lucide-react";

export default function AuditReport() {
  const { slug } = useParams<{ slug: string }>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!slug) { setError("No report specified"); setLoading(false); return; }
      const path = `${slug}.pdf`;
      const { data } = supabase.storage.from("audit-reports").getPublicUrl(path);
      if (data?.publicUrl) {
        // Check if the file actually exists
        try {
          const res = await fetch(data.publicUrl, { method: "HEAD" });
          if (res.ok) {
            setPdfUrl(data.publicUrl);
          } else {
            setError("Report not found");
          }
        } catch {
          setError("Report not found");
        }
      } else {
        setError("Report not found");
      }
      setLoading(false);
    };
    fetchPdf();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading audit report…</p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Report Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">{error || "This audit report does not exist or has been removed."}</p>
          <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to klaar-studio.ch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft size={14} /> klaar-studio.ch
            </Link>
            <span className="text-muted-foreground">|</span>
            <h1 className="text-sm font-semibold flex items-center gap-1.5">
              <Shield size={14} className="text-primary" /> Compliance Audit Report
            </h1>
          </div>
          <a
            href={pdfUrl}
            download
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1.5"
          >
            <Download size={12} /> Download PDF
          </a>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4">
        <iframe
          src={pdfUrl}
          className="w-full rounded-lg border shadow-sm"
          style={{ height: "calc(100vh - 80px)" }}
          title="Compliance Audit Report"
        />
      </div>
    </div>
  );
}
