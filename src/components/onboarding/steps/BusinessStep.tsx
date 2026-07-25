import { useFormContext } from "react-hook-form";
import { ChoiceField, MultiChoiceField, TextField, TextareaField } from "../fields";
import {
  BUSINESS_CATEGORIES,
  BUSINESS_CHALLENGES,
  FREQUENCIES,
  type OnboardingValues,
} from "../schema";

const BusinessStep = () => {
  const { watch } = useFormContext<OnboardingValues>();
  const sells = watch("businessSells") ?? [];

  return (
    <div className="space-y-6">
      <TextField name="businessName" label="Business name" placeholder="e.g. Moyo Cosmetics" />
      <MultiChoiceField
        name="businessSells"
        label="What do you sell?"
        options={BUSINESS_CATEGORIES}
      />
      {sells.includes("Other") && (
        <TextField name="businessSellsOther" label="What else do you sell?" placeholder="Tell us more" />
      )}
      <ChoiceField
        name="businessFrequency"
        label="How often do you send products?"
        options={FREQUENCIES}
      />
      <TextareaField
        name="businessShipsTo"
        label="Where do you currently ship to?"
        placeholder="e.g. across the UK, and to Harare twice a month"
      />
      <MultiChoiceField
        name="businessChallenges"
        label="Biggest delivery challenge?"
        description="Tick all that apply."
        options={BUSINESS_CHALLENGES}
      />
    </div>
  );
};

export default BusinessStep;
