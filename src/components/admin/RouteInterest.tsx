import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { summariseRouteClicks, type RouteCount } from "@/lib/routeTracking";

const RouteInterest = () => {
  const [rows, setRows] = useState<RouteCount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("lead_events").select("label").like("label", "route:%").limit(10000).then(({ data, error }) => {
      if (error) setError("Could not load route clicks. Please refresh to try again.");
      else setRows(summariseRouteClicks((data ?? []).map((r) => r.label)));
    });
  }, []);

  return (
    <div className="pt-6">
      <p className="mb-4 text-sm text-muted-foreground">Button clicks on the corridor pages, all time. These count clicks, not unique people — one visitor clicking twice counts twice, and team clicks are included.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {rows && rows.length === 0 && <p className="text-sm text-muted-foreground">No clicks recorded yet.</p>}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr><th className="p-3">Route</th><th className="p-3">Direction</th><th className="p-3">Enquiry</th><th className="p-3">WhatsApp</th><th className="p-3">Traveller sign-up</th><th className="p-3">Total</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.route}:${r.direction}`} className="border-t border-border text-card-foreground">
                  <td className="p-3">{r.route}</td><td className="p-3">{r.direction}</td><td className="p-3">{r.enquiry}</td><td className="p-3">{r.whatsapp}</td><td className="p-3">{r.traveller}</td><td className="p-3 font-bold">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RouteInterest;
