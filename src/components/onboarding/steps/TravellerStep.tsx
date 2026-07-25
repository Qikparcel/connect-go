import { ChoiceField, TextField } from "../fields";
import { FREQUENCIES } from "../schema";

const TravellerStep = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="travellerFrom" label="You travel from" placeholder="e.g. London" />
      <TextField name="travellerTo" label="You travel to" placeholder="e.g. Harare" />
    </div>
    <ChoiceField name="travellerFrequency" label="How often do you travel?" options={FREQUENCIES} />
    <TextField
      name="travellerNextTrip"
      label="When is your next trip?"
      optional
      placeholder="e.g. 15 August, or 'not booked yet'"
    />
  </div>
);

export default TravellerStep;
