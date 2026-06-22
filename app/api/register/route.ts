import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

// Public sign-up. Only "student" and "company" can self-register;
// admins are seeded manually (see scripts/seed later).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, email, password, name } = body ?? {};

    if (!role || !email || !password || !name) {
      return NextResponse.json(
        { error: "role, email, password and name are required." },
        { status: 400 }
      );
    }
    if (role !== "student" && role !== "company") {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      role,
      email: email.toLowerCase(),
      passwordHash,
      name,
      // Companies start unverified until an admin approves them.
      ...(role === "company" ? { verified: false } : {}),
      // Pass-through optional profile fields if provided.
      matricNo: body.matricNo,
      university: body.university,
      department: body.department,
      level: body.level,
      companyWebsite: body.companyWebsite,
      industry: body.industry,
    });

    return NextResponse.json(
      { id: user._id.toString(), role: user.role, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json(
      { error: "Something went wrong creating the account." },
      { status: 500 }
    );
  }
}
