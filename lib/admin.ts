import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Opportunity } from "@/models/Opportunity";
import { Application } from "@/models/Application";
import "@/models/User";
import type { UserRole } from "@/models/User";
import type { ApplicationStatus } from "@/models/Application";

export interface AdminStats {
  students: number;
  companies: number;
  unverifiedCompanies: number;
  opportunities: number;
  openOpportunities: number;
  applications: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB();
  const [
    students,
    companies,
    unverifiedCompanies,
    opportunities,
    openOpportunities,
    applications,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "company" }),
    User.countDocuments({ role: "company", verified: { $ne: true } }),
    Opportunity.countDocuments({}),
    Opportunity.countDocuments({ status: "open" }),
    Application.countDocuments({}),
  ]);
  return {
    students,
    companies,
    unverifiedCompanies,
    opportunities,
    openOpportunities,
    applications,
  };
}

export interface AdminUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  verified: boolean;
  meta: string; // university (student) or industry (company)
  createdAt: string;
}

export async function getAdminUsers(
  role?: "student" | "company"
): Promise<AdminUser[]> {
  await connectDB();
  const filter = role
    ? { role }
    : { role: { $in: ["student", "company"] as UserRole[] } };
  const docs = await User.find(filter).sort({ createdAt: -1 }).lean();
  return docs.map((u) => ({
    id: String(u._id),
    role: u.role,
    name: u.name,
    email: u.email,
    verified: !!u.verified,
    meta:
      u.role === "company"
        ? u.industry ?? "—"
        : u.university ?? "—",
    createdAt: new Date(u.createdAt).toISOString(),
  }));
}

export interface AdminOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  status: "open" | "closed";
  applicantCount: number;
  createdAt: string;
}

export async function getAdminOpportunities(): Promise<AdminOpportunity[]> {
  await connectDB();
  const opps = await Opportunity.find({})
    .sort({ createdAt: -1 })
    .populate("companyId", "name")
    .lean();

  const counts = await Application.aggregate<{ _id: unknown; n: number }>([
    { $group: { _id: "$opportunityId", n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

  return opps.map((o) => {
    const company = (o.companyId ?? {}) as { name?: string };
    return {
      id: String(o._id),
      title: o.title,
      company: company.name ?? "Unknown",
      location: o.location ?? "",
      status: o.status,
      applicantCount: countMap.get(String(o._id)) ?? 0,
      createdAt: new Date(o.createdAt).toISOString(),
    };
  });
}

export interface AdminApplication {
  id: string;
  student: string;
  opportunity: string;
  company: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export async function getAdminApplications(): Promise<AdminApplication[]> {
  await connectDB();
  const apps = await Application.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("studentId", "name")
    .populate({
      path: "opportunityId",
      select: "title companyId",
      populate: { path: "companyId", select: "name" },
    })
    .lean();

  return apps.map((a) => {
    const student = (a.studentId ?? {}) as { name?: string };
    const opp = (a.opportunityId ?? {}) as {
      title?: string;
      companyId?: { name?: string };
    };
    return {
      id: String(a._id),
      student: student.name ?? "Unknown",
      opportunity: opp.title ?? "Removed",
      company: opp.companyId?.name ?? "—",
      status: a.status,
      appliedAt: new Date(a.createdAt).toISOString(),
    };
  });
}
