import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { departmentCodeForCategory } from "@/lib/routing";
import { createTrackingCode } from "@/lib/tracking";
import { IssueCategory, ReportStatus, Urgency } from "@/lib/types";

const categoryZ = z.enum([
  "POTHOLE",
  "STREETLIGHT",
  "TRASH",
  "WATER_LEAK",
  "PARK_MAINTENANCE",
  "OTHER",
]);
const urgencyZ = z.enum(["LOW", "MEDIUM", "HIGH"]);

const bodySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(4000),
  category: categoryZ,
  urgency: urgencyZ,
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  address: z.string().max(500).optional(),
  citizenName: z.string().max(120).optional(),
  citizenPhone: z.string().max(32).optional(),
  citizenEmail: z.string().email().optional().or(z.literal("")),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category") as IssueCategory | null;

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;
  if (category) where.category = category;

  const rows = await prisma.report.findMany({
    where,
    select: {
      id: true,
      trackingCode: true,
      title: true,
      category: true,
      urgency: true,
      status: true,
      lat: true,
      lng: true,
      address: true,
      createdAt: true,
      department: { select: { name: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ reports: rows });
}

async function saveUpload(file: File | null, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 6 * 1024 * 1024) {
    throw new Error("File too large (max 6MB)");
  }
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const ext = path.extname(file.name) || (prefix === "img" ? ".jpg" : ".webm");
  const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const full = path.join(uploadsDir, name);
  await writeFile(full, buf);
  return `/uploads/${name}`;
}

export async function POST(request: Request) {
  try {
    const ct = request.headers.get("content-type") || "";
    let raw: z.infer<typeof bodySchema>;
    let photo: File | null = null;
    let voice: File | null = null;

    if (ct.includes("multipart/form-data")) {
      const form = await request.formData();
      raw = {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        category: String(form.get("category") ?? "") as IssueCategory,
        urgency: String(form.get("urgency") ?? "MEDIUM") as Urgency,
        lat: Number(form.get("lat")),
        lng: Number(form.get("lng")),
        address: form.get("address") ? String(form.get("address")) : undefined,
        citizenName: form.get("citizenName")
          ? String(form.get("citizenName"))
          : undefined,
        citizenPhone: form.get("citizenPhone")
          ? String(form.get("citizenPhone"))
          : undefined,
        citizenEmail: form.get("citizenEmail")
          ? String(form.get("citizenEmail"))
          : undefined,
      };
      const p = form.get("photo");
      const v = form.get("voice");
      if (p instanceof File) photo = p;
      if (v instanceof File) voice = v;
    } else {
      const json = await request.json();
      raw = json;
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const deptCode = departmentCodeForCategory(data.category as IssueCategory);
    const department = await prisma.department.findUnique({
      where: { code: deptCode },
    });
    if (!department) {
      return NextResponse.json(
        { error: "Routing error: department not found" },
        { status: 500 },
      );
    }

    let photoPath: string | null = null;
    let voicePath: string | null = null;
    try {
      photoPath = await saveUpload(photo, "img");
      voicePath = await saveUpload(voice, "audio");
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Upload failed" },
        { status: 400 },
      );
    }

    let trackingCode = createTrackingCode();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.report.findUnique({
        where: { trackingCode },
        select: { id: true },
      });
      if (!exists) break;
      trackingCode = createTrackingCode();
    }

    const email =
      data.citizenEmail && data.citizenEmail.length > 0
        ? data.citizenEmail
        : undefined;

    const report = await prisma.report.create({
      data: {
        trackingCode,
        title: data.title,
        description: data.description,
        category: data.category as IssueCategory,
        urgency: data.urgency as Urgency,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        citizenName: data.citizenName,
        citizenPhone: data.citizenPhone,
        citizenEmail: email,
        departmentId: department.id,
        photoPath: photoPath ?? undefined,
        voiceNotePath: voicePath ?? undefined,
      },
    });

    await prisma.reportStatusHistory.create({
      data: {
        reportId: report.id,
        status: ReportStatus.SUBMITTED,
        publicMessage:
          "We received your report. Reference: " + trackingCode + ".",
      },
    });

    return NextResponse.json({
      ok: true,
      trackingCode: report.trackingCode,
      id: report.id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
