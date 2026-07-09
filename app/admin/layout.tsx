import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <>
      {/* Below lg, admin isn't usable — point people at a desktop instead. */}
      <div className="flex min-h-full flex-col items-center justify-center bg-surface px-6 py-12 text-center lg:hidden">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-gray-900 text-white">
          IT
        </span>
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Switch to a desktop
        </h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          The admin dashboard is built for larger screens. Please open this
          page on a desktop or laptop to continue.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600"
        >
          Back to home
        </Link>
      </div>

      <div className="hidden min-h-full flex-col bg-surface lg:flex">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-white">
                  IT
                </span>
                <span className="hidden sm:inline">Admin</span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  href="/admin/dashboard"
                  className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
                >
                  Overview
                </Link>
                <Link
                  href="/admin/users"
                  className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
                >
                  Users
                </Link>
                <Link
                  href="/admin/opportunities"
                  className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
                >
                  Opportunities
                </Link>
                <Link
                  href="/admin/applications"
                  className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
                >
                  Applications
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-500 sm:inline">
                {session?.user?.name}
              </span>
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
