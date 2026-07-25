import { MultiChoiceField } from "../fields";
import { ROLES } from "../schema";

const RolesStep = () => (
  <MultiChoiceField
    name="roles"
    label="Which best describes you?"
    description="Tick all that apply — if you run a business and travel home each month, tick both and we'll ask about each."
    options={ROLES}
  />
);

export default RolesStep;
