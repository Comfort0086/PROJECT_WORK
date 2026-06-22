import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import "@/models/Opportunity"; // register schema for populate
import type { ApplicationStatus } from "@/models/Application";

export interface StudentApplicationItem {
  id: string;
  status: ApplicationStatus;
  coverNote: string;
  appliedAt: string;
  opportunity: {
    id: string;
    title: string;
    location: string;
    duration: string;
    company: string;
  } | null;
}

type PopulatedOpp = {
  _id: unknown;
  title?: string;
  location?: string;
  duration?: string;
  companyId?: { name?: string };
};

export async function getStudentApplications(
  studentId: string
): Promise<StudentApplicationItem[]> {
  await connectDB();

  const docs = await Application.find({ studentId })
    .sort({ createdAt: -1 })
    .populate({
      path: "opportunityId",
      select: "title location duration companyId",
      populate: { path: "companyId", select: "name" },
    })
    .lean();

  return docs.map((d) => {
    const opp = (d.opportunityId ?? null) as PopulatedOpp | null;
    return {
      id: String(d._id),
      status: d.status,
      coverNote: d.coverNote ?? "",
      appliedAt: new Date(d.createdAt).toISOString(),
      opportunity: opp
        ? {
            id: String(opp._id),
            title: opp.title ?? "Untitled",
            location: opp.location ?? "",
            duration: opp.duration ?? "",
            company: opp.companyId?.name ?? "Unknown company",
          }
        : null,
    };
  });
}

export async function hasApplied(
  studentId: string,
  opportunityId: string
): Promise<boolean> {
  await connectDB();
  if (!opportunityId.match(/^[0-9a-fA-F]{24}$/)) return false;
  const existing = await Application.exists({ studentId, opportunityId });
  return !!existing;
}
