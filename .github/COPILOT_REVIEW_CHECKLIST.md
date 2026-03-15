# COPILOT REVIEW CHECKLIST

Use this checklist before merging any Copilot PR.

---

## Scope Check

- [ ] PR modifies only the requested file(s)
- [ ] No unexpected files were changed
- [ ] No project structure changes occurred

---

## Code Quality

- [ ] Implementation matches issue description
- [ ] No placeholder or incomplete logic
- [ ] Code structure remains consistent with repository style
- [ ] No unnecessary refactors

---

## Governance Compliance

- [ ] Governance files were not modified unintentionally
- [ ] Locked files remain unchanged (unless audit explicitly required)

Locked files:

src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx  
src/components/governance/LockedFiles.jsx  
src/components/governance/PhaseExecutionLog.jsx  
src/components/audits/AUDIT_INDEX.jsx  
src/components/audits/AUDIT_SYSTEM_GUIDE.jsx  

---

## Repository Verification

Confirm changes are visible in GitHub.

- [ ] file saved
- [ ] commit created
- [ ] PR updated
- [ ] GitHub shows latest version

---

## Merge Decision

Safe to merge only if:

- [ ] change solves the issue
- [ ] no unexpected side effects
- [ ] repository structure intact
