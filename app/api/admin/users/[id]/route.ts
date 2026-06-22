import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Opportunity } from "@/models/Opportunity";
import { Application } from "@/models/Application";
import { createNotification } from "@/lib/notifications";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

// Verify / unverify a company.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { verified } = (await req.json()) ?? {};
  if (typeof verified !== "boolean") {
    return NextResponse.json(
      { error: "`verified` boolean is required." },
      { status: 400 }
    );
  }

  await connectDB();
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const user = await User.findById(id);
  if (!user || user.role !== "company") {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  user.verified = verified;
  await user.save();

  if (verified) {
    await createNotification({
      userId: String(user._id),
      type: "system",
      message: "Your company account has been verified by an administrator.",
      link: "/company/dashboard",
    });
  }

  return NextResponse.json({ id: String(user._id), verified });
}

// Delete a user and cascade their data.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (user.role === "admin") {
    return NextResponse.json(
      { error: "Admin accounts cannot be deleted here." },
      { status: 400 }
    );
  }

  if (user.role === "company") {
    // Remove the company's opportunities and any applications to them.
    const opps = await Opportunity.find({ companyId: user._id }).select("_id");
    const oppIds = opps.map((o) => o._id);
    await Application.deleteMany({ opportunityId: { $in: oppIds } });
    await Opportunity.deleteMany({ companyId: user._id });
  } else {
    // Student: remove their applications.
    await Application.deleteMany({ studentId: user._id });
  }

  await user.deleteOne();
  return NextResponse.json({ ok: true });
}
