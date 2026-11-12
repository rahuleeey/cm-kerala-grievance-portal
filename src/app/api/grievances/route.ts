import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { analyzeComplaintWithAI } from "@/lib/ai";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get("trackingId");
    const status = searchParams.get("status");
    const district = searchParams.get("district");
    const priority = searchParams.get("priority");

    // Public Tracking Endpoint (Safe view without sensitive PII)
    if (trackingId) {
      const grievance = await prisma.grievance.findUnique({
        where: { trackingId: trackingId.toUpperCase() },
        include: {
          department: true,
          history: {
            include: { actionBy: { select: { name: true, role: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (!grievance) return NextResponse.json({ error: "Tracking ID not found" }, { status: 404 });
      return NextResponse.json({ grievance });
    }

    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Role-Based Data Filtering
    const whereClause: any = {};
    if (session.role === "CITIZEN") {
      whereClause.citizenId = session.userId;
    } else if (session.role === "OFFICER") {
      whereClause.departmentId = session.departmentId;
    }

    if (status && status !== "ALL") whereClause.status = status;
    if (district && district !== "ALL") whereClause.district = district;
    if (priority && priority !== "ALL") whereClause.priority = priority;

    const grievances = await prisma.grievance.findMany({
      where: whereClause,
      include: {
        citizen: { select: { name: true, email: true, mobile: true } },
        department: true,
        history: {
          include: { actionBy: { select: { name: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ grievances });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch grievances" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Please log in to submit a grievance" }, { status: 401 });

    const body = await req.json();
    const { district, category, subject, description, attachmentUrl } = body;

    // Run AI Classification
    const aiResult = await analyzeComplaintWithAI(subject, description);

    // Match AI-suggested department in DB
    const dept = await prisma.department.findFirst({
      where: { name: { contains: aiResult.department.split(" ")[0] } },
    });

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `KL-2026-${dept?.code || "GEN"}-${randomCode}`;

    const grievance = await prisma.grievance.create({
      data: {
        trackingId,
        citizenId: session.userId,
        district,
        category: category || aiResult.category,
        subject,
        description,
        attachmentUrl,
        priority: aiResult.priority,
        status: "SUBMITTED",
        departmentId: dept?.id || null,
        aiSummary: aiResult.summary,
        aiSuggestedDept: aiResult.department,
        aiSuggestedPriority: aiResult.priority,
        history: {
          create: {
            actionById: session.userId,
            fromStatus: "SUBMITTED",
            toStatus: "SUBMITTED",
            remarks: "Grievance submitted by citizen via Kerala CMO Portal.",
          },
        },
      },
    });

    return NextResponse.json({ grievance, aiResult }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create grievance" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, status, priority, departmentId, cmoRemarks, officerReport, feedbackRating, feedbackText } = body;

    const existing = await prisma.grievance.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Grievance not found" }, { status: 404 });

    const nextStatus = status || existing.status;

    const updated = await prisma.grievance.update({
      where: { id },
      data: {
        status: nextStatus,
        priority: priority || existing.priority,
        departmentId: departmentId !== undefined ? departmentId : existing.departmentId,
        cmoRemarks: cmoRemarks !== undefined ? cmoRemarks : existing.cmoRemarks,
        officerReport: officerReport !== undefined ? officerReport : existing.officerReport,
        feedbackRating: feedbackRating !== undefined ? feedbackRating : existing.feedbackRating,
        feedbackText: feedbackText !== undefined ? feedbackText : existing.feedbackText,
        history: {
          create: {
            actionById: session.userId,
            fromStatus: existing.status,
            toStatus: nextStatus,
            remarks: cmoRemarks || officerReport || feedbackText || `Status updated to ${nextStatus}`,
          },
        },
      },
    });

    return NextResponse.json({ grievance: updated });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}