import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";

type YesNoFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
};

export function YesNoField<T extends FieldValues>({
  name,
  control,
  label,
}: YesNoFieldProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <Checkbox checked={!!value} onCheckedChange={onChange} />
        <span>{value ? "Yes" : "No"}</span>
      </label>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
