import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Privacy-compliant pageview tracker.
 * - No cookies, no fingerprinting, no IP storage
 * - Session ID lives in sessionStorage (dies on tab close)
 * - Country detected server-side via geo headers (no IP stored)
 * - Fully nDSG / GDPR compliant — no consent needed
 */

function getSessionId(): string {
  let sid = sessionStorage.getItem("_k_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("_k_sid", sid);
  }
  return sid;
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

async function getCountry(): Promise<string | null> {
  // Cache per session
  const cached = sessionStorage.getItem("_k_country");
  if (cached) return cached === "null" ? null : cached;

  try {
    const { data } = await supabase.functions.invoke("geo-lookup");
    const country = data?.country || null;
    sessionStorage.setItem("_k_country", country || "null");
    return country;
  } catch {
    sessionStorage.setItem("_k_country", "null");
    return null;
  }
}

export function usePageTracking() {
  const location = useLocation();
  const startTime = useRef(Date.now());
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip admin routes
    if (location.pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();
    const now = Date.now();

    // Log duration for previous page
    if (lastPath.current && lastPath.current !== location.pathname) {
      const duration = now - startTime.current;
      supabase
        .from("pageviews")
        .update({ duration_ms: duration })
        .eq("session_id", sessionId)
        .eq("path", lastPath.current)
        .order("created_at", { ascending: false })
        .limit(1)
        .then(() => {});
    }

    // Log new pageview
    startTime.current = now;
    lastPath.current = location.pathname;

    getCountry().then((country) => {
      supabase.from("pageviews").insert({
        session_id: sessionId,
        path: location.pathname,
        referrer: document.referrer || null,
        device_type: getDeviceType(),
        language: navigator.language || null,
        country,
      }).then(() => {});
    });

    // Track duration on page unload
    const handleUnload = () => {
      const duration = Date.now() - startTime.current;
      const data = JSON.stringify({
        session_id: sessionId,
        path: location.pathname,
        duration_ms: duration,
      });
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pageviews?session_id=eq.${sessionId}&path=eq.${encodeURIComponent(location.pathname)}&order=created_at.desc&limit=1`;
      navigator.sendBeacon(
        url,
        new Blob([data], { type: "application/json" })
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [location.pathname]);
}
