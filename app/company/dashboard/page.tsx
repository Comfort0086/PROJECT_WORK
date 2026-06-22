import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompanyOpportunities } from "@/lib/company";

export const dynamic = "force-dynamic";

export default async function CompanyDashboard() {
  const session = await getServerSession(authOptions);
  const opps = await getCompanyOpportunities(session!.user.id);

  const totalApplicants = opps.reduce((sum, o) => sum + o.applicantCount, 0);
  const openCount = opps.filter((o) => o.status === "open").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Opportunities</h1>
          <p className="mt-1 text-gray-500">
            Manage your postings and review applicants.
          </p>
        </div>
        <Link
          href="/company/opportunities/new"
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
        >
          + Post a Job
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Postings" value={opps.length} />
        <Stat label="Open" value={openCount} />
        <Stat label="Total applicants" value={totalApplicants} accent />
      </div>

      {opps.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          You haven&apos;t posted any opportunities yet.{" "}
          <Link
            href="/company/opportunities/new"
            className="font-medium text-brand-700 hover:underline"
          >
            Post your first one
          </Link>
          .
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {opps.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {o.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.status === "open"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {o.location || "—"} · {o.duration || "—"} ·{" "}
                  <span className="font-medium text-gray-700">
                    {o.applicantCount} applicant{o.applicantCount === 1 ? "" : "s"}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/company/opportunities/${o.id}/applicants`}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  View applicants
                </Link>
                <Link
                  href={`/company/opportunities/${o.id}/edit`}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
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
