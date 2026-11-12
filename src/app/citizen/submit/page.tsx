"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Sparkles, Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

export default function CitizenSubmitPage() {
  const [district, setDistrict] = useState("Kozhikode");
  const [category, setCategory] = useState("Roads & Infrastructure");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedGrievance, setSubmittedGrievance] = useState<any>(null);
  const [myGrievances, setMyGrievances] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/grievances")
      .then((res) => (res.ok ? res.json() : { grievances: [] }))
      .then((data) => setMyGrievances(data.grievances || []));
  }, [submittedGrievance]);

  const handleAnalyzeWithAI = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description }),
      });
      const data = await res.json();
      setAiPreview(data);
      if (data.category) setCategory(data.category);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, category, subject, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Please log in as a citizen first.");
      } else {
        setSubmittedGrievance(data.grievance);
        setSubject("");
        setDescription("");
        setAiPreview(null);
      }
    } catch {
      setError("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async (id: string, rating: number, reopen: boolean) => {
    await fetch("/api/grievances", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: reopen ? "REOPENED" : "RESOLVED",
        feedbackRating: rating,
        feedbackText: reopen ? "Citizen requested reopening due to unsatisfactory resolution." : `Citizen rated resolution ${rating}/5 stars.`,
      }),
    });
    const res = await fetch("/api/grievances");
    const data = await res.json();
    setMyGrievances(data.grievances || []);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 grid lg:grid-cols-5 gap-8">
        {/* Submission Form */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Lodge a Public Grievance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Use the AI Assistant button before submitting to preview automated department routing and urgency classification.
          </p>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error} — <a href="/login" className="underline font-bold">Login here</a>
            </div>
          )}

          {submittedGrievance && (
            <div className="mt-4 bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-5 h-5" /> Grievance Registered Successfully!
              </div>
              <p className="text-sm mt-1">
                Your Official Tracking ID: <strong className="font-mono bg-white px-2 py-0.5 rounded border">{submittedGrievance.trackingId}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                >
                  {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject / Title</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Broken drainage and waterlogging near Kozhikode Beach Road"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide exact location, landmark, duration of issue, and public impact..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                required
              />
            </div>

            {/* AI Pre-Check Box */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" /> AI Grievance Triage Assistant
                </span>
                <button
                  type="button"
                  onClick={handleAnalyzeWithAI}
                  disabled={analyzing || !description}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {analyzing ? "Analyzing..." : "Analyze with AI"}
                </button>
              </div>

              {aiPreview && (
                <div className="mt-3 text-xs space-y-1.5 border-t border-amber-200 pt-3 text-slate-800">
                  <div><strong>Suggested Department:</strong> {aiPreview.department}</div>
                  <div><strong>Detected Priority:</strong> <span className="font-bold text-red-700">{aiPreview.priority}</span></div>
                  <div><strong>Executive Summary:</strong> {aiPreview.summary}</div>
                  {aiPreview.duplicateWarning && (
                    <div className="text-amber-800 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {aiPreview.duplicateWarning}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting to CMO..." : "Submit Grievance to Chief Minister's Office"}
            </button>
          </form>
        </div>

        {/* Citizen's Personal History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">My Submitted Grievances</h2>
          {myGrievances.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs text-slate-500">
              No grievances found for your account yet (or log in as <span className="font-mono">citizen@kerala.gov.in</span>).
            </div>
          ) : (
            myGrievances.map((g) => (
              <div key={g.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-emerald-900">{g.trackingId}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100">{g.status}</span>
                </div>
                <h3 className="font-semibold text-sm text-slate-800">{g.subject}</h3>
                <p className="text-xs text-slate-500">{g.department?.name || "Pending Assignment"}</p>

                {g.status === "RESOLVED" && !g.feedbackRating && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Satisfied?</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleFeedback(g.id, 5, false)}
                        className="bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2 py-1 rounded"
                      >
                        Rate 5★
                      </button>
                      <button
                        onClick={() => handleFeedback(g.id, 1, true)}
                        className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-1 rounded"
                      >
                        Reopen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}