import React from 'react';
import { PHASE_EXECUTION_LOG } from '../governance/PhaseExecutionLog';
export function ExecutionLogSummary() {
  const latest = PHASE_EXECUTION_LOG.entries[0];
  return latest ? <div className="text-sm space-y-2"><div><strong>Latest entry:</strong> {latest.id}</div><div><strong>Date:</strong> {latest.date}</div><div><strong>Task:</strong> {latest.task}</div><div><strong>Files:</strong> {latest.changedFiles.join(', ')}</div></div> : <div className="text-sm">No execution log entries yet.</div>;
}
