import SiteHeader from "@/components/SiteHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-gray-500">
          <p className="font-semibold text-brand-700">IT Placement Portal</p>
          <p className="mt-1">
            Connecting Nigerian university students with Industrial Training
            (SIWES) placements nationwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
