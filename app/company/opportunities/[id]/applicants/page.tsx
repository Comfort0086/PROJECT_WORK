import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getApplicants, getCompanyOpportunity } from "@/lib/company";
import ApplicantStatusControl from "@/components/ApplicantStatusControl";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const [opp, applicants] = await Promise.all([
    getCompanyOpportunity(id, session!.user.id),
    getApplicants(id, session!.user.id),
  ]);

  if (!opp || applicants === null) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/company/dashboard"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">{opp.title}</h1>
      <p className="mt-1 text-gray-500">
        {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
      </p>

      {applicants.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No applications yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applicants.map((a) => (
            <div
              key={a.applicationId}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {a.student.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {[a.student.university, a.student.department, a.student.level]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {a.student.email}
                    {a.student.matricNo && ` · ${a.student.matricNo}`}
                  </p>
                </div>
                <ApplicantStatusControl
                  applicationId={a.applicationId}
                  initialStatus={a.status}
                />
              </div>

              {a.coverNote && (
                <p className="mt-3 whitespace-pre-line rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {a.coverNote}
                </p>
              )}

              <div className="mt-3 flex items-center gap-4 text-sm">
                {a.student.cvUrl ? (
                  <a
                    href={a.student.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    View CV →
                  </a>
                ) : (
                  <span className="text-gray-400">No CV provided</span>
                )}
                <span className="text-gray-400">
                  Applied {new Date(a.appliedAt).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
