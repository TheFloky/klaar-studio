import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePageTracking } from "@/hooks/usePageTracking";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import Audit from "./pages/Audit.tsx";
import Impressum from "./pages/Impressum.tsx";
import Privacy from "./pages/Privacy.tsx";
import Maintenance from "./pages/Maintenance.tsx";
import AuditReport from "./pages/AuditReport.tsx";

const queryClient = new QueryClient();

function AppRoutes() {
  usePageTracking();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/de" replace />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/audits/:slug" element={<AuditReport />} />
      <Route path="/:lang/audit" element={<Audit />} />
      <Route path="/:lang/impressum" element={<Impressum />} />
      <Route path="/:lang/privacy" element={<Privacy />} />
      <Route path="/:lang/maintenance" element={<Maintenance />} />
      <Route path="/:lang" element={<Index />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
