import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Opportunity } from "@/models/Opportunity";
import { getOpportunities } from "@/lib/opportunities";
import { parseOpportunityInput } from "@/lib/opportunityInput";

// Public list endpoint with optional ?q=&industry=&location= filters.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const items = await getOpportunities({
      q: searchParams.get("q") ?? undefined,
      industry: searchParams.get("industry") ?? undefined,
      location: searchParams.get("location") ?? undefined,
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/opportunities error:", err);
    return NextResponse.json(
      { error: "Failed to load opportunities." },
      { status: 500 }
    );
  }
}

// Company creates a new opportunity.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "company") {
    return NextResponse.json(
      { error: "Only companies can post opportunities." },
      { status: 403 }
    );
  }

  try {
    const body = (await req.json()) ?? {};
    const parsed = parseOpportunityInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();
    const { startDate, deadline, ...rest } = parsed.value;
    const created = await Opportunity.create({
      ...rest,
      ...(startDate ? { startDate } : {}),
      ...(deadline ? { deadline } : {}),
      companyId: session.user.id,
      status: parsed.value.status ?? "open",
    });

    return NextResponse.json({ id: created._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("POST /api/opportunities error:", err);
    return NextResponse.json(
      { error: "Failed to create opportunity." },
      { status: 500 }
    );
  }
}
