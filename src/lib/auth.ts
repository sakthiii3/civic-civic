import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "civic_admin";

function getSecret() {
  const s = process.env.AUTH_SECRET || "civic_management_secure_fallback_secret_32chars";
  return new TextEncoder().encode(s);
}

export type StaffSession = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

export async function signStaffToken(payload: StaffSession): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyStaffToken(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const name = typeof payload.name === "string" ? payload.name : "";
    const role = typeof payload.role === "string" ? payload.role : "STAFF";
    if (!sub || !email) return null;
    return { sub, email, name, role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  return verifyStaffToken(raw);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireStaff() {
  const session = await getSession();
  if (!session) return { session: null, staff: null };

  const staff = await prisma.staffUser.findUnique({
    where: { id: session.sub },
    include: { department: true },
  });
  if (!staff) return { session: null, staff: null };

  return { session, staff };
}
