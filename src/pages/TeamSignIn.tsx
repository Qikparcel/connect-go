import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useTeamAuth } from "@/hooks/use-team-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DarkModeToggle from "@/components/DarkModeToggle";
import logo from "@/assets/qikparcel-logo.png";

export default function TeamSignIn() {
  const auth = useTeamAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (auth.loading) return <main className="min-h-screen bg-background p-10 text-center text-muted-foreground">Checking team access…</main>;
  if (auth.admin) return <Navigate to="/admin" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) setError(result.error.message);
    } catch { setError("Unable to sign in. Please check your connection and try again."); }
    finally { setBusy(false); }
  };
  const social = async (provider: "google" | "lovable") => {
    setBusy(true); setError("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/team/sign-in` });
      if (result.error) setError(result.error.message);
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-background text-foreground">
    <header className="flex items-center justify-between border-b border-border px-6 py-4"><Link to="/"><img src={logo} alt="QikParcel" className="h-10 w-auto" /></Link><DarkModeToggle /></header>
    <div className="mx-auto max-w-sm px-4 py-16">
      <ShieldCheck className="mb-5 h-9 w-9 text-primary" />
      <p className="mb-2 text-xs font-mono uppercase text-muted-foreground">QikParcel team</p>
      <h1 className="mb-8 text-3xl font-bold">Admin sign-in</h1>
      {auth.user ? <div className="space-y-4"><p role="alert">{auth.error || "This account does not have team admin access. Sign in with an authorized team account."}</p><Button variant="outline" onClick={() => supabase.auth.signOut()}>Use another account</Button></div> : <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="team-email">Email</Label><Input id="team-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="team-password">Password</Label><Input id="team-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        <div className="border-t border-border pt-5 space-y-3"><Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => social("google")}>Continue with Google</Button><Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => social("lovable")}>Sign in with Lovable</Button></div>
      </form>}
      <Button asChild variant="link" className="mt-6 px-0"><Link to="/">Back to website</Link></Button>
    </div>
  </main>;
}