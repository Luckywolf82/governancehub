import React from 'react';
import { AIStatePanel } from './AIStatePanel';
import { RepoStatePanel } from './RepoStatePanel';
import { NextSafeStepPanel } from './NextSafeStepPanel';
import { LockedFilesPanel } from './LockedFilesPanel';
import { VerificationChecklist } from './VerificationChecklist';
import { ExecutionLogSummary } from './ExecutionLogSummary';
import { AuditIndexPanel } from './AuditIndexPanel';
import { ReviewQueuePanel } from './ReviewQueuePanel';
import { SourceRegistryPanel } from './SourceRegistryPanel';
import { FailureLogPanel } from './FailureLogPanel';

export function AdminDashboard() {
  const section = 'rounded-2xl border p-4 bg-white/70 shadow-sm';
  const title = 'text-xl font-semibold mb-3';
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Cockpit</h1>
        <p className="text-sm opacity-70 mt-1">Governance, repo visibility, data review and ops.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className={section}><div className={title}>AI State</div><AIStatePanel /></div>
        <div className={section}><div className={title}>Repo State</div><RepoStatePanel /></div>
        <div className={section}><div className={title}>Next Safe Step</div><NextSafeStepPanel /></div>
        <div className={section}><div className={title}>Locked Files</div><LockedFilesPanel /></div>
        <div className={section}><div className={title}>Verification</div><VerificationChecklist /></div>
        <div className={section}><div className={title}>Execution Log</div><ExecutionLogSummary /></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={section}><div className={title}>Audit Index</div><AuditIndexPanel /></div>
        <div className={section}><div className={title}>Review Queue</div><ReviewQueuePanel /></div>
        <div className={section}><div className={title}>Source Registry</div><SourceRegistryPanel /></div>
      </div>
      <div className={section}><div className={title}>Failure Log</div><FailureLogPanel /></div>
    </div>
  );
}
