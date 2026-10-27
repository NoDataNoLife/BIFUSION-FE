import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useNotificationStore, type NotificationItem } from '../../store/useNotificationStore';
import { useProjectStore } from '../../store/useProjectStore';

export default function TeamInvitationActions({ invitation }: { invitation?: NotificationItem['invitation'] }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const current = status ?? invitation?.status;
  const respond = async (action: 'ACCEPT' | 'REJECT') => {
    if (lock.current || !invitation || current !== 'PENDING') return;
    lock.current = true; setBusy(true); setError(null);
    try {
      await api.patch(`/projects/${invitation.projectId}/invitations/${invitation.invitationId}`, { action });
      setStatus(action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED');
      const store = useNotificationStore.getState();
      await Promise.all([store.fetchPopupNotifications(), store.fetchNotifications(), useProjectStore.getState().fetchMyProjects()]);
    } catch (err) { setError(requestMessage(err, '초대에 응답하지 못했습니다. 알림을 새로고침해 주세요.')); }
    finally { lock.current = false; setBusy(false); }
  };
  return <div className="mt-3 cursor-default border-t border-border pt-3" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
    {!invitation ? <p className="text-xs text-muted-foreground">이전 초대입니다. 최신 초대 알림을 확인하거나 초대한 분에게 재발송을 요청해 주세요.</p>
      : current === 'PENDING' ? <div role="group" aria-label="팀 초대 응답" className="flex flex-wrap gap-2">
        <p className="w-full text-xs text-muted-foreground">참여 권한: {invitation.role === 'MANAGER' ? '관리자' : '멤버'}</p>
        <button disabled={busy} onClick={() => void respond('ACCEPT')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary/15 px-4 text-xs font-bold text-primary disabled:opacity-50"><Check size={15}/>{busy ? '처리 중…' : '수락'}</button>
        <button disabled={busy} onClick={() => void respond('REJECT')} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-xs font-bold disabled:opacity-50"><X size={15}/>거절</button>
      </div> : <div className="space-y-2 text-xs text-muted-foreground"><p>{({ ACCEPTED: '수락한 초대입니다.', REJECTED: '거절한 초대입니다.', EXPIRED: '만료된 초대입니다.', CANCELLED: '취소된 초대입니다.' } as Record<string, string>)[current ?? ''] ?? '응답할 수 없는 초대입니다.'}</p>{current === 'ACCEPTED' && <Link className="text-primary underline" to={`/dashboard/projects/${invitation.projectId}`}>프로젝트로 이동</Link>}</div>}
    {error && <p role="alert" className="mt-2 text-xs text-red-500">{error}</p>}
  </div>;
}
