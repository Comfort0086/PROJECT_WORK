import { connectDB } from "@/lib/db";
import { Opportunity } from "@/models/Opportunity";
import "@/models/User"; // ensure User schema is registered for populate

export interface OpportunityListItem {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  slotsAvailable: number;
  skillsRequired: string[];
  status: "open" | "closed";
  deadline: string | null;
  createdAt: string;
  company: { id: string; name: string; industry: string };
}

export interface OpportunityFilters {
  q?: string;
  industry?: string;
  location?: string;
  limit?: number;
}

type PopulatedCompany = { _id: unknown; name?: string; industry?: string };

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getOpportunities(
  filters: OpportunityFilters = {}
): Promise<OpportunityListItem[]> {
  await connectDB();

  const { q, industry, location, limit } = filters;

  // DB-level filters: only open listings, plus optional text/location search.
  const query: Record<string, unknown> = { status: "open" };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    query.$or = [{ title: rx }, { description: rx }, { skillsRequired: rx }];
  }
  if (location) {
    query.location = new RegExp(escapeRegex(location), "i");
  }

  const docs = await Opportunity.find(query)
    .sort({ createdAt: -1 })
    .limit(limit ?? 100)
    .populate("companyId", "name industry")
    .lean();

  let items: OpportunityListItem[] = docs.map((d) => {
    const company = (d.companyId ?? {}) as PopulatedCompany;
    return {
      id: String(d._id),
      title: d.title,
      description: d.description,
      location: d.location ?? "",
      duration: d.duration ?? "",
      slotsAvailable: d.slotsAvailable ?? 1,
      skillsRequired: d.skillsRequired ?? [],
      status: d.status,
      deadline: d.deadline ? new Date(d.deadline).toISOString() : null,
      createdAt: new Date(d.createdAt).toISOString(),
      company: {
        id: String(company._id ?? ""),
        name: company.name ?? "Unknown company",
        industry: company.industry ?? "Other",
      },
    };
  });

  // Industry lives on the company, so filter after populate.
  if (industry) {
    items = items.filter(
      (i) => i.company.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  return items;
}

export async function getOpportunityById(
  id: string
): Promise<OpportunityListItem | null> {
  await connectDB();
  if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

  const d = await Opportunity.findById(id)
    .populate("companyId", "name industry companyWebsite")
    .lean();
  if (!d) return null;

  const company = (d.companyId ?? {}) as PopulatedCompany;
  return {
    id: String(d._id),
    title: d.title,
    description: d.description,
    location: d.location ?? "",
    duration: d.duration ?? "",
    slotsAvailable: d.slotsAvailable ?? 1,
    skillsRequired: d.skillsRequired ?? [],
    status: d.status,
    deadline: d.deadline ? new Date(d.deadline).toISOString() : null,
    createdAt: new Date(d.createdAt).toISOString(),
    company: {
      id: String(company._id ?? ""),
      name: company.name ?? "Unknown company",
      industry: company.industry ?? "Other",
    },
  };
}

/** Distinct industries among companies that have open listings (for filters). */
export async function getIndustries(): Promise<string[]> {
  const items = await getOpportunities();
  return Array.from(new Set(items.map((i) => i.company.industry))).sort();
}
