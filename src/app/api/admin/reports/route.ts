import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import type { IssueCategory, ReportStatus } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  const { staff } = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ReportStatus | null;
  const category = searchParams.get("category") as IssueCategory | null;
  const dept = searchParams.get("departmentId");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.ReportWhereInput = {};

  if (status) where.status = status;
  if (category) where.category = category;
  if (dept) where.departmentId = dept;

  if (staff.role === "STAFF" && staff.departmentId) {
    where.departmentId = staff.departmentId;
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { trackingCode: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      department: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({ reports });
}
