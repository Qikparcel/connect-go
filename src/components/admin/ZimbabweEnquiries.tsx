import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isZimbabweRoute } from "@/lib/zimbabweEnquiries";

type Row = { id: string; reference: string; origin: string | null; destination: string | null; weight: string | null; travel_date: string | null; created_at: string; status: string; priority: string };

const ZimbabweEnquiries = () => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("leads").select("id,reference,origin,destination,weight,travel_date,created_at,status,priority")
      .order("created_at", { ascending: false }).limit(5000)
      .then(({ data, error }) => {
        if (error) setError("Could not load enquiries. Please refresh to try again.");
        else setRows(((data ?? []) as Row[]).filter((r) => isZimbabweRoute(r.origin, r.destination)));
      });
  }, []);

  return (
    <div className="pt-6">
      <p className="mb-4 text-sm text-muted-foreground">Saved enquiries with Zimbabwe as the origin or destination, newest first.{rows && ` ${rows.length} in total.`}</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {rows && rows.length === 0 && <p className="text-sm text-muted-foreground">No Zimbabwe enquiries yet.</p>}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr><th className="p-3">Received</th><th className="p-3">Reference</th><th className="p-3">Route</th><th className="p-3">Parcel size</th><th className="p-3">Wanted by</th><th className="p-3">Priority</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border text-card-foreground">
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="p-3 font-mono">{r.reference}</td>
                  <td className="p-3">{r.origin || "—"} → {r.destination || "—"}</td>
                  <td className="p-3">{r.weight || "—"}</td>
                  <td className="p-3">{r.travel_date ? new Date(r.travel_date).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="p-3">{r.priority}</td>
                  <td className="p-3">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ZimbabweEnquiries;
