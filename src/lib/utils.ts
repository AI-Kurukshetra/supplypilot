export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function relativeTimeFromNow(value: string) {
  const milliseconds = new Date(value).getTime() - Date.now();
  const minutes = Math.round(milliseconds / 60000);

  if (Math.abs(minutes) < 60) {
    return `${Math.abs(minutes)}m ${minutes >= 0 ? "ahead" : "ago"}`;
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return `${Math.abs(hours)}h ${hours >= 0 ? "ahead" : "ago"}`;
  }

  const days = Math.round(hours / 24);
  return `${Math.abs(days)}d ${days >= 0 ? "ahead" : "ago"}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sum(values: number[]) {
  return values.reduce((accumulator, value) => accumulator + value, 0);
}

export function average(values: number[]) {
  return values.length ? sum(values) / values.length : 0;
}
