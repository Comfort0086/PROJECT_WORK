import { getOpportunities, getIndustries } from "@/lib/opportunities";
import OpportunitiesBrowser from "@/components/OpportunitiesBrowser";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const [items, industries] = await Promise.all([
    getOpportunities(),
    getIndustries(),
  ]);

  return (
    <main className="bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Browse IT Opportunities</h1>
        <p className="mt-2 text-gray-500">
          Find SIWES and Industrial Training placements across Nigeria.
        </p>

        <div className="mt-8">
          <OpportunitiesBrowser initialItems={items} industries={industries} />
        </div>
      </div>
    </main>
  );
}
