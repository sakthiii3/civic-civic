import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  const { staff } = await requireStaff();
  if (!staff || staff.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [total, byStatus, byCategory, recentResolved] = await Promise.all([
    prisma.report.count(),
    prisma.report.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
    prisma.report.findMany({
      where: { status: "RESOLVED" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        trackingCode: true,
        title: true,
        updatedAt: true,
        createdAt: true,
        department: { select: { name: true } },
      },
    }),
  ]);

  const resolutionSamples = recentResolved.map((r: any) => {
    const ms = r.updatedAt.getTime() - r.createdAt.getTime();
    const hours = Math.round(ms / 36e5);
    return {
      code: r.trackingCode,
      title: r.title,
      dept: r.department.name,
      resolutionHours: hours,
    };
  });

  return NextResponse.json({
    total,
    byStatus: Object.fromEntries(
      byStatus.map((b: any) => [b.status, b._count._all]),
    ),
    byCategory: Object.fromEntries(
      byCategory.map((b: any) => [b.category, b._count._all]),
    ),
    recentResolved: resolutionSamples,
  });
}
