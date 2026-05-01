export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes("complete") || normalized.includes("approved") || normalized.includes("active") ? "ok" : normalized.includes("failed") ? "critical" : "";
  return <span className={`badge ${tone}`}>{value}</span>;
}
