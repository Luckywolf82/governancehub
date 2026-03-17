import { useState } from "react";
import { RefreshCw, Info } from "lucide-react";

// Minimal build marker — update this constant when a new build is deployed.
// No backend calls; this is a UI-only integrity signal.
const BUILD_MARKER = "2026-03-16";

export default function BuildIntegrityBanner() {
  const [loadedAt] = useState(() => new Date().toLocaleTimeString("nb-NO"));

  return (
    <div className="flex items-center justify-between gap-3 border border-slate-100 rounded px-3 py-1.5 text-xs text-slate-400 flex-wrap">
      <div className="flex items-center gap-2">
        <Info className="w-3 h-3 text-slate-300 shrink-0" />
        <span>
          <span className="text-slate-500">Runtime build:</span>{" "}
          <span className="font-mono">{BUILD_MARKER}</span>
        </span>
        <span className="text-slate-300">·</span>
        <span>
          Lastet inn:{" "}
          <span className="font-mono">{loadedAt}</span>
        </span>
        <span className="text-slate-300">·</span>
        <span>
          Republiser og last på nytt hvis runtime virker utdatert.
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        Last app på nytt
      </button>
    </div>
  );
}
