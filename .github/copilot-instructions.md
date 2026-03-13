# Repository Copilot Instructions — GovernanceHub

This repository is a governance-first multi-project control system.

## Core Rules

- Treat GitHub repository files as the only source of truth for repository state.
- Never assume repository state from memory, prior chat context, cached summaries, or reposnapshot.
- Before making implementation proposals, inspect the relevant repository files directly.
- Propose exactly one safe next step at a time.
- Do not perform multiple structural changes in one step.
- Prefer minimal file changes.
- Do not refactor unrelated code.

## Governance Files

The following governance files are high-sensitivity files:

- src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx
- src/components/governance/PhaseExecutionLog.jsx
- src/components/audits/AUDIT_INDEX.jsx
- src/components/audits/AUDIT_SYSTEM_GUIDE.jsx

Do not modify these files unless the task explicitly targets them.

## Audit Rules

Structural or architectural changes must be preceded by an audit when:
- architecture is unclear
- routing appears broken
- governance drift is suspected
- multiple cleanup paths exist
- repository structure must be analyzed before implementation

Audits are analysis artifacts, not implementation tasks.

## Multi-Project Governance

GovernanceHub manages multiple projects.

All audits, tasks, and execution logs should reference a project.
Use project-aware thinking when proposing or implementing changes.

Preferred project reference fields:
- projectId
- projectSlug

## Implementation Discipline

When implementing:
- modify only the requested target file(s)
- preserve existing file paths
- preserve existing export structure
- do not add dependencies unless explicitly requested
- do not introduce alternate architectures unless explicitly requested

## Review Preference

When opening a PR:
- keep scope narrow
- avoid unrelated edits
- prefer clean, incremental changes
- make the requested change first before suggesting broader cleanup
