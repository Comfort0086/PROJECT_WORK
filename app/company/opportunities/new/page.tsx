import Link from "next/link";
import OpportunityForm from "@/components/OpportunityForm";

export default function NewOpportunityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/company/dashboard"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">
        Post a new opportunity
      </h1>
      <p className="mt-1 text-gray-500">
        Fill in the details students will see when browsing.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <OpportunityForm />
      </div>
    </div>
  );
}
