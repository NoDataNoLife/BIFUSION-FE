import { useId } from 'react';
import { Check, X, Info } from 'lucide-react';

/** UI only: enable after the received-invitation ID and status contract is available. */
export default function TeamInvitationActions() {
  const helpId = useId();
  return <div
    className="mt-3 border-t border-border pt-3 cursor-default"
    onClick={event => event.stopPropagation()}
    onKeyDown={event => event.stopPropagation()}
  >
    <div role="group" aria-label="팀 초대 응답" aria-describedby={helpId} className="flex flex-wrap gap-2">
      <button type="button" disabled className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-xl bg-primary/15 text-primary text-xs font-bold opacity-60 cursor-not-allowed"><Check size={15} aria-hidden="true" />수락</button>
      <button type="button" disabled className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-xl border border-border text-muted-foreground text-xs font-bold opacity-60 cursor-not-allowed"><X size={15} aria-hidden="true" />거절</button>
    </div>
    <p id={helpId} className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />초대 응답 기능 준비 중입니다. 아직 이 화면에서 수락·거절할 수 없습니다.</p>
  </div>;
}
