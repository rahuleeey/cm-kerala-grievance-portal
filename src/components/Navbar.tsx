"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, FileText, Search, LayoutDashboard } from "lucide-react";

export default function Navbar({ user: initialUser }: { user?: { name: string; role: string } | null }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(initialUser || null);

  useEffect(() => {
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : { user: null }))
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "LOGOUT" }),
    });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-emerald-950 text-white border-b-4 border-amber-500 shadow-md">
      <div className="bg-emerald-900 text-xs py-1.5 px-6 flex justify-between items-center text-emerald-100">
        <span>Government of Kerala | കേരള സർക്കാർ</span>
        <span>CMO Public Grievance Redressal Cell • Toll-Free: 1076</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-amber-500 text-emerald-950 p-2 rounded-lg font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">CM&apos;s Public Grievance Portal</h1>
            <p className="text-xs text-emerald-300">Chief Minister&apos;s Office • Thiruvananthapuram</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-amber-400 transition">Home</Link>
          <Link href="/track" className="hover:text-amber-400 transition flex items-center gap-1">
            <Search className="w-4 h-4" /> Track Status
          </Link>
          <Link href="/citizen/submit" className="hover:text-amber-400 transition flex items-center gap-1">
            <FileText className="w-4 h-4" /> Lodge Grievance
          </Link>

          {!user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 rounded text-xs">
                Login
              </Link>
              <Link href="/register" className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-semibold px-3 py-1.5 rounded text-xs">
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <span className="text-xs text-emerald-200 hidden sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <Link
                href={user.role === "CMO_ADMIN" ? "/cmo" : user.role === "OFFICER" ? "/officer" : "/citizen/submit"}
                className="bg-amber-500 text-emerald-950 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {user.role === "CMO_ADMIN" ? "CMO Command" : user.role === "OFFICER" ? "Dept Portal" : "My Portal"}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-700 hover:bg-red-600 px-2.5 py-1.5 rounded text-xs flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}