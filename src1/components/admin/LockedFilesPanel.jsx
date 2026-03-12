import React from 'react';
import { LOCKED_FILES } from '../governance/LockedFiles';
export function LockedFilesPanel() {
  return <ul className="list-disc pl-5 text-sm space-y-1">{LOCKED_FILES.files.map((file) => (<li key={file.path}><strong>{file.path}</strong> — {file.rule}</li>))}</ul>;
}
