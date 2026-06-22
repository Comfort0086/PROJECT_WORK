import Link from "next/link";
import { getAdminOpportunities } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminOpportunitiesPage() {
  const opps = await getAdminOpportunities();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">All Opportunities</h1>
      <p className="mt-1 text-gray-500">Every listing posted on the platform.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Applicants</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {opps.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No opportunities yet.
                </td>
              </tr>
            ) : (
              opps.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/opportunities/${o.id}`}
                      className="font-medium text-gray-900 hover:text-brand-700 hover:underline"
                    >
                      {o.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.company}</td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {o.location || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        o.status === "open"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.applicantCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
