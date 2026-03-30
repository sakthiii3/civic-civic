import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signStaffToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const staff = await prisma.staffUser.findUnique({
    where: { email },
  });
  if (!staff) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, staff.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signStaffToken({
    sub: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
  });

  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    staff: { name: staff.name, email: staff.email, role: staff.role },
  });
}
