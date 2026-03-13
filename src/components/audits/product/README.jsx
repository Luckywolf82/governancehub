export default `
Product audits live here.

Purpose:
- Store read-only product analysis artifacts under src/components/audits/product
- Feed roadmap discussion and admin review without becoming runtime state

Each product audit should include:
- auditId, auditType, date, status
- purpose, scope, evidence
- findings and oneSafeNextStep

Rules:
- Product audits are analysis artifacts, not live business logic
- Keep them read-only
- Do not use product audits as mutable state stores
`;
