import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  /** When true, error is shown below the row (e.g. for required terms). */
  showErrorBelow?: boolean;
};

export function CheckboxInput({
  id,
  name,
  label,
  checked,
  onChange,
  error,
  showErrorBelow = false,
}: Props) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2",
          showErrorBelow && "items-start"
        )}
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={cn(
            "h-4 w-4 rounded border-zinc-300",
            showErrorBelow && "mt-0.5"
          )}
        />
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
