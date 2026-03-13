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

`;
