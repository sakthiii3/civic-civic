import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import type { ReportStatus } from "@prisma/client";

const patchSchema = z.object({
  status: z
    .enum([
      "SUBMITTED",
      "ACKNOWLEDGED",
      "IN_PROGRESS",
      "RESOLVED",
      "REJECTED",
    ])
    .optional(),
  departmentId: z.string().optional(),
  publicMessage: z.string().max(2000).optional(),
  internalNote: z.string().max(2000).optional(),
});

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { staff } = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      department: true,
      history: {
        orderBy: { createdAt: "desc" },
        include: { staff: { select: { name: true, email: true } } },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (staff.role === "STAFF" && staff.departmentId !== report.departmentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ report });
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { staff } = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (staff.role === "STAFF" && staff.departmentId !== report.departmentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, departmentId, publicMessage, internalNote } = parsed.data;
  const messages: string[] = [];

  const data: {
    status?: ReportStatus;
    departmentId?: string;
  } = {};

  if (typeof departmentId === "string" && staff.role === "ADMIN") {
    const d = await prisma.department.findUnique({ where: { id: departmentId } });
    if (d) {
      data.departmentId = departmentId;
      messages.push(`Assigned to ${d.name}.`);
    }
  }

  if (status && status !== report.status) {
    data.status = status as ReportStatus;
    if (publicMessage) {
      messages.push(publicMessage);
    }
  }

  const hasReportUpdate =
    Object.keys(data).length > 0 ||
    (status && status !== report.status);

  if (!hasReportUpdate && !internalNote && !publicMessage) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const r =
      Object.keys(data).length > 0
        ? await tx.report.update({
            where: { id },
            data,
            include: { department: true },
          })
        : await tx.report.findUniqueOrThrow({
            where: { id },
            include: { department: true },
          });

    if (status && status !== report.status) {
      await tx.reportStatusHistory.create({
        data: {
          reportId: id,
          status: status as ReportStatus,
          note: internalNote ?? null,
          publicMessage:
            publicMessage ??
            (messages.length ? messages.join(" ") : `Status updated to ${status}.`),
          staffId: staff.id,
        },
      });
    } else if (internalNote || publicMessage) {
      await tx.reportStatusHistory.create({
        data: {
          reportId: id,
          status: report.status,
          note: internalNote ?? null,
          publicMessage: publicMessage ?? null,
          staffId: staff.id,
        },
      });
    }

    return r;
  });

  return NextResponse.json({ report: updated });
}
