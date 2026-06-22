import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { roleHome } from "@/lib/roleHome";

export default async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            IT
          </span>
          <span className="hidden sm:inline">Placement Portal</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/opportunities"
            className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
          >
            Browse
          </Link>
          {session?.user ? (
            <Link
              href={roleHome(session.user.role)}
              className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 font-medium text-gray-600 hover:text-brand-700"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent-500 px-4 py-2 font-semibold text-white hover:bg-accent-600"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
