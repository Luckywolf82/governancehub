import { useState } from "react";
import { RefreshCw, Info } from "lucide-react";

// Minimal build marker — update this constant when a new build is deployed.
// No backend calls; this is a UI-only integrity signal.
const BUILD_MARKER = "2026-03-16";

export default function BuildIntegrityBanner() {
  const [loadedAt] = useState(() => new Date().toLocaleTimeString("nb-NO"));

  return (
    <div className="flex items-center justify-between gap-3 bg-slate-100 border border-slate-200 rounded px-3 py-2 text-xs text-slate-600 flex-wrap">
      <div className="flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          <span className="font-medium text-slate-700">Runtime build:</span>{" "}
          <span className="font-mono">{BUILD_MARKER}</span>
        </span>
        <span className="text-slate-400">·</span>
        <span>
          Lastet inn:{" "}
          <span className="font-mono">{loadedAt}</span>
        </span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500">
          Republiser og last på nytt hvis runtime virker utdatert.
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        Last app på nytt
      </button>
    </div>
  );
}
