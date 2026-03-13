const repoOwner = "Luckywolf82";
const repoName = "governancehub";
const branch = "main";

// Legg inn filene du vil ha raw-link til her
const files = [
  "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
  "src/components/governance/PhaseExecutionLog.jsx",
  "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
  "src/components/audits/AUDIT_INDEX.jsx",
  ".github/copilot-instructions.md",
  ".github/COPILOT_TASK_TEMPLATE.md",
  ".github/COPILOT_REVIEW_CHECKLIST.md",
];

const rawLinks = files.map(
  (file) =>
    `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${file}`
);

console.log(rawLinks.join("\n"));
