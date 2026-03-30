import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { trackingCode: code },
    include: {
      department: { select: { name: true, code: true } },
      history: {
        orderBy: { createdAt: "asc" },
        select: {
          status: true,
          publicMessage: true,
          createdAt: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    report: {
      trackingCode: report.trackingCode,
      title: report.title,
      status: report.status,
      category: report.category,
      urgency: report.urgency,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      department: report.department,
      photoPath: report.photoPath,
      address: report.address,
      history: report.history.map((h) => ({
        status: h.status,
        message: h.publicMessage,
        at: h.createdAt,
      })),
    },
  });
}
