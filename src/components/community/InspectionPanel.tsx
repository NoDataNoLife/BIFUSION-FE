import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelInspection, requestInspection, type InspectionTarget } from '../../lib/backendContracts';
import { requestMessage } from '../../lib/liveData';
import { useAuthStore } from '../../store/useAuthStore';
import VerificationRequestModal from './modals/VerificationRequestModal';
import VerificationResultModal from './modals/VerificationResultModal';

export default function InspectionPanel({ target, title, reload }: { target: InspectionTarget | null | undefined; title: string; reload: () => void }) {
  const [modal, setModal] = useState<'request' | 'result' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  if (!target) return null;
  const bounds = target.minRewardPoints != null && target.maxRewardPoints != null && target.minRewardPoints <= target.maxRewardPoints;
  return <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
    <h3 className="text-lg font-bold">전문가 검수</h3><p className="text-sm text-muted-foreground">{({ PENDING: '검수 대기', IN_PROGRESS: '검수 중', APPROVED: '검수 승인', REJECTED: '검수 반려', CANCELLED: '신청 취소' } as Record<string,string>)[target.status ?? ''] ?? '검수를 신청해 전문가 의견을 받아보세요.'}</p>
    {target.canRequest && <button disabled={!bounds} onClick={() => setModal('request')} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{bounds ? '검수 신청하기' : '검수 비용 정보 확인 필요'}</button>}
    {target.status === 'PENDING' && target.inspectionRequestId != null && <button disabled={busy} className="text-sm text-red-500 underline" onClick={async () => {
      if (lock.current || !confirm('검수 신청을 취소하고 앤트를 환불받을까요?')) return;
      lock.current = true; setBusy(true); setError(null);
      try { await cancelInspection(target.inspectionRequestId!); void useAuthStore.getState().fetchUser(); reload(); }
      catch (err) { setError(requestMessage(err)); } finally { lock.current = false; setBusy(false); }
    }}>검수 신청 취소</button>}
    {target.result && <button onClick={() => setModal('result')} className="block text-sm text-primary underline">검수 결과 보기</button>}
    <Link to="/dashboard/inspections" className="block text-xs text-muted-foreground underline">내가 요청한 검수 목록</Link>
    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    {modal === 'request' && <VerificationRequestModal assetTitle={title} minReward={target.minRewardPoints} maxReward={target.maxRewardPoints} onClose={() => setModal(null)} onSubmit={async (reason,reward) => { await requestInspection(target,reason,reward); void useAuthStore.getState().fetchUser(); setModal(null); reload(); }}/>}
    {modal === 'result' && <VerificationResultModal assetTitle={title} result={target.result} onClose={() => setModal(null)}/>}
  </section>;
}
