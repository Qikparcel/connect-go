import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TeamProfile({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.from("profiles").select("display_name").eq("id", userId).single().then(({ data, error }) => { if (error) setMessage("Unable to load team profile."); else setName(data.display_name); }); }, [userId]);
  return <form className="flex flex-wrap items-end gap-3 py-6" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setMessage("");
    const { data, error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", userId).select("id").single();
    setMessage(error || !data ? "Unable to save your profile. Please try again." : "Profile saved."); setBusy(false);
  }}><div className="space-y-2"><Label htmlFor="display-name">Team display name</Label><Input id="display-name" maxLength={100} value={name} onChange={e => setName(e.target.value)} /></div><Button variant="outline" disabled={busy} type="submit">{busy ? "Saving…" : "Save profile"}</Button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}</form>;
}