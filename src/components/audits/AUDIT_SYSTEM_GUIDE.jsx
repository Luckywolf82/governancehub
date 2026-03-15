export const AUDIT_SYSTEM_GUIDE = `
AUDIT SYSTEM GUIDE — GOVERNANCEHUB

PURPOSE
Audits are used to diagnose repository or system state before structural changes are implemented.

Audits are analysis documents, not implementation tasks.

They ensure that architecture changes are based on verified repository state rather than assumptions.

---

WHEN AUDITS ARE REQUIRED

Audits must be used when:

- architecture is unclear
- routing appears broken
- governance drift is suspected
- multiple cleanup paths exist
- repository state must be verified before implementation
- structural changes are being considered

---

AUDIT STRUCTURE

Each audit should include the following sections:

AUDIT TITLE  
TYPE  
PROBLEM  
IMPACT  
AFFECTED FILES  
REQUIRED CHANGE  
CONSTRAINTS  
ACCEPTANCE CRITERIA  

This structure ensures audits remain consistent and actionable.

---

PROJECT REFERENCE

GovernanceHub manages multiple projects.

Every audit must reference a project.

Audits should include:

projectId  
projectSlug  

Audits without a project reference are considered incomplete.

---

AUDITS VS TASKS

Audits diagnose system state.

Tasks implement changes derived from audits.

Execution logs record the actual implementation of tasks.

This separation prevents structural changes from occurring without analysis.

---

EVIDENCE RULE

Audits must clearly state their evidence basis.

Valid evidence sources include:

- repository file inspection
- commit history
- pull request diffs
- runtime behavior observations

Assumptions or prior chat context must not be treated as verified evidence.

---

OUTPUT REQUIREMENT

Every audit must conclude with:

- one safe next step

This ensures the development loop remains controlled and incremental.

---

CANONICAL AUDIT OBJECT MODEL

All new audits should follow the canonical two-key structure below.

The model defines two top-level keys:

  meta     — identity and classification fields
  finding  — substantive audit content

---

META FIELDS

  id              — unique audit identifier (e.g. "gov-005")
  title           — short human-readable audit title
  category        — top-level category (e.g. "Governance", "Architecture", "Product")
  type            — specific audit type (e.g. "Schema Drift Audit", "Lifecycle Gap Audit")
  status          — controlled vocabulary: "verified" | "orphaned" | "planned"
  date            — ISO 8601 date string (e.g. "2026-03-15"), or null if not yet executed
  projectId       — machine-readable project identifier (e.g. "governancehub")
  projectSlug     — URL-safe project slug (e.g. "governancehub")
  preliminary     — boolean: false = findings verified; true = fields are scope definitions only
  evidenceSource  — controlled vocabulary: "repo-derived" | "preliminary"

---

FINDING FIELDS

  summary           — one to three sentence description of what the audit found
  problem           — detailed description of the problem identified
  impact            — consequences of the problem if left unaddressed
  affectedFiles     — array of file paths directly relevant to this audit
  requiredChange    — specific action or set of actions needed to resolve the problem
  constraints       — rules that must be respected during remediation
  acceptanceCriteria — verifiable conditions that confirm the problem is resolved
  oneSafeNextStep   — the single next action the development agent should take

---

CANONICAL EXAMPLE

The following is a minimal example of an audit in canonical meta/finding shape.
This example is illustrative only — it does not represent a real audit.

  export const EXAMPLE_AUDIT = {
    meta: {
      id: "gov-000",
      title: "Example Audit",
      category: "Governance",
      type: "Schema Drift Audit",
      status: "planned",
      date: null,
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: true,
      evidenceSource: "preliminary",
    },
    finding: {
      summary: "Example summary describing the audit scope.",
      problem: "Example problem description based on direct file inspection.",
      impact: "Example impact description if the problem is not resolved.",
      affectedFiles: [
        "src/components/example/ExampleFile.jsx",
      ],
      requiredChange: "Example description of the required remediation action.",
      constraints: "Example constraints that apply during remediation.",
      acceptanceCriteria: "Example verifiable conditions confirming the problem is resolved.",
      oneSafeNextStep: "Execute the audit: inspect affected files and document findings.",
    },
  };

---

COMPATIBILITY NOTE

Existing audits in AUDIT_INDEX.jsx and individual audit data files use a flat object
structure (all fields at the top level, not nested under meta/finding). These legacy
entries remain valid and do not require migration at this time.

Guidelines for handling both shapes:

- Existing audits may remain in their current flat shape temporarily.
- New audits created after this guide update should prefer the canonical meta/finding structure.
- Migration of existing audits to canonical shape should happen gradually as those files
  are otherwise touched — do not migrate files solely for structural conformance.
- Governance tooling and display components should accept both flat and canonical shapes
  until migration is complete.

`;
