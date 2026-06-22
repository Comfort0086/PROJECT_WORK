import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompanyOpportunity } from "@/lib/company";
import OpportunityForm from "@/components/OpportunityForm";

export const dynamic = "force-dynamic";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const opp = await getCompanyOpportunity(id, session!.user.id);
  if (!opp) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/company/dashboard"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">Edit opportunity</h1>
      <p className="mt-1 text-gray-500">
        {opp.applicantCount} applicant{opp.applicantCount === 1 ? "" : "s"} so far.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <OpportunityForm
          initial={{
            id: opp.id,
            title: opp.title,
            description: opp.description,
            location: opp.location,
            duration: opp.duration,
            slotsAvailable: opp.slotsAvailable,
            skillsRequired: opp.skillsRequired,
            status: opp.status,
            deadline: opp.deadline,
          }}
        />
      </div>
    </div>
  );
}
