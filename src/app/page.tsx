import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowRight, CheckCircle2, Clock, FileCheck2, ShieldAlert } from "lucide-react";

// export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const [total, resolved, inProgress] = await Promise.all([
    prisma.grievance.count(),
    prisma.grievance.count({ where: { status: "RESOLVED" } }),
    prisma.grievance.count({ where: { status: { in: ["IN_PROGRESS", "UNDER_REVIEW"] } } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar user={session} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              AI-Powered Citizen Governance • Kerala
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              Direct Redressal from the <span className="text-amber-400">Chief Minister&apos;s Office</span>
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
              Submit public grievances, infrastructure complaints, or welfare requests directly to the CMO.
              Our AI Grievance Assistant automatically categorizes priority and routes your petition to the concerned Kerala Government Department.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/citizen/submit"
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-6 py-3.5 rounded-lg shadow-lg flex items-center gap-2 transition"
              >
                Lodge a Grievance <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/track"
                className="bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600 text-white font-semibold px-6 py-3.5 rounded-lg transition"
              >
                Track Existing Complaint
              </Link>
            </div>
          </div>

          {/* Live Portal Metrics */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
              Live State Redressal Statistics
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700">
                <FileCheck2 className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <div className="text-2xl sm:text-3xl font-extrabold">{total}</div>
                <div className="text-xs text-emerald-200 mt-1">Total Lodged</div>
              </div>
              <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700">
                <Clock className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                <div className="text-2xl sm:text-3xl font-extrabold">{inProgress}</div>
                <div className="text-xs text-emerald-200 mt-1">Under Action</div>
              </div>
              <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <div className="text-2xl sm:text-3xl font-extrabold">{resolved}</div>
                <div className="text-xs text-emerald-200 mt-1">Resolved</div>
              </div>
            </div>
            <div className="text-xs text-emerald-200 bg-emerald-950/50 p-3 rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Demo Seeded Tracking ID ready to test: <strong className="text-white font-mono">KL-2026-PWD-001</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-10">How Redressal Works</h2>
        <div className="grid sm:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Submit & AI Triage", desc: "Describe your issue. AI immediately detects urgency & the right department." },
            { step: "02", title: "CMO Verification", desc: "Chief Minister's Office reviews priority and forwards with official directives." },
            { step: "03", title: "Department Action", desc: "Concerned Executive Engineer / District Officer conducts field resolution." },
            { step: "04", title: "Citizen Feedback", desc: "Verify the Action-Taken Report (ATR) and rate satisfaction or reopen." },
          ].map((item) => (
            <div key={item.step} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                STEP {item.step}
              </span>
              <h3 className="font-bold text-lg mt-3 text-slate-800">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}