import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  className?: string;
}

interface SwitchFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  className?: string;
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  className = "h-11",
}: FormFieldProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        className={className}
        {...field}
      />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

export function SwitchField<T extends FieldValues>({
  name,
  control,
  label,
}: SwitchFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <Checkbox checked={!!value} onCheckedChange={onChange} />
        <span className="select-none">{label}</span>
      </label>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
