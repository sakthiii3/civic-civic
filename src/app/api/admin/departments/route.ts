import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  const { staff } = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ departments });
}
