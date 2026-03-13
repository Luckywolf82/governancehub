# COPILOT TASK TEMPLATE

Use this template when assigning tasks to Copilot.

---

## Task Type
(governance / audit / routing / ui / bugfix / cleanup / documentation)

---

## Target File(s)
Exact file path(s) that must be modified.

Example:
src/components/audits/AUDIT_SYSTEM_GUIDE.jsx

Do not modify other files unless explicitly allowed.

---

## Problem
Describe what is wrong or missing.

Example:
The current file is still a minimal placeholder and does not define the GovernanceHub audit methodology clearly enough.

---

## Required Change
Describe exactly what must be implemented.

Example:

Expand the guide to include:

• purpose of the audit system  
• when audits are required  
• standard audit structure  
• project reference rule (projectId or projectSlug)  
• audits vs tasks explanation  
• evidence rule  
• example audit format  

---

## Constraints
Copilot must follow these rules:

- modify only the target file(s)
- do not refactor unrelated code
- do not add dependencies
- preserve existing export structure
- do not rename files unless requested
- do not move files unless requested

---

## Acceptance Criteria

The task is complete when:

- required change is implemented
- file compiles correctly
- no unrelated files modified
- repository structure remains unchanged

---

## Copilot Instruction

@copilot implement the required change.

Important:

• restrict changes to the specified file(s)  
• do not modify unrelated files  
• preserve existing project structure  
