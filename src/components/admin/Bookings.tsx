import { useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Booking = {
  id: string; lead_id: string; status: string; created_at: string; decided_at: string | null;
  leads: { reference: string; lead_type: string; origin: string | null; destination: string | null; travel_date: string | null; weight: string | null; details: unknown; lead_contacts: { full_name: string; phone: string; email: string | null } | null } | null;
};
export default function Bookings({ revision, onDecision }: { revision: number; onDecision: () => void }) {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Pending");
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<{ booking: Booking; status: "Approved" | "Rejected" } | null>(null);
  const load = async () => {
    setLoading(true); setError("");
    const { data, error } = await supabase.from("bookings").select("*, leads(reference, lead_type, origin, destination, travel_date, weight, details, lead_contacts(full_name, phone, email))").order("created_at", { ascending: false });
    if (error) setError("Unable to load bookings. Please retry."); else setItems((data as unknown as Booking[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [revision]);
  const decide = async () => {
    if (!decision) return;
    setBusy(true); setError("");
    const { error } = await supabase.rpc("decide_booking", { p_booking_id: decision.booking.id, p_status: decision.status });
    setBusy(false); setDecision(null);
    if (error) { setError(error.message); return; }
    await load(); onDecision();
  };
  const shown = items.filter(item => filter === "all" || item.status === filter);
  return <section className="py-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Bookings</h2><Button variant="outline" size="icon" aria-label="Refresh bookings" title="Refresh bookings" disabled={loading} onClick={load}><RefreshCw className="h-4 w-4" /></Button></div>
    <Tabs value={filter} onValueChange={setFilter}><TabsList className="h-auto flex-wrap">{["Pending", "Approved", "Rejected", "all"].map(status => <TabsTrigger key={status} value={status}>{status === "all" ? "All" : status} ({items.filter(item => status === "all" || item.status === status).length})</TabsTrigger>)}</TabsList></Tabs>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {loading ? <p className="py-8 text-muted-foreground">Loading bookings…</p> : shown.length === 0 ? <p className="py-8 text-muted-foreground">No {filter === "all" ? "" : filter.toLowerCase()} booking requests.</p> : <div className="mt-5 grid gap-4 md:grid-cols-2">
      {shown.map(booking => {
        const lead = booking.leads;
        return <article key={booking.id} className="min-w-0 rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="font-mono font-semibold">{lead?.reference ?? "Booking"}</h3><Badge variant={booking.status === "Approved" ? "default" : "secondary"}>{booking.status}</Badge></div>
          <p className="font-semibold break-words">{lead?.lead_contacts?.full_name}</p><p className="text-sm text-muted-foreground break-words">{lead?.lead_contacts?.phone} {lead?.lead_contacts?.email}</p>
          <p className="mt-4 font-medium break-words">{lead?.origin || "Not specified"} → {lead?.destination || "Not specified"}</p>
          <p className="text-sm text-muted-foreground">{lead?.travel_date || "Date not specified"} · {lead?.weight || "Weight not specified"} · {lead?.lead_type}</p>
          {lead?.details && typeof lead.details === "object" && <dl className="mt-4 space-y-1 text-sm">{Object.entries(lead.details).filter(([, v]) => typeof v === "string" && v).map(([key, value]) => <div key={key} className="break-words"><dt className="inline text-muted-foreground capitalize">{key.replaceAll("_", " ")}: </dt><dd className="inline">{String(value)}</dd></div>)}</dl>}
          <p className="mt-4 text-xs text-muted-foreground">Requested {new Date(booking.created_at).toLocaleString()}{booking.decided_at && ` · Decided ${new Date(booking.decided_at).toLocaleString()}`}</p>
          {booking.status === "Pending" && <div className="mt-5 flex gap-3"><Button variant="hero" disabled={busy} onClick={() => setDecision({ booking, status: "Approved" })}><Check className="mr-2 h-4 w-4" />Approve</Button><Button variant="outline" disabled={busy} onClick={() => setDecision({ booking, status: "Rejected" })}><X className="mr-2 h-4 w-4" />Reject</Button></div>}
        </article>;
      })}
    </div>}
    <AlertDialog open={!!decision} onOpenChange={open => { if (!open && !busy) setDecision(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{decision?.status === "Approved" ? "Approve" : "Reject"} booking?</AlertDialogTitle><AlertDialogDescription>{decision?.booking.leads?.reference}: {decision?.status === "Approved" ? "The enquiry will be marked Booked." : "The enquiry will remain unchanged."} This decision cannot be changed here.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={e => { e.preventDefault(); void decide(); }}>{busy ? "Saving…" : "Confirm decision"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}