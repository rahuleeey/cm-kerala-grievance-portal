"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, CheckCircle, Clock, Building2, Sparkles } from "lucide-react";

export default function TrackGrievancePage() {
  const [trackingId, setTrackingId] = useState("KL-2026-PWD-001");
  const [grievance, setGrievance] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setError("");
    setGrievance(null);

    try {
      const res = await fetch(`/api/grievances?trackingId=${encodeURIComponent(trackingId.trim())}`);
      const data = await res.json();
      if (!res.ok) setError(data.error || "Not found");
      else setGrievance(data.grievance);
    } catch {
      setError("Network error while tracking grievance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Track Public Grievance Status</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your official CMO Tracking ID (e.g., <span className="font-mono font-semibold text-emerald-800">KL-2026-PWD-001</span>) to inspect real-time action history.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-3">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. KL-2026-PWD-001)"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-900 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Track"}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {grievance && (
            <div className="mt-8 border-t border-slate-200 pt-6 space-y-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-bold">
                    {grievance.trackingId}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{grievance.subject}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    District: <strong>{grievance.district}</strong> • Category: <strong>{grievance.category}</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    grievance.priority === "HIGH" ? "bg-red-100 text-red-800" :
                    grievance.priority === "MEDIUM" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {grievance.priority} PRIORITY
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                    {grievance.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">Assigned Department</div>
                    <div className="font-semibold text-slate-800">{grievance.department?.name || "Awaiting CMO Assignment"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">AI Executive Summary</div>
                    <div className="text-slate-700 text-xs mt-0.5">{grievance.aiSummary || "N/A"}</div>
                  </div>
                </div>
              </div>

              {grievance.officerReport && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <h3 className="text-xs font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Official Department Action-Taken Report (ATR)
                  </h3>
                  <p className="text-sm text-emerald-950 mt-1">{grievance.officerReport}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" /> Official Audit Timeline
                </h3>
                <div className="space-y-3 border-l-2 border-emerald-700 pl-4 ml-2">
                  {grievance.history?.map((h: any) => (
                    <div key={h.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-emerald-900">{h.toStatus.replace("_", " ")}</span>
                        <span className="text-slate-400">{new Date(h.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{h.remarks}</p>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Updated by: {h.actionBy?.name} ({h.actionBy?.role})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}