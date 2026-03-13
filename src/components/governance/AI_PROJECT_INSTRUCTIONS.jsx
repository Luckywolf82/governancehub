export const AI_PROJECT_INSTRUCTIONS = `
AI PROJECT INSTRUCTIONS — GOVERNANCEHUB MULTI-PROJECT GOVERNANCE

VERSION
v2.0

---

SYSTEM STRUCTURE
GovernanceHub is a multi-project governance control system.
It manages audits, tasks, execution logs, and project references across multiple independent projects.
Every audit, task, and execution log entry must reference a specific project.
No governance action is project-agnostic.

---

RULE: REPOSITORY VERIFICATION
When the user requests repository verification, the AI agent must read the actual repository files directly.
Reposnapshot is never a source of truth.
Never answer from memory, cached summaries, reposnapshot, or prior chat context.
Always read live repository files before reporting repository state.

MANUAL REPOSITORY VERIFICATION PROTOCOL
1. Read src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx
2. Read src/components/governance/PhaseExecutionLog.jsx
3. Read src/components/audits/AUDIT_INDEX.jsx
4. Read src/components/audits/AUDIT_SYSTEM_GUIDE.jsx
5. Confirm GitHub visibility of all changed files before marking any task complete

RULE: REPOSITORY QUESTIONS
When the user asks about repository structure, file contents, or current state:
- Do not infer from prior context
- Read the actual files directly
- Report only what was read, not what is assumed

---

DATA INTEGRITY
- GitHub is the sole source of truth for repository state
- No cached, summarized, or inferred state may be treated as verified
- Execution log entries must be written after each verified change
- Locked files must be confirmed unmodified before and after each session

---

MULTI-PROJECT GOVERNANCE
- GovernanceHub manages multiple projects
- Each project has its own audit trail, task list, and execution log scope
- Project identity must be confirmed at the start of every governance session
- Cross-project actions require explicit identification of each affected project
- Audits and tasks created without a project reference are invalid

---

AUDIT SYSTEM
- All structural changes require an audit when system state is unclear
- Audit entries must identify: project, date, change description, affected files, and outcome
- Audit index must be updated when a new audit is created
- Refer to src/components/audits/AUDIT_INDEX.jsx for the canonical audit index
- Refer to src/components/audits/AUDIT_SYSTEM_GUIDE.jsx for audit procedures

---

AI AGENT RULES
- Propose exactly one safe next step at a time
- Do not execute multiple structural changes in a single step
- Read governance files before making any new proposal
- Update the execution log after every verified change
- Do not mark a task complete until GitHub visibility is confirmed
- Never use reposnapshot as a source of truth
- Never infer repository state from prior chat context

---

LOCKED FILES
The following files are locked governance files and must not be modified without an explicit audit:
- src/components/governance/PhaseExecutionLog.jsx
- src/components/audits/AUDIT_INDEX.jsx
- src/components/audits/AUDIT_SYSTEM_GUIDE.jsx

Locked file verification must be confirmed at the start and end of each governance session.

---

EXECUTION LOG
After every verified change:
- Add an entry to src/components/governance/PhaseExecutionLog.jsx
- Record: id, date, task, changedFiles, diffSummary, githubVisibility, lockedFileVerification
- GitHub visibility must be confirmed before setting githubVisibility to verified

---

REPOSITORY VISIBILITY PROTOCOL
1. Implement the change
2. Confirm the file is saved and committed
3. Confirm GitHub shows the updated file
4. Record the confirmed state in the execution log
5. Only then mark the task complete

---

REPOSITORY COMPLETION RULE
A task is complete only when:
- The change is visible in the GitHub repository
- The execution log entry is written and visible in GitHub
- Locked files are confirmed unmodified

---

DEVELOPMENT LOOP
verify → propose → implement → publish → verify

Each iteration of the loop must:
- Begin with reading actual repository files
- Propose exactly one safe next step
- Implement only the approved step
- Confirm GitHub visibility after publish
- Verify locked files remain unmodified

---

AUDIT REQUIREMENT
Structural changes require an audit entry when:
- System state is unclear or unverified
- A locked file is being modified
- A new project is being added to GovernanceHub
- Cross-project dependencies are affected

---

VERSION HISTORY
v1.0 — Initial Base44 template
v2.0 — Upgraded to GovernanceHub multi-project governance specification
`;
