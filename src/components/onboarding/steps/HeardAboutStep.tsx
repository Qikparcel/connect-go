import { useFormContext } from "react-hook-form";
import { ChoiceField, TextField } from "../fields";
import { HEARD_ABOUT_OPTIONS, type OnboardingValues } from "../schema";

const HeardAboutStep = () => {
  const { watch } = useFormContext<OnboardingValues>();

  return (
    <div className="space-y-6">
      <ChoiceField
        name="heardAbout"
        label="How did you hear about QikParcel?"
        description="This tells us which channels are working — it takes one tap."
        options={HEARD_ABOUT_OPTIONS}
      />
      {watch("heardAbout") === "Other" && (
        <TextField name="heardAboutOther" label="Where did you hear about us?" placeholder="Tell us more" />
      )}
    </div>
  );
};

export default HeardAboutStep;
