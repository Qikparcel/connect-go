import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, MessageCircle, Package, Plane, Store, HelpCircle, Users, Send, Home, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useOpenLead } from "@/components/leads/LeadDialog";
import { WHATSAPP } from "@/components/leads/leadForms";
import { getUtm, track } from "@/lib/tracking";
import { activeSteps, askText, confirmation, toPayload, validate, type Answers, type Role } from "./chatFlow";
import { cn } from "@/lib/utils";

const APP_URL = "https://app.qikparcel.com/";
const WA = `https://wa.me/${WHATSAPP}`;
const ROLE_LABEL: Record<Role, string> = { sender: "📦 Send a Parcel", traveller: "✈️ I'm Travelling", merchant: "🏪 Business Deliveries" };

type View = "menu" | "how" | "team" | "flow" | "done";

const Bot = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-sm text-foreground">{children}</div>
);
const Me = ({ children }: { children: React.ReactNode }) => (
  <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">{children}</div>
);

export default function GuidedChat({ onAskAi }: { onAskAi: (question?: string) => void }) {
  const openLead = useOpenLead();
  const [view, setView] = useState<View>("menu");
  const [role, setRole] = useState<Role | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [otherFor, setOtherFor] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ref: string; msg: string; eligibility: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const steps = role ? activeSteps(role, answers) : [];
  const step = steps[idx];
  const freeText = !!step && (!step.options || otherFor === step.key);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [idx, view, otherFor, err, result]);

  const restart = () => {
    setView("menu"); setRole(null); setAnswers({}); setIdx(0); setOtherFor(null); setText(""); setErr(""); setResult(null);
  };

  const pickRole = (r: Role) => {
    track("role_selected", r); track("qualification_started", r);
    setRole(r); setAnswers({}); setIdx(0); setView("flow");
  };

  const submit = async (all: Answers) => {
    if (!role) return;
    setSaving(true); setErr("");
    const { data, error } = await supabase.functions.invoke("submit-lead", { body: toPayload(role, all, getUtm()) });
    setSaving(false);
    if (error || !data?.reference) {
      let msg = "We couldn't save your enquiry. Please try again, or message us on WhatsApp.";
      try { const body = await (error as { context?: Response })?.context?.json(); if (body?.error) msg = body.error; } catch { /* keep default */ }
      setErr(msg);
      return;
    }
    track("lead_submitted", role);
    if (data.priority === "HOT") track("hot_lead_created", role);
    setResult({ ref: data.reference, msg: confirmation(role, all, data.reference), eligibility: data.eligibility?.reason ?? "Eligibility needs human review. This is an enquiry, not a booking." });
    setView("done");
  };

  const answer = (value: string) => {
    if (!step || !role) return;
    if (step.options && value === "Other" && otherFor !== step.key) { setOtherFor(step.key); setText(""); return; }
    const v = value.trim();
    if (freeText) { const e = validate(step, v); if (e) { setErr(e); return; } }
    setErr(""); setText(""); setOtherFor(null);
    const next = { ...answers, [step.key]: v };
    // Clear answers to later steps that are now skipped
    const nextSteps = activeSteps(role, next);
    setAnswers(next);
    if (idx + 1 >= nextSteps.length) { void submit(next); return; }
    setIdx(idx + 1);
  };

  const back = () => {
    setErr(""); setOtherFor(null); setText("");
    if (view === "flow" && idx > 0) setIdx(idx - 1);
    else restart();
  };

  const progress = role && view === "flow" ? Math.round((idx / steps.length) * 100) : view === "done" ? 100 : 0;

  return (
    <div className="flex h-full flex-col">
      {(view === "flow" || view === "done") && (
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          {view === "flow" && (
            <button onClick={back} disabled={saving} aria-label="Back" className="rounded p-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
          )}
          <Progress value={progress} className="h-1.5 flex-1" aria-label="Progress" />
          <span className="text-xs text-muted-foreground">{view === "done" ? "Done" : `${idx + 1}/${steps.length}`}</span>
          <button onClick={restart} aria-label="Start again" className="rounded p-1 text-muted-foreground hover:text-foreground"><RotateCcw className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <Bot>
          Hi! Welcome to QikParcel 👋<br />We help people and businesses send parcels using available delivery capacity.
          <br /><br />What would you like to do today?
        </Bot>

        {view === "menu" && (
          <div className="flex flex-col gap-2">
            {(["sender", "traveller", "merchant"] as Role[]).map((r) => (
              <Button key={r} variant="outline" className="justify-start" onClick={() => pickRole(r)}>{ROLE_LABEL[r]}</Button>
            ))}
            <Button variant="ghost" size="sm" className="justify-start" onClick={() => setView("how")}><HelpCircle className="h-4 w-4 text-primary" /> How does QikParcel work?</Button>
            <Button variant="ghost" size="sm" className="justify-start" onClick={() => setView("team")}><Users className="h-4 w-4 text-primary" /> Talk to our team</Button>
          </div>
        )}

        {view === "how" && (
          <>
            <Me>How does QikParcel work?</Me>
            <Bot>QikParcel helps connect senders with available delivery capacity, including eligible travellers and delivery partners. Tell us where your parcel needs to go, and we can help you explore suitable options.</Bot>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" onClick={() => pickRole("sender")}><Package className="h-4 w-4 text-primary" /> Send a Parcel</Button>
              <Button variant="outline" className="justify-start" onClick={() => pickRole("traveller")}><Plane className="h-4 w-4 text-primary" /> Become a Traveller</Button>
              <Button variant="outline" className="justify-start" onClick={() => pickRole("merchant")}><Store className="h-4 w-4 text-primary" /> Business Deliveries</Button>
            </div>
          </>
        )}

        {view === "team" && (
          <>
            <Me>Talk to our team</Me>
            <Bot>You can contact QikParcel on WhatsApp. Response times depend on team availability.</Bot>
            <div className="flex flex-wrap gap-2">
              <Button variant="hero" size="sm" asChild>
                <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_clicked", "team")}><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</a>
              </Button>
              <Button variant="ghost" size="sm" onClick={restart}><ArrowLeft className="h-4 w-4" /> Back</Button>
            </div>
          </>
        )}

        {(view === "flow" || view === "done") && role && (
          <>
            <Me>{ROLE_LABEL[role]}</Me>
            {steps.slice(0, view === "done" ? steps.length : idx).map((s) => (
              <div key={s.key} className="space-y-3">
                <Bot>{askText(s, answers)}</Bot>
                <Me>{answers[s.key]}</Me>
              </div>
            ))}
          </>
        )}

        {view === "flow" && step && (
          <>
            <Bot>{askText(step, answers)}</Bot>
            {step.key === "consent" && (
              <p className="text-xs text-muted-foreground">
                We'll only use your details to follow up on this enquiry. See our <a href="/privacy" className="underline">privacy policy</a>.
              </p>
            )}
            {step.options && otherFor !== step.key && (
              <div className="flex flex-wrap gap-2">
                {step.options.map((o) => (
                  <Button key={o} variant={answers[step.key] === o ? "default" : "outline"} size="sm" disabled={saving} onClick={() => answer(o)}>{o}</Button>
                ))}
              </div>
            )}
            {saving && <p className="text-sm text-muted-foreground">Saving your enquiry…</p>}
          </>
        )}

        {err && (
          <div role="alert" className="space-y-2">
            <p className="text-sm text-destructive">{err}</p>
            {saving === false && view === "flow" && idx === steps.length - 1 && answers.consent && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => submit(answers)}>Try again</Button>
                <Button size="sm" variant="ghost" asChild><a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_clicked", "error")}>WhatsApp us</a></Button>
              </div>
            )}
          </div>
        )}

        {view === "done" && result && role && (
          <>
            <Bot>{result.msg}</Bot>
            <Bot>{result.eligibility} This is not a confirmed booking.</Bot>
            <div className="flex flex-col gap-2">
              {role === "sender" && (
                <>
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => openLead("sender")}><Package className="h-4 w-4" /> Request a Quote</Button>
                </>
              )}
              {role === "traveller" && (
                <>
                  <Button variant="hero" size="sm" className="justify-start" asChild>
                    <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_clicked", "verification_guidance")}><ExternalLink className="h-4 w-4" /> Ask About Secure Registration</a>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => onAskAi("How does traveller verification work?")}><HelpCircle className="h-4 w-4" /> Learn About Verification</Button>
                </>
              )}
              {role === "merchant" && (
                <Button variant="hero" size="sm" className="justify-start" onClick={() => openLead("merchant")}><Store className="h-4 w-4" /> Request Business Consultation</Button>
              )}
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <a href={`${WA}?text=${encodeURIComponent(`Hi QikParcel, my reference is ${result.ref}.`)}`} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_clicked", "done")}>
                  <MessageCircle className="h-4 w-4" /> {role === "traveller" ? "Contact QikParcel" : "Chat on WhatsApp"}
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => { restart(); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Home className="h-4 w-4" /> Return to Homepage</Button>
            </div>
          </>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-3">
        {freeText ? (
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); answer(text); }}>
            <Input
              autoFocus
              type={step?.input === "date" ? "date" : step?.input === "tel" ? "tel" : "text"}
              inputMode={step?.input === "tel" ? "tel" : undefined}
              placeholder={step?.input === "tel" ? "+44 7…" : "Type your answer"}
              value={text}
              onChange={(e) => { setText(e.target.value); setErr(""); }}
              aria-label="Your answer"
            />
            <Button type="submit" size="icon" aria-label="Send" disabled={saving}><Send className="h-4 w-4" /></Button>
          </form>
        ) : (
          <button onClick={() => onAskAi()} className={cn("flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground")}>
            <HelpCircle className="h-3 w-3" /> Have a question? Ask Qik anything
          </button>
        )}
        <p className="mt-2 text-center text-[10px] text-muted-foreground">Please don't share ID, bank details or payment info here.</p>
      </div>
    </div>
  );
}
