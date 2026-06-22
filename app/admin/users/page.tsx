import Link from "next/link";
import { getAdminUsers } from "@/lib/admin";
import AdminUserActions from "@/components/AdminUserActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const roleFilter =
    role === "student" || role === "company" ? role : undefined;
  const users = await getAdminUsers(roleFilter);

  const tabs = [
    { label: "All", value: undefined as string | undefined, href: "/admin/users" },
    { label: "Students", value: "student", href: "/admin/users?role=student" },
    { label: "Companies", value: "company", href: "/admin/users?role=company" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
      <p className="mt-1 text-gray-500">
        Verify companies and remove accounts.
      </p>

      <div className="mt-5 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              roleFilter === t.value
                ? "bg-brand-600 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Detail</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{u.name}</span>
                    {u.role === "company" &&
                      (u.verified ? (
                        <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                          verified
                        </span>
                      ) : (
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          pending
                        </span>
                      ))}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{u.role}</td>
                  <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                    {u.meta}
                  </td>
                  <td className="px-4 py-3">
                    <AdminUserActions
                      userId={u.id}
                      role={u.role as "student" | "company"}
                      verified={u.verified}
                    />
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
