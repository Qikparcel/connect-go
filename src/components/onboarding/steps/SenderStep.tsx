import { ChoiceField, TextField, TextareaField } from "../fields";
import { FREQUENCIES } from "../schema";

const SenderStep = () => (
  <div className="space-y-6">
    <TextareaField
      name="senderItems"
      label="What do you send?"
      placeholder="e.g. clothes, medication, documents, groceries"
    />
    <ChoiceField name="senderFrequency" label="How often do you send?" options={FREQUENCIES} />
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="senderFrom" label="You send from" placeholder="e.g. Manchester" />
      <TextField name="senderTo" label="You send to" placeholder="e.g. Bulawayo" />
    </div>
  </div>
);

export default SenderStep;
