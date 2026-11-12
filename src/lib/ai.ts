import Groq from "groq-sdk";

export interface AIAnalysisResult {
  department: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
  isAiGenerated: boolean;
  duplicateWarning?: string | null;
}

export async function analyzeComplaintWithAI(subject: string, description: string): Promise<AIAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.startsWith("gsk_your")) {
    return fallbackAnalysis(subject, description);
  }

  try {
    const groq = new Groq({ apiKey });

    const systemPrompt = `
You are the Chief Minister's Public Grievance AI Redressal Assistant for the Government of Kerala.
Analyze the citizen's complaint and output a strictly valid JSON response.
Allowed Departments:
- Public Works Department (PWD)
- Health & Family Welfare
- Revenue & Land Records
- Local Self Government (LSGD)

Allowed Priorities:
- HIGH (Immediate danger to life, medical emergencies, severe infrastructure collapse)
- MEDIUM (Public inconvenience, delayed civic services, road repairs)
- LOW (General enquiries, non-urgent administrative suggestions)

JSON Structure to return:
{
  "department": "Department Name",
  "category": "Short Category (e.g., Road Safety, Waste Management, Hospital Services, Land Registry)",
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "summary": "Clear 1-2 sentence executive briefing for the CMO administrator.",
  "duplicateWarning": "If this appears to be a generic/frequent road or waste issue, provide a brief note, else null"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Subject: ${subject}\nDescription: ${description}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      department: parsed.department || "Local Self Government (LSGD)",
      category: parsed.category || "General Grievance",
      priority: ["LOW", "MEDIUM", "HIGH"].includes(parsed.priority) ? parsed.priority : "MEDIUM",
      summary: parsed.summary || subject,
      isAiGenerated: true,
      duplicateWarning: parsed.duplicateWarning || null
    };
  } catch (error) {
    console.error("AI Assistant API error, applying safe fallback:", error);
    return fallbackAnalysis(subject, description);
  }
}

function fallbackAnalysis(subject: string, description: string): AIAnalysisResult {
  const content = `${subject} ${description}`.toLowerCase();

  let department = "Local Self Government (LSGD)";
  let category = "Civic Services";
  let priority: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";

  if (content.includes("road") || content.includes("pothole") || content.includes("bridge") || content.includes("tarring")) {
    department = "Public Works Department (PWD)";
    category = "Roads & Infrastructure";
    priority = content.includes("accident") || content.includes("danger") ? "HIGH" : "MEDIUM";
  } else if (content.includes("hospital") || content.includes("doctor") || content.includes("medicine") || content.includes("health")) {
    department = "Health & Family Welfare";
    category = "Medical Facilities";
    priority = "HIGH";
  } else if (content.includes("land") || content.includes("pattayam") || content.includes("survey") || content.includes("tax")) {
    department = "Revenue & Land Records";
    category = "Land & Title Records";
    priority = "LOW";
  }

  return {
    department,
    category,
    priority,
    summary: `[Fallback Heuristic Summary]: Grievance concerning ${subject.slice(0, 60)}...`,
    isAiGenerated: false,
    duplicateWarning: "AI API was unreachable; classified via heuristic fallback."
  };
}