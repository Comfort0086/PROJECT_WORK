import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpportunityById } from "@/lib/opportunities";
import { hasApplied } from "@/lib/applications";
import ApplyButton from "@/components/ApplyButton";

export const dynamic = "force-dynamic";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, session] = await Promise.all([
    getOpportunityById(id),
    getServerSession(authOptions),
  ]);

  if (!item) notFound();

  const role = session?.user?.role;
  const applied =
    role === "student" ? await hasApplied(session!.user.id, item.id) : false;
  const startDate = item.startDate
    ? new Date(item.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const deadline = item.deadline
    ? new Date(item.deadline).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/opportunities"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          ← Back to opportunities
        </Link>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {item.company.industry}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            {item.title}
          </h1>
          <p className="mt-1 text-gray-500">{item.company.name}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-5">
            <Meta label="Location" value={item.location || "—"} />
            <Meta label="Duration" value={item.duration || "—"} />
            <Meta label="Slots" value={String(item.slotsAvailable)} />
            <Meta label="Start date" value={startDate || "—"} />
            <Meta label="Deadline" value={deadline || "Open"} />
          </dl>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-line text-gray-700">
              {item.description}
            </p>
          </div>

          {item.skillsRequired.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Skills required
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.skillsRequired.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply CTA — full apply flow lands in Step 4. */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            {role === "student" ? (
              item.status === "open" ? (
                <ApplyButton opportunityId={item.id} alreadyApplied={applied} />
              ) : (
                <p className="text-sm text-gray-500">
                  This opportunity is closed.
                </p>
              )
            ) : role ? (
              <p className="text-sm text-gray-500">
                Only students can apply to opportunities.
              </p>
            ) : (
              <Link
                href={`/login?callbackUrl=/opportunities/${item.id}`}
                className="inline-block rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition hover:bg-accent-600"
              >
                Sign in to apply
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-800">{value}</dd>
    </div>
  );
}
