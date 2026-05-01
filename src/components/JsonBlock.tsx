import { parseJsonObject } from "@/lib/json";

export function JsonBlock({ value }: { value: string | null | undefined }) {
  return <pre className="mono">{JSON.stringify(parseJsonObject(value, {}), null, 2)}</pre>;
}
