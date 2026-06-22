import { getAdminApplications } from "@/lib/admin";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const apps = await getAdminApplications();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
      <p className="mt-1 text-gray-500">
        Most recent application activity across the platform.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Opportunity</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Company</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Applied</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No applications yet.
                </td>
              </tr>
            ) : (
              apps.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.student}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.opportunity}</td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {a.company}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                    {new Date(a.appliedAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
