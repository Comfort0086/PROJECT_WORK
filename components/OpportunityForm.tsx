"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface OpportunityFormValues {
  id?: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  slotsAvailable: number;
  skillsRequired: string[];
  status: "open" | "closed";
  deadline: string | null; // ISO or null
}

export default function OpportunityForm({
  initial,
}: {
  initial?: OpportunityFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
      duration: form.get("duration"),
      slotsAvailable: form.get("slotsAvailable"),
      skillsRequired: String(form.get("skillsRequired") ?? ""),
      status: form.get("status"),
      deadline: form.get("deadline") || null,
    };

    const url = isEdit
      ? `/api/opportunities/${initial!.id}`
      : "/api/opportunities";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        setSaving(false);
        return;
      }
      router.push("/company/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm("Delete this opportunity? This cannot be undone.")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/opportunities/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not delete.");
        setDeleting(false);
        return;
      }
      router.push("/company/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setDeleting(false);
    }
  }

  const deadlineValue = initial?.deadline
    ? initial.deadline.slice(0, 10)
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Title" name="title" defaultValue={initial?.title} required />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </span>
        <textarea
          name="description"
          rows={6}
          required
          defaultValue={initial?.description}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Location" name="location" defaultValue={initial?.location} />
        <Field label="Duration" name="duration" placeholder="e.g. 6 Months" defaultValue={initial?.duration} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Slots available"
          name="slotsAvailable"
          type="number"
          min={1}
          defaultValue={String(initial?.slotsAvailable ?? 1)}
        />
        <Field
          label="Application deadline"
          name="deadline"
          type="date"
          defaultValue={deadlineValue}
        />
      </div>

      <Field
        label="Skills required"
        name="skillsRequired"
        placeholder="Comma-separated, e.g. React, Node.js, SQL"
        defaultValue={initial?.skillsRequired.join(", ")}
        hint="Separate skills with commas."
      />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Status</span>
        <select
          name="status"
          defaultValue={initial?.status ?? "open"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          <option value="open">Open — accepting applications</option>
          <option value="closed">Closed — no longer accepting</option>
        </select>
      </label>

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent-500 px-6 py-2.5 font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Post opportunity"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  ...props
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}
