import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { TextField } from "../fields";
import type { OnboardingValues } from "../schema";

const ContactStep = () => {
  const { control } = useFormContext<OnboardingValues>();

  return (
    <div className="space-y-6">
      <TextField name="fullName" label="Full name" placeholder="Your name" autoComplete="name" />
      <TextField
        name="phone"
        label="WhatsApp number"
        description="This is how we'll reach you about matches near you."
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+44 7700 900123"
      />
      <TextField
        name="email"
        label="Email"
        optional
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="city" label="City" optional placeholder="e.g. Birmingham" />
        <TextField name="country" label="Country" optional placeholder="e.g. United Kingdom" />
      </div>

      <FormField
        control={control}
        name="consentMarketing"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-4">
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            </FormControl>
            <FormLabel className="cursor-pointer text-sm font-normal leading-relaxed text-muted-foreground">
              Keep me updated about QikParcel on WhatsApp and email. You can opt out any time.
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactStep;
