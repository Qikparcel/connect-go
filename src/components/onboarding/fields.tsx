import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { OnboardingValues } from "./schema";

type FieldName = keyof OnboardingValues;

type BaseProps = {
  name: FieldName;
  label: string;
  description?: string;
  optional?: boolean;
};

const Label = ({ label, optional }: { label: string; optional?: boolean }) => (
  <FormLabel className="text-base font-semibold text-foreground">
    {label}
    {optional && <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>}
  </FormLabel>
);

const tileClasses = (selected: boolean) =>
  cn(
    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all duration-200",
    "hover:border-primary/50 hover:bg-primary/5",
    selected ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card/50",
  );

export const TextField = ({
  name,
  label,
  description,
  optional,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}: BaseProps & {
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  autoComplete?: string;
}) => {
  const { control } = useFormContext<OnboardingValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label label={label} optional={optional} />
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Input
              {...field}
              value={(field.value as string) ?? ""}
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              placeholder={placeholder}
              className="h-12 text-base"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const TextareaField = ({
  name,
  label,
  description,
  optional,
  placeholder,
}: BaseProps & { placeholder?: string }) => {
  const { control } = useFormContext<OnboardingValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label label={label} optional={optional} />
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Textarea
              {...field}
              value={(field.value as string) ?? ""}
              placeholder={placeholder}
              rows={3}
              className="resize-none text-base"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const ChoiceField = ({
  name,
  label,
  description,
  optional,
  options,
  columns = 2,
}: BaseProps & { options: readonly string[]; columns?: 1 | 2 }) => {
  const { control } = useFormContext<OnboardingValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label label={label} optional={optional} />
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={(field.value as string) ?? ""}
              className={cn("grid gap-3 pt-1", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}
            >
              {options.map((option) => (
                <label key={option} className={tileClasses(field.value === option)}>
                  <RadioGroupItem value={option} aria-label={option} />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const MultiChoiceField = ({
  name,
  label,
  description,
  optional,
  options,
  columns = 2,
}: BaseProps & { options: readonly string[]; columns?: 1 | 2 }) => {
  const { control } = useFormContext<OnboardingValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = (field.value as string[]) ?? [];
        const toggle = (option: string) =>
          field.onChange(
            selected.includes(option)
              ? selected.filter((item) => item !== option)
              : [...selected, option],
          );

        return (
          <FormItem>
            <Label label={label} optional={optional} />
            {description && <FormDescription>{description}</FormDescription>}
            <div className={cn("grid gap-3 pt-1", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}>
              {options.map((option) => (
                <label key={option} className={tileClasses(selected.includes(option))}>
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={() => toggle(option)}
                    aria-label={option}
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
