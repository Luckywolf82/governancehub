import React from 'react';
import { AI_STATE } from '../governance/AI_STATE';
export function AIStatePanel() {
  return <div className="space-y-2 text-sm"><div><strong>Project:</strong> {AI_STATE.projectName}</div><div><strong>Phase:</strong> {AI_STATE.phase}</div><div><strong>Status:</strong> {AI_STATE.status}</div><div><strong>Last verified:</strong> {AI_STATE.lastVerified}</div><div><strong>Current focus:</strong> {AI_STATE.currentFocus}</div></div>;
}
