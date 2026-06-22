"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-700"
      }
    >
      Sign out
    </button>
  );
}
