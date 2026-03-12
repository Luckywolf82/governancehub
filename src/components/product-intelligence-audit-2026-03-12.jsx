export const AUDIT_SYSTEM_GUIDE = `
AUDIT SYSTEM GUIDE

Purpose
- Store structured audit artifacts inside src/components/audits
- Keep audits readable, reviewable, and safe to reference from admin UI

Allowed categories
- architecture
- governance
- ui
- data
- performance
- product

Rules
- Audits are analysis artifacts, not live business logic
- Keep them read-only
- Do not use audits as mutable state stores
- Each audit should identify scope, evidence, findings, and one safe next step
- Product audits may reference roadmap prioritization, build-readiness, install-driver value, and implementation cost
- Product audit files should live in src/components/audits/product

Recommended fields
- auditId
- auditType
- date
- status
- purpose
- scope
- evidence
- findings
- oneSafeNextStep

Starter-kit note
- This starter kit includes a TankRadar-derived product audit layer and roadmap model adapted for GovernanceHub compatibility.
`;
