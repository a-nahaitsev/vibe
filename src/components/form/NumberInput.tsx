const inputClass =
  "w-full rounded border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

type Props = {
  id: string;
  name: string;
  label: string;
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  min?: number;
  max?: number;
};

export function NumberInput({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  min,
  max,
}: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="number"
        value={value === undefined ? "" : value}
        onChange={onChange}
        className={inputClass}
        placeholder={placeholder}
        min={min}
        max={max}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
