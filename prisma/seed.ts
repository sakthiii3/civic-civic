import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  IssueCategory,
  ReportStatus,
  Urgency,
  StaffRole,
} from "../src/lib/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.reportStatusHistory.deleteMany();
  await prisma.report.deleteMany();
  await prisma.staffUser.deleteMany();
  await prisma.department.deleteMany();

  const depts = await prisma.$transaction([
    prisma.department.create({
      data: { name: "Public Works", code: "PW" },
    }),
    prisma.department.create({
      data: { name: "Power & Street Lighting", code: "PWR" },
    }),
    prisma.department.create({
      data: { name: "Sanitation & Waste", code: "SAN" },
    }),
    prisma.department.create({
      data: { name: "Parks & Urban Green", code: "PARK" },
    }),
  ]);

  const [pw, pwr, san, park] = depts;

  const hash = await bcrypt.hash("admin123", 10);
  await prisma.staffUser.create({
    data: {
      email: "admin@jharkhand.gov.in",
      passwordHash: hash,
      name: "System Administrator",
      role: StaffRole.ADMIN,
      departmentId: pw.id,
    },
  });

  await prisma.staffUser.create({
    data: {
      email: "sanitation@jharkhand.gov.in",
      passwordHash: await bcrypt.hash("staff123", 10),
      name: "Sanitation Desk",
      role: StaffRole.STAFF,
      departmentId: san.id,
    },
  });

  // Sample reports near Ranchi for demo map
  const samples = [
    {
      trackingCode: "JHR-DEMO01",
      title: "Pothole on main road",
      description: "Deep pothole causing traffic slowdown near circle.",
      category: IssueCategory.POTHOLE,
      urgency: Urgency.HIGH,
      status: ReportStatus.SUBMITTED,
      lat: 23.3441,
      lng: 85.3096,
      address: "Ranchi, Jharkhand (demo)",
      departmentId: pw.id,
      citizenName: "Demo User",
      citizenPhone: "9876500000",
    },
    {
      trackingCode: "JHR-DEMO02",
      title: "Streetlight not working",
      description: "Pole 12 dark for 3 nights.",
      category: IssueCategory.STREETLIGHT,
      urgency: Urgency.MEDIUM,
      status: ReportStatus.ACKNOWLEDGED,
      lat: 23.3569,
      lng: 85.3352,
      address: "Near Morabadi, Ranchi",
      departmentId: pwr.id,
      citizenName: "A. Kumar",
    },
    {
      trackingCode: "JHR-DEMO03",
      title: "Overflowing dustbins",
      description: "Waste not collected for 2 days.",
      category: IssueCategory.TRASH,
      urgency: Urgency.MEDIUM,
      status: ReportStatus.IN_PROGRESS,
      lat: 23.3164,
      lng: 85.3089,
      address: "Harmu Housing Colony",
      departmentId: san.id,
      citizenName: "S. Devi",
    },
  ];

  for (const s of samples) {
    const r = await prisma.report.create({
      data: {
        ...s,
        description: s.description,
      },
    });
    await prisma.reportStatusHistory.create({
      data: {
        reportId: r.id,
        status: s.status,
        publicMessage: "Your report has been logged in the civic system.",
      },
    });
  }

  const resolved = await prisma.report.create({
    data: {
      trackingCode: "JHR-DEMO04",
      title: "Park bench repair",
      description: "Broken bench replaced — thank you.",
      category: IssueCategory.PARK_MAINTENANCE,
      urgency: Urgency.LOW,
      status: ReportStatus.RESOLVED,
      lat: 23.308,
      lng: 85.32,
      address: "Nakshatra Van vicinity",
      departmentId: park.id,
      citizenName: "R. Singh",
    },
  });
  await prisma.reportStatusHistory.createMany({
    data: [
      {
        reportId: resolved.id,
        status: ReportStatus.SUBMITTED,
        publicMessage: "Received.",
      },
      {
        reportId: resolved.id,
        status: ReportStatus.RESOLVED,
        publicMessage: "Bench repaired on scheduled maintenance day.",
      },
    ],
  });

  console.log("Seed OK. Admin: admin@jharkhand.gov.in / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
