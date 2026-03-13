export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <h1 className="text-5xl font-bold tracking-tight">GovernanceHub</h1>
        <p className="text-xl text-slate-500 font-medium">Governance tools and development workflows</p>
        <p className="max-w-xl text-slate-600 leading-relaxed">
          A centralized platform for managing governance processes, tracking audits,
          and maintaining visibility across your development lifecycle.
        </p>
        <div className="flex gap-4 mt-2">
          <a
            href="/governance"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            View Governance
          </a>
          <a
            href="/docs"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Documentation
          </a>
        </div>
      </section>

      {/* Info Section */}
      <section className="flex flex-col items-center px-6 py-16 bg-slate-50">
        <div className="max-w-2xl w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center">What GovernanceHub manages</h2>
          <p className="text-slate-600 text-center leading-relaxed mb-8">
            GovernanceHub brings structure to complex development environments by consolidating
            the tools and records your team needs in one place.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Governance Workflows", desc: "Define and enforce policies across your organization." },
              { label: "Audits", desc: "Track and review compliance and quality audits." },
              { label: "Execution Logs", desc: "Maintain a full history of process executions." },
              { label: "Development Processes", desc: "Align engineering workflows with governance standards." },
            ].map(({ label, desc }) => (
              <li key={label} className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="font-semibold text-slate-800 mb-1">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
