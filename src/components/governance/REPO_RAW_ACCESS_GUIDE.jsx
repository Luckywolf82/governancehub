// REPO_RAW_ACCESS_GUIDE
// Human-readable and machine-readable guide for raw GitHub access to GovernanceHub.
// This file is exported as a string constant for use in admin panels and documentation.

export const REPO_RAW_ACCESS_GUIDE = `
# GovernanceHub — Repository Raw Access Guide
Generated: 2026-03-14
Repository: https://github.com/Luckywolf82/governancehub

---

## Why Manifest Files Are Required

A single raw.githubusercontent.com URL can only expose ONE file at a time.
There is no GitHub API endpoint that returns a full repository tree via raw access.

Therefore, this system generates canonical manifest files that:
- List every confirmed-existing file in the repo
- Provide the exact raw URL for each file
- Allow ChatGPT and other AI agents to systematically inspect any file

Without these manifests, an AI agent would have to guess file paths or use the GitHub API.

---

## File Index

### REPO_FILE_MANIFEST.json
**Path in repo:** src/components/governance/REPO_FILE_MANIFEST.json
**Raw URL:** https://raw.githubusercontent.com/Luckywolf82/governancehub/main/src/components/governance/REPO_FILE_MANIFEST.json

Contains ALL confirmed files in the repository.
Each entry has:
- path: repo-relative path
- fileName: base name
- extension: file extension
- folder: parent folder
- rawUrl: direct download URL
- githubUrl: GitHub browser URL
- category: governance | audits | projects | pages | components | admin | utils | config | docs | assets | other
- exists: true | false (never guessed — only true if confirmed)
- locked: true if the file must not be silently modified

---

### PRIORITY_REPO_FILES.json
**Path in repo:** src/components/governance/PRIORITY_REPO_FILES.json
**Raw URL:** https://raw.githubusercontent.com/Luckywolf82/governancehub/main/src/components/governance/PRIORITY_REPO_FILES.json

Contains the most important files for governance verification.
Each entry has:
- path, label, priority (critical | high | normal)
- whyItMatters: plain-language reason for importance
- rawUrl, githubUrl
- lockedFile: true if this file is protected
- exists: always verified

Read this file FIRST when starting a new governance session.

---

### Folder Indexes (src/components/governance/repo-index/)

Six targeted indexes for efficient navigation:

| File | Coverage |
|------|----------|
| root-index.json      | Root-level repo files (.gitignore, package.json, etc.) |
| governance-index.json | src/components/governance/ — all governance files |
| audits-index.json    | src/components/audits/ — all audit files and subfolders |
| pages-index.json     | src/pages/ — all page components |
| components-index.json | src/components/ root — core UI components |
| admin-index.json     | All admin-related files across pages/ and components/ |

Each folder index has:
- folder: the folder it covers
- generatedAt: date of last update
- fileCount: number of confirmed files
- subfolders: list of subdirectories
- files[]: array of file entries with rawUrl and githubUrl

---

## Which Files to Read First for Governance Verification

Always start with these files in order:

1. PRIORITY_REPO_FILES.json — identifies what matters most
2. src/components/governance/LockedFiles.jsx — never modify these
3. src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx — governance rules
4. src/components/governance/AI_STATE.jsx — current project phase
5. src/components/governance/NextSafeStep.jsx — approved next action
6. src/components/governance/PhaseExecutionLog.jsx — full change history
7. src/App.jsx — routing verification
8. src/components/AppLayout.jsx — navigation verification

---

## How ChatGPT Should Use This System

### Step 1: Read the manifest
Fetch:
https://raw.githubusercontent.com/Luckywolf82/governancehub/main/src/components/governance/REPO_FILE_MANIFEST.json

Parse the files array. This is your map of everything that exists.

### Step 2: Read priority files
Fetch:
https://raw.githubusercontent.com/Luckywolf82/governancehub/main/src/components/governance/PRIORITY_REPO_FILES.json

Open every file with priority: "critical" using its rawUrl.
Do not proceed without reading LockedFiles.jsx and AI_PROJECT_INSTRUCTIONS.jsx.

### Step 3: Navigate by folder index
Use the folder indexes to find files in a specific area:
- Investigating governance? → governance-index.json
- Investigating audits? → audits-index.json
- Investigating routes? → pages-index.json

### Step 4: Open exact raw file URLs
For each file you need to inspect:
fetch(file.rawUrl)

Do NOT construct URLs manually. Always use the rawUrl from the manifest.
Do NOT assume a file exists unless exists: true in the manifest.

### Step 5: Verify before proposing changes
Cross-reference:
- PhaseExecutionLog → what has already been done
- NextSafeStep → what is approved to do next
- LockedFiles → what must not be changed

---

## Raw URL Pattern
https://raw.githubusercontent.com/Luckywolf82/governancehub/main/<file-path>

## GitHub URL Pattern
https://github.com/Luckywolf82/governancehub/blob/main/<file-path>

---

## Limitations

1. This manifest was generated manually on 2026-03-14.
   It reflects the repository state as of that date.
   Re-run generateRepoManifest.js to update after changes.

2. Base44 cannot write to tools/ directly.
   The generator script lives at:
   src/components/governance/generateRepoManifest.js
   Copy it to tools/ to run it locally.

3. src/components/ui/ files are not individually enumerated in this manifest
   due to the high count of auto-generated shadcn UI components.
   Inspect them directly via the GitHub browser URL:
   https://github.com/Luckywolf82/governancehub/tree/main/src/components/ui

4. Folders src/api/, src/hooks/, src/lib/, src/utils/, src/entities/, src/functions/, src/projects/
   are confirmed to exist as directories, but their individual file contents
   were not verified at manifest generation time. They are not listed.
   Use the GitHub tree URLs to inspect them:
   https://github.com/Luckywolf82/governancehub/tree/main/src/api

---
`;

export default REPO_RAW_ACCESS_GUIDE;