import { ChoiceField, TextField, TextareaField } from "../fields";
import { FREQUENCIES, VEHICLE_TYPES } from "../schema";

const CourierStep = () => (
  <div className="space-y-6">
    <ChoiceField name="courierVehicle" label="How do you get around?" options={VEHICLE_TYPES} />
    <TextareaField
      name="courierAreas"
      label="Which areas do you cover?"
      placeholder="e.g. North London, or Harare CBD and Chitungwiza"
    />
    <ChoiceField
      name="courierAvailability"
      label="How often are you available?"
      options={FREQUENCIES}
    />
    <TextField
      name="courierCapacity"
      label="Largest parcel you can carry"
      optional
      placeholder="e.g. up to 20kg, or a couple of shoe boxes"
    />
  </div>
);

export default CourierStep;
