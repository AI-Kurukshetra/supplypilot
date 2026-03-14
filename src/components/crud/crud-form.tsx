import type { CrudEntityConfig } from "@/lib/crud/config";
import type { CrudOptionSet, CrudRecord } from "@/lib/crud/service";

function formatDateTimeLocal(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const hours = `${parsed.getHours()}`.padStart(2, "0");
  const minutes = `${parsed.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatFieldValue(fieldType: CrudEntityConfig["formFields"][number]["type"], value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (fieldType === "datetime-local") {
    return formatDateTimeLocal(value);
  }

  if (fieldType === "json") {
    return JSON.stringify(value, null, 2);
  }

  if (fieldType === "tags" && Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value);
}

export function CrudForm({
  entity,
  optionSets,
  action,
  submitLabel,
  defaults,
}: {
  entity: CrudEntityConfig;
  optionSets: Record<string, CrudOptionSet[]>;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaults?: CrudRecord;
}) {
  const groupedFields = entity.formFields.reduce<Record<string, CrudEntityConfig["formFields"]>>((groups, field) => {
    const section = field.section ?? "General";
    groups[section] ??= [];
    groups[section].push(field);
    return groups;
  }, {});

  const sectionEntries = Object.entries(groupedFields);

  return (
    <form
      action={action}
      className="space-y-4"
    >
      <div className="space-y-4">
        {sectionEntries.map(([section, fields]) => (
          <section
            key={section}
            className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)]/60 p-4"
          >
            {sectionEntries.length > 1 ? (
              <div className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">{section}</p>
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-2">
              {fields.map((field) => {
                const rawDefault = defaults?.[field.key];
                const defaultValue = formatFieldValue(field.type, rawDefault);
                const options = field.staticOptions ?? (field.optionSource ? optionSets[field.optionSource] ?? [] : []);
                const isFullWidth = field.type === "textarea" || field.type === "json";

                return (
                  <label
                    key={field.key}
                    className={isFullWidth ? "xl:col-span-2" : undefined}
                  >
                    <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                      {field.label}
                    </span>

                    {field.type === "textarea" || field.type === "json" ? (
                      <textarea
                        name={field.key}
                        required={field.required}
                        defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
                        placeholder={field.placeholder}
                        className="min-h-28 w-full rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.key}
                        required={field.required}
                        defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
                        className="h-11 w-full rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
                      >
                        {!field.required ? <option value="">Not set</option> : null}
                        {options.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <span className="inline-flex h-11 items-center gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)]">
                        <input
                          type="checkbox"
                          name={field.key}
                          defaultChecked={Boolean(defaultValue)}
                          className="h-4 w-4 rounded border-[var(--border)]"
                        />
                        Enabled
                      </span>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : field.type}
                        name={field.key}
                        required={field.required}
                        defaultValue={typeof defaultValue === "string" || typeof defaultValue === "number" ? defaultValue : ""}
                        placeholder={field.placeholder}
                        step={field.step}
                        className="h-11 w-full rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]/20"
                      />
                    )}

                    {field.helperText ? (
                      <span className="mt-2 block text-xs text-[var(--muted)]">{field.helperText}</span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}
