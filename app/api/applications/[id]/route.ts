import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { Opportunity } from "@/models/Opportunity";
import { createNotification } from "@/lib/notifications";
import type { ApplicationStatus } from "@/models/Application";

const ALLOWED: ApplicationStatus[] = [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
];

// Company changes the status of an application to one of its opportunities.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "company") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { status } = (await req.json()) ?? {};
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  await connectDB();
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const application = await Application.findById(id);
  if (!application) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Ownership: the application's opportunity must belong to this company.
  const opportunity = await Opportunity.findById(application.opportunityId);
  if (!opportunity || String(opportunity.companyId) !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (application.status === status) {
    return NextResponse.json({ id: application._id.toString(), status });
  }

  application.status = status;
  await application.save();

  // Notify the student of the status change.
  await createNotification({
    userId: String(application.studentId),
    type: "status",
    message: `Your application for "${opportunity.title}" was marked ${status}.`,
    link: "/student/dashboard",
  });

  return NextResponse.json({ id: application._id.toString(), status });
}
