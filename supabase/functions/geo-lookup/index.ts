const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Try multiple geo headers that edge platforms typically provide
  const country =
    req.headers.get("cf-ipcountry") ||       // Cloudflare
    req.headers.get("x-vercel-ip-country") || // Vercel
    req.headers.get("x-country-code") ||      // Various CDNs
    null;

  return new Response(
    JSON.stringify({ country }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
