import Link from "next/link";
import { getAdminStats } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
      <p className="mt-1 text-gray-500">
        Centralized monitoring of users, companies, and applications.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Students" value={stats.students} href="/admin/users?role=student" />
        <Stat label="Companies" value={stats.companies} href="/admin/users?role=company" />
        <Stat
          label="Awaiting verification"
          value={stats.unverifiedCompanies}
          href="/admin/users?role=company"
          accent={stats.unverifiedCompanies > 0}
        />
        <Stat label="Opportunities" value={stats.opportunities} href="/admin/opportunities" />
        <Stat label="Open now" value={stats.openOpportunities} href="/admin/opportunities" />
        <Stat label="Applications" value={stats.applications} href="/admin/applications" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/users" title="Manage users" desc="Verify companies, remove accounts." />
        <QuickLink href="/admin/opportunities" title="Oversee listings" desc="Review every posted opportunity." />
        <QuickLink href="/admin/applications" title="Monitor applications" desc="Track all application activity." />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
    >
      <p className={`text-3xl font-bold ${accent ? "text-accent-600" : "text-gray-900"}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  );
}
