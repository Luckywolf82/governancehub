import React from 'react';
const items = ['Project published from editor','Relevant repo files re-read directly from GitHub','Execution log updated','Locked files verified untouched','Next safe step updated'];
export function VerificationChecklist() {
  return <ul className="space-y-2 text-sm">{items.map((item)=><li key={item} className="flex items-center gap-2"><span>☐</span><span>{item}</span></li>)}</ul>;
}
