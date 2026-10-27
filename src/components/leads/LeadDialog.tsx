import { createContext, useContext, useState, type ReactNode } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FORMS, validateField, whatsappLink, type LeadType } from "./leadForms";
import { getUtm, track } from "@/lib/tracking";

const Ctx = createContext<(t: LeadType) => void>(() => {});
export const useOpenLead = () => useContext(Ctx);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<LeadType | null>(null);
  const open = (t: LeadType) => {
    track("cta_click", t);
    setType(t);
  };
  return (
    <Ctx.Provider value={open}>
      {children}
      <Dialog open={!!type} onOpenChange={(o) => !o && setType(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {type && <LeadForm key={type} type={type} />}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

function LeadForm({ type }: { type: LeadType }) {
  const form = FORMS[type];
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");

  const set = (name: string, v: string) => {
    if (!started) {
      setStarted(true);
      track("form_start", type);
    }
    setValues((s) => ({ ...s, [name]: v }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    form.steps[step].forEach((f) => {
      const err = validateField(f, values[f.name] ?? "");
      if (err) errs[f.name] = err;
    });
    if (step === 1 && !consent) errs.consent = "Please agree so we can contact you";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setServerError("");
    const utm = getUtm();
    const { data, error } = await supabase.functions.invoke("submit-lead", {
      body: { type, ...values, consent, website: honeypot, source: utm.src ?? utm.utm_source, utm },
    });
    setSubmitting(false);
    if (error || !data?.reference) {
      let msg = "We couldn't save your details. Please check your connection and try again.";
      if (error instanceof FunctionsHttpError) {
        const body = await error.context.json().catch(() => null);
        if (body?.error) msg = body.error;
      }
      setServerError(msg);
      return;
    }
    track("form_submit", type);
    setReference(data.reference);
  };

  if (reference) {
    const wa = whatsappLink(type, reference, values);
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary mb-4" />
        <DialogTitle className="text-xl mb-2">{form.thanks}</DialogTitle>
        <DialogDescription className="mb-1">Your reference number</DialogDescription>
        <p className="font-mono text-2xl font-bold text-foreground mb-6">{reference}</p>
        <div className="flex flex-col gap-3">
          {type === "traveller" ? (
            <Button variant="hero" asChild>
              <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">Continue registration</a>
            </Button>
          ) : (
            <Button variant="hero" asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer">
                {type === "sender" ? "Request a Quote on WhatsApp" : "WhatsApp Business Enquiry"}
              </a>
            </Button>
          )}
          {type === "traveller" && (
            <Button variant="outline" asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{form.title}</DialogTitle>
        <DialogDescription>Step {step + 1} of 2 · No account needed</DialogDescription>
      </DialogHeader>
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 0) {
            if (validateStep()) setStep(1);
          } else void submit();
        }}
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        {form.steps[step].map((f) => (
          <div key={f.name} className="space-y-1.5">
            <Label htmlFor={f.name}>
              {f.label} {f.optional && <span className="text-muted-foreground font-normal">(optional)</span>}
            </Label>
            {f.kind === "select" ? (
              <Select value={values[f.name] ?? ""} onValueChange={(v) => set(f.name, v)}>
                <SelectTrigger id={f.name} aria-invalid={!!errors[f.name]}><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>
                  {f.options!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input id={f.name} type={f.kind} placeholder={f.placeholder} maxLength={300}
                value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} aria-invalid={!!errors[f.name]} />
            )}
            {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
          </div>
        ))}
        {step === 1 && (
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <Checkbox id="consent" checked={consent} onCheckedChange={(c) => { setConsent(c === true); setErrors((e) => ({ ...e, consent: "" })); }} />
              <Label htmlFor="consent" className="text-sm font-normal leading-snug">
                I agree that QikParcel may contact me by WhatsApp, phone or email about this request.
              </Label>
            </div>
            {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
          </div>
        )}
        {serverError && <p className="text-sm text-destructive" role="alert">{serverError}</p>}
        <div className="flex gap-3 pt-2">
          {step === 1 && <Button type="button" variant="outline" onClick={() => setStep(0)} disabled={submitting}>Back</Button>}
          <Button type="submit" variant="hero" className="flex-1" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === 0 ? "Continue" : "Submit"}
          </Button>
        </div>
      </form>
    </>
  );
}
