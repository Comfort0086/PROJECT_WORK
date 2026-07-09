"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { roleHome } from "@/lib/roleHome";
import PasswordField from "@/components/PasswordField";

type Role = "student" | "company";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    if (payload.password !== payload.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    delete payload.confirmPassword;
    payload.role = role;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration.
      const result = await signIn("credentials", {
        email: payload.email as string,
        password: payload.password as string,
        redirect: false,
      });
      if (result?.error) {
        // Account created but auto-login failed — send to login.
        router.push("/login");
        return;
      }
      router.push(roleHome(role));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-full flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-brand-700">
            IT Placement Portal
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Create your account to get started.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Role toggle */}
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`rounded-md py-2 text-sm font-medium transition ${
                role === "student"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              I&apos;m a Student
            </button>
            <button
              type="button"
              onClick={() => setRole("company")}
              className={`rounded-md py-2 text-sm font-medium transition ${
                role === "company"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              I&apos;m a Company
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label={role === "company" ? "Company name" : "Full name"}
              name="name"
              type="text"
              required
            />
            <Field label="Email" name="email" type="email" required />
            <PasswordField
              label="Password"
              name="password"
              required
              hint="At least 6 characters."
            />
            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              required
            />

            {role === "student" ? (
              <>
                <Field label="University" name="university" type="text" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Matric No." name="matricNo" type="text" />
                  <Field label="Level" name="level" type="text" />
                </div>
                <Field label="Department" name="department" type="text" />
              </>
            ) : (
              <>
                <Field label="Industry" name="industry" type="text" />
                <Field
                  label="Website"
                  name="companyWebsite"
                  type="url"
                  placeholder="https://"
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent-500 py-2.5 font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
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
