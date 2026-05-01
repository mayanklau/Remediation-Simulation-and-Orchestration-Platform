"use client";

import { useState } from "react";
import { CheckCircle2, FileText, FlaskConical, PlayCircle } from "lucide-react";

export function ActionButtons({ remediationActionId }: { remediationActionId: string }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function invoke(action: "simulate" | "plan" | "workflow") {
    setBusy(action);
    const path =
      action === "simulate"
        ? `/api/remediation-actions/${remediationActionId}/simulate`
        : action === "plan"
          ? `/api/remediation-actions/${remediationActionId}/plan`
          : `/api/remediation-actions/${remediationActionId}/workflow`;
    await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    window.location.reload();
  }

  return (
    <div className="actions">
      <button className="button primary" disabled={busy !== null} onClick={() => invoke("simulate")}>
        <FlaskConical size={16} />
        Simulate
      </button>
      <button className="button" disabled={busy !== null} onClick={() => invoke("plan")}>
        <FileText size={16} />
        Generate Plan
      </button>
      <button className="button" disabled={busy !== null} onClick={() => invoke("workflow")}>
        <PlayCircle size={16} />
        Open Workflow
      </button>
      {busy ? (
        <span className="badge">
          <CheckCircle2 size={14} />
          Working
        </span>
      ) : null}
    </div>
  );
}
