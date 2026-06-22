"use client";

import { useEffect, useRef, useState } from "react";
import type { OpportunityListItem } from "@/lib/opportunities";
import OpportunityCard from "@/components/OpportunityCard";

export default function OpportunitiesBrowser({
  initialItems,
  industries,
}: {
  initialItems: OpportunityListItem[];
  industries: string[];
}) {
  const [items, setItems] = useState(initialItems);
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip the initial run — we already have server-rendered items.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (industry) params.set("industry", industry);
      try {
        const res = await fetch(`/api/opportunities?${params.toString()}`);
        const data = await res.json();
        setItems(data.items ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [q, industry]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by company, role or keyword…"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          <option value="">All Industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {loading ? "Searching…" : `${items.length} opportunit${items.length === 1 ? "y" : "ies"} found`}
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No opportunities match your search.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <OpportunityCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
