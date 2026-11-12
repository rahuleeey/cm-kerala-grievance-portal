"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LOGIN", email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        setError(`Server error (${res.status}). Check CMD terminal output.`);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      setLoading(false);
      if (data.user.role === "CMO_ADMIN") window.location.href = "/cmo";
      else if (data.user.role === "OFFICER") window.location.href = "/officer";
      else window.location.href = "/citizen/submit";
    } catch {
      setError("Network error while connecting to /api/auth");
      setLoading(false);
    }
  };

  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password@123");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Portal Login</h1>
            <p className="text-xs text-slate-500 mt-1">Sign in as Citizen, CMO Admin, or Department Officer</p>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm border-slate-300" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm border-slate-300" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-sm">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* One-Click Demo Credentials Helper */}
          <div className="border-t border-slate-200 pt-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Demo Test Accounts (Click to Auto-Fill):</span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button type="button" onClick={() => quickFill("citizen@kerala.gov.in")} className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded font-medium text-slate-800">Citizen</button>
              <button type="button" onClick={() => quickFill("cmo@kerala.gov.in")} className="bg-amber-50 hover:bg-amber-100 border border-amber-200 p-1.5 rounded font-medium text-amber-900">CMO Admin</button>
              <button type="button" onClick={() => quickFill("pwd.officer@kerala.gov.in")} className="bg-blue-50 hover:bg-blue-100 border border-blue-200 p-1.5 rounded font-medium text-blue-900">PWD Officer</button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600">
            New citizen? <Link href="/register" className="text-emerald-800 font-bold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}