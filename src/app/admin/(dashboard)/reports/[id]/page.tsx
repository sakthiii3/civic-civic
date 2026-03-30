import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { AdminReportClient } from "@/components/AdminReportClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminReportPage({ params }: Props) {
  const { staff } = await requireStaff();
  if (!staff) return null;
  const { id } = await params;

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

  if (!report) notFound();
  if (staff.role === "STAFF" && staff.departmentId !== report.departmentId) {
    notFound();
  }

  const departments =
    staff.role === "ADMIN"
      ? await prisma.department.findMany({ orderBy: { name: "asc" } })
      : [];

  return (
    <AdminReportClient
      report={JSON.parse(JSON.stringify(report))}
      departments={departments}
      isAdmin={staff.role === "ADMIN"}
    />
  );
}
