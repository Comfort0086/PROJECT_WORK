import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import NotificationBell from "@/components/NotificationBell";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
                IT
              </span>
              <span className="hidden sm:inline">Company</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/company/dashboard"
                className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
              >
                My Opportunities
              </Link>
              <Link
                href="/company/opportunities/new"
                className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
              >
                Post New
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="hidden text-sm text-gray-500 sm:inline">
              {session?.user?.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
