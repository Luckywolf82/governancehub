import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6">
        <Link to={createPageUrl("Home")} className="text-sm font-medium text-slate-700 hover:text-slate-900">Home</Link>
        <Link to={createPageUrl("Admin")} className="text-sm font-medium text-slate-500 hover:text-slate-900">Admin</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}