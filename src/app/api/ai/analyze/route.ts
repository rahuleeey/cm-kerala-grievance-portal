import { NextResponse } from "next/server";
import { analyzeComplaintWithAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { subject, description } = await req.json();
    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    const analysis = await analyzeComplaintWithAI(subject || "", description);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze grievance" }, { status: 500 });
  }
}