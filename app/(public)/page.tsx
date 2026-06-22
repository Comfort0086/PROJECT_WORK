import Link from "next/link";
import { getOpportunities } from "@/lib/opportunities";
import OpportunityCard from "@/components/OpportunityCard";

// Always reflect the latest listings.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getOpportunities({ limit: 6 });

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-800 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-brand-900 opacity-95" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Find Your Industrial Training Placement
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-100">
            Connect with top companies across Nigeria offering SIWES and IT
            placements for university students.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/opportunities"
              className="rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white transition hover:bg-accent-600"
            >
              Browse Opportunities
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Available IT Opportunities
            </h2>
            <Link
              href="/opportunities"
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              View all →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              No opportunities posted yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <OpportunityCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
