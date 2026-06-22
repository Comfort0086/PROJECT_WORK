"use client";

import { useState } from "react";
import Link from "next/link";

export default function ApplyButton({
  opportunityId,
  alreadyApplied,
}: {
  opportunityId: string;
  alreadyApplied: boolean;
}) {
  const [applied, setApplied] = useState(alreadyApplied);
  const [open, setOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, coverNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        // 409 = already applied: treat as applied so the UI settles.
        if (res.status === 409) setApplied(true);
        setError(data.error ?? "Could not apply.");
        return;
      }
      setApplied(true);
      setOpen(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2 font-semibold text-brand-700">
          ✓ Application submitted
        </span>
        <Link
          href="/student/dashboard"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Track it on your dashboard →
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition hover:bg-accent-600"
      >
        Apply now
      </button>
    );
  }

  return (
    <div className="max-w-lg">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          Cover note <span className="text-gray-400">(optional)</span>
        </span>
        <textarea
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          rows={4}
          placeholder="Tell the company why you're a great fit…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-accent-500 px-5 py-2.5 font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit application"}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={loading}
          className="rounded-lg px-5 py-2.5 font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
