export function generateCopilotTask(audit) {
  return `\nAUDIT TITLE\n${audit.title}\n\nTYPE\n${audit.type}\n\nPROBLEM\n${audit.problem}\n\nIMPACT\n${audit.impact}\n\nAFFECTED FILES\n${audit.affectedFiles.join("\\n")}\n\nREQUIRED CHANGE\n${audit.requiredChange}\n\nCONSTRAINTS\n${audit.constraints}\n\nACCEPTANCE CRITERIA\n${audit.acceptanceCriteria}\n\n@copilot implement the required change with minimal file modifications and preserve existing structure.\n`.trim()
}
