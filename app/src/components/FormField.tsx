export function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  options,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}) {
  const baseClass = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children ? (
        children
      ) : options ? (
        <select name={name} defaultValue={defaultValue?.toString() || ""} required={required} className={baseClass}>
          <option value="">選択してください</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue?.toString() || ""}
          required={required}
          placeholder={placeholder}
          className={baseClass + " h-24"}
        />
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultValue === "true" || defaultValue === 1}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue?.toString() || ""}
          required={required}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
      {label}
    </button>
  );
}
