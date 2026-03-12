export const AI_PROJECT_INSTRUCTIONS = `
AI PROJECT INSTRUCTIONS — BASE44 APP TEMPLATE

VERSION
v1.0

RULE: REPOSITORY VERIFICATION
Reposnapshot must never be used when the user asks the AI agent to verify or check the repository.
When verification is requested, the AI must read the actual repository files directly before answering.
Never answer from memory, cached summaries or prior chat context.

REQUIRED DEVELOPMENT LOOP
verify → propose → implement → publish → verify

CORE RULES
- One critical change at a time
- Preview before apply
- Report after each step
- No silent fallback as truth
- GitHub is source of truth for verification

MANDATORY GOVERNANCE FILES
- AI_PROJECT_INSTRUCTIONS.jsx
- AI_STATE.jsx
- PhaseExecutionLog.jsx
- LastVerifiedState.jsx
- NextSafeStep.jsx
- LockedFiles.jsx

MANDATORY BEHAVIOR
- Read governance before new proposals
- Update execution log after changes
- Do not mark complete until GitHub visibility is confirmed
`;
