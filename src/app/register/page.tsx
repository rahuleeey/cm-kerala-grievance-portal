"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REGISTER", name, email, mobile, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/citizen/submit");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Citizen Registration</h1>
            <p className="text-xs text-slate-500 mt-1">Create an account to submit and track grievances</p>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2 text-sm border-slate-300" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg p-2 text-sm border-slate-300" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full border rounded-lg p-2 text-sm border-slate-300" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg p-2 text-sm border-slate-300" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-sm">
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600">
            Already registered? <Link href="/login" className="text-emerald-800 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}