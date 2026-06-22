import Link from "next/link";
import type { OpportunityListItem } from "@/lib/opportunities";

// Soft colored pill per industry, with a sensible fallback.
function industryClasses(industry: string): string {
  const key = industry.toLowerCase();
  if (key.includes("tech")) return "bg-brand-50 text-brand-700";
  if (key.includes("financ") || key.includes("bank"))
    return "bg-amber-50 text-amber-700";
  if (key.includes("oil") || key.includes("gas") || key.includes("energy"))
    return "bg-purple-50 text-purple-700";
  if (key.includes("health") || key.includes("medic"))
    return "bg-rose-50 text-rose-700";
  if (key.includes("telecom")) return "bg-sky-50 text-sky-700";
  return "bg-gray-100 text-gray-600";
}

export default function OpportunityCard({
  item,
}: {
  item: OpportunityListItem;
}) {
  return (
    <Link
      href={`/opportunities/${item.id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
    >
      <span
        className={`mb-3 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${industryClasses(
          item.company.industry
        )}`}
      >
        {item.company.industry}
      </span>

      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700">
        {item.title}
      </h3>
      <p className="mt-0.5 text-sm text-gray-500">{item.company.name}</p>

      <div className="mt-4 space-y-1.5 text-sm text-gray-600">
        {item.location && (
          <p className="flex items-center gap-1.5">
            <span aria-hidden>📍</span>
            {item.location}
          </p>
        )}
        {item.duration && (
          <p className="flex items-center gap-1.5">
            <span aria-hidden>⏱️</span>
            {item.duration}
          </p>
        )}
      </div>

      {item.skillsRequired.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.skillsRequired.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500"
            >
              {skill}
            </span>
          ))}
          {item.skillsRequired.length > 3 && (
            <span className="px-1 text-xs text-gray-400">
              +{item.skillsRequired.length - 3} more
            </span>
          )}
        </div>
      )}

      <span className="mt-5 text-sm font-semibold text-accent-600 group-hover:underline">
        View details →
      </span>
    </Link>
  );
}
