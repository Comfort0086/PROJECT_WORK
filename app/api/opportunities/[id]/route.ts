import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Opportunity } from "@/models/Opportunity";
import { parseOpportunityInput } from "@/lib/opportunityInput";

async function loadOwned(id: string, companyId: string) {
  await connectDB();
  if (!id.match(/^[0-9a-fA-F]{24}$/)) return { error: "Not found", status: 404 };
  const opp = await Opportunity.findById(id);
  if (!opp) return { error: "Not found", status: 404 };
  if (String(opp.companyId) !== companyId)
    return { error: "Forbidden", status: 403 };
  return { opp };
}

// Company edits / closes an opportunity it owns.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "company") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const owned = await loadOwned(id, session.user.id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const body = (await req.json()) ?? {};
  const parsed = parseOpportunityInput(body, { partial: true });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  Object.assign(owned.opp, parsed.value);
  await owned.opp.save();

  return NextResponse.json({ id: owned.opp._id.toString() });
}

// Company deletes an opportunity it owns.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "company") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const owned = await loadOwned(id, session.user.id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  await owned.opp.deleteOne();
  return NextResponse.json({ ok: true });
}
