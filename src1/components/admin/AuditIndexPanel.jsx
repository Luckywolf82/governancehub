import React from 'react';
import { AUDIT_INDEX } from '../audits/AUDIT_INDEX';
export function AuditIndexPanel() {
  return <ul className="list-disc pl-5 text-sm space-y-1">{AUDIT_INDEX.entries.map((entry)=><li key={entry.id}>{entry.title} — {entry.status}</li>)}</ul>;
}
