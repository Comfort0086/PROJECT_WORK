import { connectDB } from "@/lib/db";
import { Opportunity } from "@/models/Opportunity";
import { Application } from "@/models/Application";
import "@/models/User"; // register for populate
import type { OpportunityStatus } from "@/models/Opportunity";
import type { ApplicationStatus } from "@/models/Application";

export interface CompanyOpportunity {
  id: string;
  title: string;
  location: string;
  duration: string;
  slotsAvailable: number;
  status: OpportunityStatus;
  skillsRequired: string[];
  description: string;
  deadline: string | null;
  applicantCount: number;
  createdAt: string;
}

export async function getCompanyOpportunities(
  companyId: string
): Promise<CompanyOpportunity[]> {
  await connectDB();

  const opps = await Opportunity.find({ companyId })
    .sort({ createdAt: -1 })
    .lean();

  // Applicant counts grouped by opportunity in one query.
  const counts = await Application.aggregate<{ _id: unknown; n: number }>([
    {
      $match: {
        opportunityId: { $in: opps.map((o) => o._id) },
      },
    },
    { $group: { _id: "$opportunityId", n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

  return opps.map((o) => ({
    id: String(o._id),
    title: o.title,
    location: o.location ?? "",
    duration: o.duration ?? "",
    slotsAvailable: o.slotsAvailable ?? 1,
    status: o.status,
    skillsRequired: o.skillsRequired ?? [],
    description: o.description,
    deadline: o.deadline ? new Date(o.deadline).toISOString() : null,
    applicantCount: countMap.get(String(o._id)) ?? 0,
    createdAt: new Date(o.createdAt).toISOString(),
  }));
}

export async function getCompanyOpportunity(
  id: string,
  companyId: string
): Promise<CompanyOpportunity | null> {
  await connectDB();
  if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

  const o = await Opportunity.findOne({ _id: id, companyId }).lean();
  if (!o) return null;

  const applicantCount = await Application.countDocuments({
    opportunityId: o._id,
  });

  return {
    id: String(o._id),
    title: o.title,
    location: o.location ?? "",
    duration: o.duration ?? "",
    slotsAvailable: o.slotsAvailable ?? 1,
    status: o.status,
    skillsRequired: o.skillsRequired ?? [],
    description: o.description,
    deadline: o.deadline ? new Date(o.deadline).toISOString() : null,
    applicantCount,
    createdAt: new Date(o.createdAt).toISOString(),
  };
}

export interface Applicant {
  applicationId: string;
  status: ApplicationStatus;
  coverNote: string;
  appliedAt: string;
  student: {
    name: string;
    email: string;
    university: string;
    department: string;
    level: string;
    matricNo: string;
    cvUrl: string;
  };
}

type PopulatedStudent = {
  name?: string;
  email?: string;
  university?: string;
  department?: string;
  level?: string;
  matricNo?: string;
  cvUrl?: string;
};

/** Applicants for one opportunity — verifies the company owns it first. */
export async function getApplicants(
  opportunityId: string,
  companyId: string
): Promise<Applicant[] | null> {
  await connectDB();
  if (!opportunityId.match(/^[0-9a-fA-F]{24}$/)) return null;

  const opp = await Opportunity.findOne({
    _id: opportunityId,
    companyId,
  }).lean();
  if (!opp) return null; // not found or not owned

  const apps = await Application.find({ opportunityId })
    .sort({ createdAt: -1 })
    .populate(
      "studentId",
      "name email university department level matricNo cvUrl"
    )
    .lean();

  return apps.map((a) => {
    const s = (a.studentId ?? {}) as PopulatedStudent;
    return {
      applicationId: String(a._id),
      status: a.status,
      coverNote: a.coverNote ?? "",
      appliedAt: new Date(a.createdAt).toISOString(),
      student: {
        name: s.name ?? "Unknown",
        email: s.email ?? "",
        university: s.university ?? "",
        department: s.department ?? "",
        level: s.level ?? "",
        matricNo: s.matricNo ?? "",
        cvUrl: s.cvUrl ?? "",
      },
    };
  });
}
