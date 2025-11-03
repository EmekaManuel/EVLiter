import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type={inputType}
          placeholder={placeholder}
          className={isPassword ? `${className} pr-10` : className}
          {...field}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
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
        <Checkbox
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 border border-gray-400 data-[state=unchecked]:border-gray-400 shadow-sm [&>[data-slot=switch-thumb]]:bg-white [&>[data-slot=switch-thumb]]:shadow-md [&>[data-slot=switch-thumb]]:border [&>[data-slot=switch-thumb]]:border-gray-300 [&>[data-slot=switch-thumb]]:size-[14px]"
          checked={!!value}
          onCheckedChange={onChange}
        />
        <span className="select-none">{label}</span>
      </label>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
