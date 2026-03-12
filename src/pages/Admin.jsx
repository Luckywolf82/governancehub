import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Admin() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Admin</h1>
        <p className="text-slate-500">Admin panel placeholder — wire governance components here after GitHub sync.</p>
      </div>
    </div>
  );
}