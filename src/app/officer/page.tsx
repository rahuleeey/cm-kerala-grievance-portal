"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Wrench, CheckCircle2 } from "lucide-react";

export default function OfficerPortalPage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, string>>({});

  const loadAssigned = async () => {
    const res = await fetch("/api/grievances");
    if (res.ok) {
      const data = await res.json();
      setGrievances(data.grievances || []);
    }
  };

  useEffect(() => {
    loadAssigned();
  }, []);

  const handleResolve = async (id: string) => {
    const atr = reports[id];
    if (!atr?.trim()) return alert("Please enter an Action-Taken Report before marking resolved.");

    await fetch("/api/grievances", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: "RESOLVED",
        officerReport: atr,
      }),
    });
    loadAssigned();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-emerald-800" /> Department Officer Redressal Desk
          </h1>
          <p className="text-xs text-slate-500">
            View grievances assigned to your department by the CMO and file official Action-Taken Reports (ATR).
          </p>
        </div>

        {grievances.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-sm text-slate-500">
            No grievances assigned to your department (log in as <span className="font-mono font-bold">pwd.officer@kerala.gov.in</span>).
          </div>
        ) : (
          grievances.map((g) => (
            <div key={g.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded">
                    {g.trackingId}
                  </span>
                  <h2 className="font-bold text-lg text-slate-900 mt-1">{g.subject}</h2>
                  <p className="text-xs text-slate-600 mt-1">{g.description}</p>
                  {g.cmoRemarks && (
                    <div className="mt-2 text-xs bg-amber-50 border border-amber-200 p-2.5 rounded text-amber-950">
                      <strong>CMO Directive:</strong> {g.cmoRemarks}
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100">{g.status}</span>
              </div>

              {g.status !== "RESOLVED" ? (
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    File Official Action-Taken Report (ATR)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe field inspection findings, work completed, or resolution details..."
                    value={reports[g.id] ?? ""}
                    onChange={(e) => setReports({ ...reports, [g.id]: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                  />
                  <button
                    onClick={() => handleResolve(g.id)}
                    className="bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Submit ATR &amp; Mark Resolved
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-950">
                  <strong>Filed ATR:</strong> {g.officerReport}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}