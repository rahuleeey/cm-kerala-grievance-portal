"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldCheck, Send, Filter } from "lucide-react";

export default function CMODashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const loadData = async () => {
    const [statsRes, listRes] = await Promise.all([
      fetch("/api/cmo/stats"),
      fetch(`/api/grievances?status=${statusFilter}&priority=${priorityFilter}`),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (listRes.ok) {
      const data = await listRes.json();
      setGrievances(data.grievances || []);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const handleAssign = async (grievanceId: string) => {
    const deptId = selectedDept[grievanceId];
    const cmoNote = remarks[grievanceId] || "Forwarded by CMO for immediate departmental action.";

    await fetch("/api/grievances", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: grievanceId,
        status: "IN_PROGRESS",
        departmentId: deptId,
        cmoRemarks: cmoNote,
      }),
    });
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-800" /> Chief Minister&apos;s Office — Command Dashboard
            </h1>
            <p className="text-xs text-slate-500">Statewide Grievance Monitoring, AI Triage Verification & Departmental Routing</p>
          </div>
        </div>

        {/* KPI Cards + District Analytics */}
        {stats && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 font-semibold">Total Petitions</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.summary.total}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-amber-600 font-semibold">Pending CMO Triage</div>
                <div className="text-3xl font-extrabold text-amber-600 mt-1">{stats.summary.pending}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-sky-600 font-semibold">In Progress</div>
                <div className="text-3xl font-extrabold text-sky-700 mt-1">{stats.summary.inProgress}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs text-emerald-700 font-semibold">Resolved</div>
                <div className="text-3xl font-extrabold text-emerald-700 mt-1">{stats.summary.resolved}</div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h2 className="text-xs font-bold uppercase text-slate-500 mb-3">District-Wise Grievance Volume</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.districtData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#065f46" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-4 h-4" /> Filter Queue:
          </span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs">
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REOPENED">Reopened</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs">
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        {/* Petitions Management Table */}
        <div className="space-y-4">
          {grievances.map((g) => (
            <div key={g.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                      {g.trackingId}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">{g.priority}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{g.status}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-2">{g.subject}</h3>
                  <p className="text-xs text-slate-600 mt-1">{g.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Citizen: {g.citizen?.name} ({g.district}) • AI Suggested: <strong>{g.aiSuggestedDept}</strong>
                  </p>
                </div>

                {/* CMO Routing Controls */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 min-w-[280px]">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Assign / Reassign Department</label>
                  <select
                    value={selectedDept[g.id] ?? g.departmentId ?? ""}
                    onChange={(e) => setSelectedDept({ ...selectedDept, [g.id]: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs bg-white"
                  >
                    <option value="">-- Select Department --</option>
                    {stats?.departments?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add CMO Directive / Remarks..."
                    value={remarks[g.id] ?? ""}
                    onChange={(e) => setRemarks({ ...remarks, [g.id]: e.target.value })}
                    className="w-full border rounded p-1.5 text-xs bg-white"
                  />
                  <button
                    onClick={() => handleAssign(g.id)}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 rounded flex justify-center items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Forward &amp; Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}