import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

import {
  buildSteps,
  defaultOnboardingValues,
  onboardingSchema,
  STEP_FIELDS,
  STEP_TITLES,
  type OnboardingValues,
  type StepId,
} from "./schema";
import { toOnboardingRow } from "./submission";

import HeardAboutStep from "./steps/HeardAboutStep";
import RolesStep from "./steps/RolesStep";
import TravellerStep from "./steps/TravellerStep";
import SenderStep from "./steps/SenderStep";
import BusinessStep from "./steps/BusinessStep";
import CourierStep from "./steps/CourierStep";
import ContactStep from "./steps/ContactStep";

const STEP_COMPONENTS: Record<StepId, () => JSX.Element> = {
  heardAbout: HeardAboutStep,
  roles: RolesStep,
  traveller: TravellerStep,
  sender: SenderStep,
  business: BusinessStep,
  courier: CourierStep,
  contact: ContactStep,
};

const STORAGE_KEY = "qikparcel-onboarding-draft-v1";

/** Answers are held locally so a dropped signal at a busy stall doesn't lose them. */
const loadDraft = (): OnboardingValues => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultOnboardingValues, ...JSON.parse(saved) } : defaultOnboardingValues;
  } catch {
    return defaultOnboardingValues;
  }
};

const OnboardingForm = () => {
  const [searchParams] = useSearchParams();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: loadDraft(),
    mode: "onTouched",
  });

  const roles = form.watch("roles");
  const steps = useMemo(() => buildSteps(roles ?? []), [roles]);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  // Un-ticking a role shortens the flow; don't strand the user past the end.
  useEffect(() => {
    setStepIndex((index) => Math.min(index, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch {
        // Private browsing or a full quota — not worth interrupting the user.
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const isLastStep = stepIndex === steps.length - 1;

  const goNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[currentStep]);
    if (valid) setStepIndex((index) => index + 1);
  };

  const goBack = () => setStepIndex((index) => Math.max(0, index - 1));

  const onSubmit = async (values: OnboardingValues) => {
    // A filled honeypot means a bot. Behave exactly as if it worked.
    if (values.website) {
      setSubmitted(true);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      toast.error("We couldn't save that", {
        description: "The form isn't connected to the database yet. Please try again shortly.",
      });
      return;
    }

    const source = searchParams.get("src");
    const { error } = await supabase
      .from("onboarding_submissions")
      .insert(toOnboardingRow(values, source));

    if (error) {
      toast.error("We couldn't save that", {
        description: "Please check your connection and try again.",
      });
      return;
    }

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up.
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card mx-auto max-w-lg rounded-xl p-10 text-center"
      >
        <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-primary" />
        <h2 className="mb-3 text-2xl font-bold">You're on the list</h2>
        <p className="text-muted-foreground">
          Thanks for joining QikParcel. We'll be in touch on WhatsApp as soon as there's a match on
          your route.
        </p>
      </motion.div>
    );
  }

  const StepComponent = STEP_COMPONENTS[currentStep];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-mono uppercase tracking-widest text-primary">
              Step {stepIndex + 1} of {steps.length}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="glass-card rounded-xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="mb-6 text-2xl font-bold sm:text-3xl">{STEP_TITLES[currentStep]}</h2>
              <StepComponent />
            </motion.div>
          </AnimatePresence>

          {/* Honeypot — off-screen rather than display:none so bots still fill it. */}
          <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {stepIndex > 0 && (
            <Button type="button" variant="outline" size="lg" onClick={goBack} className="px-6">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {isLastStep ? (
            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="flex-1 px-8 py-6 text-base"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending
                </>
              ) : (
                "Join QikParcel"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="hero"
              size="lg"
              onClick={goNext}
              className="flex-1 px-8 py-6 text-base"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default OnboardingForm;
