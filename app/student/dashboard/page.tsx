import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentApplications } from "@/lib/applications";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const apps = await getStudentApplications(session!.user.id);

  const counts = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {session!.user.name?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-gray-500">Track your placement applications here.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Applications" value={counts.total} />
        <Stat label="Pending" value={counts.pending} />
        <Stat label="Accepted" value={counts.accepted} accent />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
        <Link
          href="/opportunities"
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
        >
          Find opportunities
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          You haven&apos;t applied to anything yet.{" "}
          <Link href="/opportunities" className="font-medium text-brand-700 hover:underline">
            Browse opportunities
          </Link>
          .
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Opportunity</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Applied</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {a.opportunity ? (
                      <Link
                        href={`/opportunities/${a.opportunity.id}`}
                        className="font-medium text-gray-900 hover:text-brand-700 hover:underline"
                      >
                        {a.opportunity.title}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Removed</span>
                    )}
                    {a.opportunity?.location && (
                      <span className="block text-xs text-gray-400">
                        {a.opportunity.location}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {a.opportunity?.company ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {new Date(a.appliedAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p
        className={`text-3xl font-bold ${accent ? "text-brand-600" : "text-gray-900"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
