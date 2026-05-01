"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";

export function ApiButton({ path, label, payload }: { path: string; label: string; payload?: Record<string, unknown> }) {
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload ?? {})
    });
    window.location.reload();
  }
  return (
    <button className="button primary" disabled={busy} onClick={run}>
      <PlayCircle size={16} />
      {busy ? "Running" : label}
    </button>
  );
}
