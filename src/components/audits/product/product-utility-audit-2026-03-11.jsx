export const AUDITS_README = `
Store audits by category:

- architecture
- governance
- ui
- data
- performance
- product

Each audit should include:
- purpose
- scope
- evidence
- findings
- one safe next step

Product audits:
- live under src/components/audits/product
- are read-only analysis artifacts
- can feed roadmap discussion and admin review
- should not become a second source of truth for runtime logic
`;
