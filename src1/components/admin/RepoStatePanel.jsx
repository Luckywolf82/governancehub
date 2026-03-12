import React from 'react';
import { LAST_VERIFIED_STATE } from '../governance/LastVerifiedState';
export function RepoStatePanel() {
  return <div className="space-y-2 text-sm"><div><strong>GitHub repo:</strong> {LAST_VERIFIED_STATE.repository}</div><div><strong>Visibility:</strong> {LAST_VERIFIED_STATE.githubVisibility}</div><div><strong>Sync drift:</strong> {LAST_VERIFIED_STATE.syncDriftStatus}</div><div><strong>Latest verified commit:</strong> {LAST_VERIFIED_STATE.latestVerifiedCommit}</div><div><strong>Notes:</strong> {LAST_VERIFIED_STATE.notes}</div></div>;
}
