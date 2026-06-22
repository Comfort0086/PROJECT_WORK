import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { Opportunity } from "@/models/Opportunity";
import { createNotification } from "@/lib/notifications";
import { getStudentApplications } from "@/lib/applications";

// Student applies to an opportunity.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (session.user.role !== "student") {
    return NextResponse.json(
      { error: "Only students can apply." },
      { status: 403 }
    );
  }

  try {
    const { opportunityId, coverNote } = (await req.json()) ?? {};
    if (!opportunityId) {
      return NextResponse.json(
        { error: "opportunityId is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found." },
        { status: 404 }
      );
    }
    if (opportunity.status !== "open") {
      return NextResponse.json(
        { error: "This opportunity is no longer open." },
        { status: 409 }
      );
    }

    let application;
    try {
      application = await Application.create({
        studentId: session.user.id,
        opportunityId,
        coverNote: coverNote ?? "",
        status: "pending",
      });
    } catch (err: unknown) {
      // Duplicate (studentId + opportunityId) unique index.
      if (
        typeof err === "object" &&
        err !== null &&
        (err as { code?: number }).code === 11000
      ) {
        return NextResponse.json(
          { error: "You have already applied to this opportunity." },
          { status: 409 }
        );
      }
      throw err;
    }

    // Notify the company that posted it.
    await createNotification({
      userId: String(opportunity.companyId),
      type: "application",
      message: `${session.user.name ?? "A student"} applied to "${opportunity.title}".`,
      link: `/company/opportunities/${opportunity._id}/applicants`,
    });

    return NextResponse.json(
      { id: application._id.toString(), status: application.status },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/applications error:", err);
    return NextResponse.json(
      { error: "Failed to submit application." },
      { status: 500 }
    );
  }
}

// Student lists their own applications.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const items = await getStudentApplications(session.user.id);
  return NextResponse.json({ items });
}
