import React from 'react';
import { NEXT_SAFE_STEP } from '../governance/NextSafeStep';
export function NextSafeStepPanel() {
  return <div className="space-y-2 text-sm"><div><strong>Title:</strong> {NEXT_SAFE_STEP.title}</div><div><strong>Reason:</strong> {NEXT_SAFE_STEP.reason}</div><div><strong>Scope:</strong> {NEXT_SAFE_STEP.scope}</div><div><strong>Blocked by:</strong> {NEXT_SAFE_STEP.blockedBy}</div></div>;
}
