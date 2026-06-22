"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserActions({
  userId,
  role,
  verified,
}: {
  userId: string;
  role: "student" | "company";
  verified: boolean;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(verified);
  const [busy, setBusy] = useState(false);

  async function toggleVerify() {
    setBusy(true);
    const next = !isVerified;
    setIsVerified(next); // optimistic
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: next }),
      });
      if (!res.ok) setIsVerified(!next);
      else router.refresh();
    } catch {
      setIsVerified(!next);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this account and all related data? This cannot be undone."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {role === "company" && (
        <button
          onClick={toggleVerify}
          disabled={busy}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
            isVerified
              ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {isVerified ? "Unverify" : "Verify"}
        </button>
      )}
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
