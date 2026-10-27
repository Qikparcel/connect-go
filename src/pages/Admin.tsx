import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamAuth } from "@/hooks/use-team-auth";
import Bookings from "@/components/admin/Bookings";
import TeamProfile from "@/components/admin/TeamProfile";

const STATUSES = ["New", "Contacted", "Qualified", "Matched", "Booked", "Lost"];

type Lead = {
  id: string; reference: string; lead_type: string; origin: string | null; destination: string | null;
  travel_date: string | null; urgency: string | null; weight: string | null; priority: string; status: string;
  owner: string | null; created_at: string; details: Record<string, string>;
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
      <TabsList><TabsTrigger value="bookings">Bookings</TabsTrigger><TabsTrigger value="enquiries">Enquiries</TabsTrigger><TabsTrigger value="profile">Team profile</TabsTrigger></TabsList>
      <TabsContent value="bookings"><Bookings revision={revision} onDecision={() => setRevision(v => v + 1)} /></TabsContent>
      <TabsContent value="profile"><TeamProfile userId={userId} /></TabsContent>
      <TabsContent value="enquiries" className="pt-6">
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
            <tr>{["Ref", "Type", "Priority", "Name", "Route", "Date / when", "Weight / space", "Status", "Owner", "Actions"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr>
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
                  <Button size="sm" variant="outline" className="mb-2" disabled={busy === l.id || bookingLeads.includes(l.id)} onClick={async () => {
                    setBusy(l.id); setError("");
                    const { error } = await supabase.rpc("request_booking", { p_lead_id: l.id });
                    setBusy(null);
                    if (error) { setError(error.message); return; }
                    setRevision(v => v + 1); setTab("bookings");
                  }}>{bookingLeads.includes(l.id) ? "Booking requested" : busy === l.id ? "Creating…" : "Request booking"}</Button>
                  {l.lead_contacts?.phone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`https://wa.me/${l.lead_contacts.phone.replace("+", "")}?text=${encodeURIComponent(`Hi ${l.lead_contacts.full_name}, this is QikParcel following up on ${l.reference}.`)}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ChatList />
      </TabsContent></Tabs>
    </div>
  );
}

type Chat = { id: string; full_name: string | null; phone: string | null; email: string | null; interest: string | null; messages: { id: string; role: string; parts: { type: string; text?: string }[] }[]; updated_at: string };

function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false }).limit(200)
      .then(({ data }) => setChats((data as unknown as Chat[]) ?? []));
  }, []);
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-black text-foreground mb-4">Website chats</h2>
      {chats.length === 0 && <p className="text-sm text-muted-foreground">No chats yet.</p>}
      <div className="space-y-3">
        {chats.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4">
            <button className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpenId(openId === c.id ? null : c.id)}>
              <span className="font-semibold text-foreground">{c.full_name ?? "Anonymous visitor"}</span>
              {c.interest && <Badge variant="secondary" className="capitalize">{c.interest}</Badge>}
              {c.phone && <span className="text-sm text-muted-foreground">{c.phone}</span>}
              {c.email && <span className="text-sm text-muted-foreground">{c.email}</span>}
              <span className="ml-auto text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleString()} · {c.messages.length} messages</span>
            </button>
            {openId === c.id && (
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                {c.messages.map((m) => {
                  const text = m.parts.filter((p) => p.type === "text").map((p) => p.text).join("\n");
                  if (!text) return null;
                  return <p key={m.id} className={m.role === "user" ? "text-foreground" : "text-muted-foreground"}><span className="font-semibold">{m.role === "user" ? "Visitor" : "Qik"}:</span> {text}</p>;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const Admin = () => {
  const auth = useTeamAuth();
  if (auth.loading) return <main className="min-h-screen bg-background p-10 text-center text-muted-foreground">Checking team access…</main>;
  if (!auth.user || !auth.admin) return <Navigate to="/team/sign-in" replace />;
  return <main className="min-h-screen bg-background"><Dashboard userId={auth.user.id} /></main>;
};

export default Admin;
