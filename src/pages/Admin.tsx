import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check, MessageCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamAuth } from "@/hooks/use-team-auth";
import Bookings from "@/components/admin/Bookings";
import Chats from "@/components/admin/Chats";
import ChatbotLimits from "@/components/admin/ChatbotLimits";
import TeamProfile from "@/components/admin/TeamProfile";
import RouteInterest from "@/components/admin/RouteInterest";
import ZimbabweEnquiries from "@/components/admin/ZimbabweEnquiries";

const STATUSES = ["New", "Contacted", "Qualified", "Matched", "Lost"];

type Lead = {
  id: string; reference: string; lead_type: string; origin: string | null; destination: string | null;
  travel_date: string | null; urgency: string | null; weight: string | null; priority: string; status: string;
  owner: string | null; created_at: string; details: Record<string, unknown>;
  lead_contacts: { full_name: string; phone: string; email: string | null; business_name: string | null } | null;
};

const prioColor: Record<string, string> = { HOT: "bg-destructive text-destructive-foreground", WARM: "bg-primary text-primary-foreground", FUTURE: "bg-secondary text-secondary-foreground" };

function Dashboard({ userId }: { userId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [prio, setPrio] = useState("all");
  const [route, setRoute] = useState("");
  const [revision, setRevision] = useState(0);
  const [tab, setTab] = useState("bookings");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [bookingLeads, setBookingLeads] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("leads").select("*, lead_contacts(full_name, phone, email, business_name)")
      .order("created_at", { ascending: false }).limit(1000)
      .then(({ data, error }) => { if (error) setError("Unable to load enquiries. Please try again."); else setLeads((data as unknown as Lead[]) ?? []); setLoading(false); });
    supabase.from("bookings").select("lead_id").then(({ data }) => setBookingLeads(data?.map(b => b.lead_id) ?? []));
  }, [revision]);

  const update = async (id: string, patch: Partial<Pick<Lead, "status" | "owner">>) => {
    setError("");
    const { error } = await supabase.from("leads").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id).select("id").single();
    if (error) { setError("Unable to save enquiry changes. Please try again."); return; }
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  // Approving moves an enquiry into the working pipeline (Qualified); rejecting marks it
  // Lost. Neither creates a booking — those stay database-blocked until verification and
  // operational eligibility checks are connected. Both decisions are written to the audit log.
  const decide = async (lead: Lead, decision: "approved" | "rejected") => {
    setError(""); setBusy(lead.id);
    const status = decision === "approved" ? "Qualified" : "Lost";
    const { error: saveError } = await supabase.from("leads")
      .update({ status, updated_at: new Date().toISOString() }).eq("id", lead.id);
    if (saveError) { setBusy(null); setError("Unable to record that decision. Please try again."); return; }
    const { error: auditError } = await supabase.from("lead_events")
      .insert({ event: decision === "approved" ? "lead_approved" : "lead_rejected", label: lead.reference, utm: {} });
    if (auditError) console.error("decision not written to the audit log", { code: auditError.code });
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    setBusy(null);
  };

  const shown = useMemo(() => leads.filter((l) =>
    (type === "all" || l.lead_type === type) && (prio === "all" || l.priority === prio) &&
    (!route || `${l.origin} ${l.destination}`.toLowerCase().includes(route.toLowerCase()))), [leads, type, prio, route]);

  const today = new Date().toISOString().slice(0, 10);
  const stats = [
    ["New sender leads", leads.filter((l) => l.lead_type === "sender" && l.status === "New").length],
    ["Upcoming traveller departures", leads.filter((l) => l.lead_type === "traveller" && l.travel_date && l.travel_date >= today).length],
    ["Travellers with space", leads.filter((l) => l.lead_type === "traveller" && l.weight !== "Unsure").length],
    ["Merchant enquiries", leads.filter((l) => l.lead_type === "merchant").length],
    ["HOT leads", leads.filter((l) => l.priority === "HOT").length],
    ["Lead → booking", leads.length ? `${Math.round((leads.filter((l) => l.status === "Booked").length / leads.length) * 100)}%` : "—"],
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-foreground">QikParcel Admin</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/">Website</Link></Button>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="h-auto flex-wrap">
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
        <TabsTrigger value="chats">Chat history</TabsTrigger>
        <TabsTrigger value="zimbabwe">Zimbabwe enquiries</TabsTrigger>
        <TabsTrigger value="routes">Route interest</TabsTrigger>
        <TabsTrigger value="limits">Limits</TabsTrigger>
        <TabsTrigger value="profile">Team profile</TabsTrigger>
      </TabsList>
      <TabsContent value="bookings"><Bookings revision={revision} onDecision={() => setRevision(v => v + 1)} /></TabsContent>
      <TabsContent value="chats"><Chats /></TabsContent>
      <TabsContent value="routes"><RouteInterest /></TabsContent>
      <TabsContent value="zimbabwe"><ZimbabweEnquiries /></TabsContent>
      <TabsContent value="limits"><ChatbotLimits /></TabsContent>
      <TabsContent value="profile"><TeamProfile userId={userId} /></TabsContent>
      <TabsContent value="enquiries" className="pt-6">
      <p className="mb-4 text-sm text-muted-foreground">Enquiries remain available. Booking creation and approval are paused until secure verification and operational eligibility checks are connected.</p>
      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-black text-foreground">{n}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={type} onValueChange={setType}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="sender">Senders</SelectItem><SelectItem value="traveller">Travellers</SelectItem><SelectItem value="merchant">Merchants</SelectItem></SelectContent></Select>
        <Select value={prio} onValueChange={setPrio}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All priorities</SelectItem><SelectItem value="HOT">HOT</SelectItem><SelectItem value="WARM">WARM</SelectItem><SelectItem value="FUTURE">FUTURE</SelectItem></SelectContent></Select>
        <Input className="w-56" placeholder="Filter route, e.g. Harare" value={route} onChange={(e) => setRoute(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground border-b border-border">
            <tr>{["Ref", "Type", "Priority", "Name", "Route", "Date / when", "Weight / space", "Status", "Owner", "Decision"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && shown.length === 0 && <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No leads yet.</td></tr>}
            {shown.map((l) => (
              <tr key={l.id} className="border-b border-border/50 align-top">
                <td className="p-3 font-mono text-xs">{l.reference}<div className="text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</div></td>
                <td className="p-3 capitalize">{l.lead_type}</td>
                <td className="p-3"><Badge className={prioColor[l.priority]}>{l.priority}</Badge></td>
                <td className="p-3">{l.lead_contacts?.business_name && <div className="font-semibold">{l.lead_contacts.business_name}</div>}{l.lead_contacts?.full_name}<div className="text-xs text-muted-foreground">{l.lead_contacts?.phone}</div></td>
                <td className="p-3">{l.origin} → {l.destination}</td>
                <td className="p-3">{l.travel_date ?? ""}<div className="text-xs text-muted-foreground">{l.urgency}</div></td>
                <td className="p-3">{l.weight}</td>
                <td className="p-3">
                  <Select value={l.status} onValueChange={(v) => update(l.id, { status: v })}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3"><Input className="h-8 w-28" defaultValue={l.owner ?? ""} maxLength={60} onBlur={(e) => e.target.value !== (l.owner ?? "") && update(l.id, { owner: e.target.value || null })} /></td>
                <td className="p-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant={l.status === "Qualified" || l.status === "Matched" || l.status === "Booked" ? "default" : "outline"}
                        disabled={busy === l.id} title="Marks the enquiry Qualified and records the decision"
                        onClick={() => void decide(l, "approved")}>
                        <Check className="mr-1 h-4 w-4" />Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === l.id} title="Marks the enquiry Lost and records the decision"
                        onClick={() => void decide(l, "rejected")}>
                        <X className="mr-1 h-4 w-4" />Reject
                      </Button>
                    </div>
                    <Button size="sm" variant="outline" className="mt-1" disabled title="Secure verification and operational checks are required" onClick={async () => {
                      setBusy(l.id); setError("");
                      const { error } = await supabase.rpc("request_booking", { p_lead_id: l.id });
                      setBusy(null);
                      if (error) { setError(error.message); return; }
                      setRevision(v => v + 1); setTab("bookings");
                    }}>{bookingLeads.includes(l.id) ? "Booking requested" : busy === l.id ? "Creating…" : "Request booking"}</Button>
                    {l.lead_contacts?.phone && l.details.serviceContactConsent === true && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`https://wa.me/${l.lead_contacts.phone.replace("+", "")}?text=${encodeURIComponent(`Hi ${l.lead_contacts.full_name}, this is QikParcel following up on ${l.reference}.`)}`} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </TabsContent></Tabs>
    </div>
  );
}

const Admin = () => {
  const auth = useTeamAuth();
  if (auth.loading) return <main className="min-h-screen bg-background p-10 text-center text-muted-foreground">Checking team access…</main>;
  if (!auth.user || !auth.admin) return <Navigate to="/team/sign-in" replace />;
  return <main className="min-h-screen bg-background"><Dashboard userId={auth.user.id} /></main>;
};

export default Admin;
