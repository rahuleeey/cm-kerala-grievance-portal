import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, resolved, inProgress, submitted, departments, grievances] = await Promise.all([
      prisma.grievance.count(),
      prisma.grievance.count({ where: { status: "RESOLVED" } }),
      prisma.grievance.count({ where: { status: "IN_PROGRESS" } }),
      prisma.grievance.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.department.findMany({
        include: { _count: { select: { grievances: true } } },
      }),
      prisma.grievance.findMany({
        select: { district: true, status: true, priority: true },
      }),
    ]);

    const districtCounts: Record<string, number> = {};
    grievances.forEach((g) => {
      districtCounts[g.district] = (districtCounts[g.district] || 0) + 1;
    });

    const districtData = Object.entries(districtCounts).map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      summary: { total, resolved, inProgress, pending: submitted },
      departments,
      districtData,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}