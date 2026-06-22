"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@/models/Application";
import StatusBadge from "@/components/StatusBadge";

const OPTIONS: ApplicationStatus[] = [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
];

export default function ApplicantStatusControl({
  applicationId,
  initialStatus,
}: {
  applicationId: string;
  initialStatus: ApplicationStatus;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function update(next: ApplicationStatus) {
    const prev = status;
    setStatus(next); // optimistic
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setStatus(prev); // revert
        setError(true);
      }
    } catch {
      setStatus(prev);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={status} />
      <select
        value={status}
        disabled={saving}
        onChange={(e) => update(e.target.value as ApplicationStatus)}
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o[0].toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">Failed — retry</span>}
    </div>
  );
}
