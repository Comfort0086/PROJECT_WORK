import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/notifications";

// Current user's notifications + unread count.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const data = await getNotifications(session.user.id);
  return NextResponse.json(data);
}

// Mark one ({ id }) or all ({ all: true }) notifications read.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id, all } = (await req.json()) ?? {};
  await markNotificationsRead(session.user.id, { id, all });
  return NextResponse.json({ ok: true });
}
