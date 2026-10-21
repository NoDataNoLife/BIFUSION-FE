import { Award } from 'lucide-react';
export type VerificationStatus = 'NONE' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
interface Props { status: VerificationStatus; onRequestVerification?: () => void; onViewResults: () => void }
export default function ExpertVerificationCard({ status, onRequestVerification, onViewResults }: Props) {
  return <section className="p-8 rounded-3xl border border-border bg-card space-y-4">
    <h3 className="font-bold flex gap-2"><Award size={20}/>전문가 검증</h3>
    <p>{status === 'PENDING' ? '검증을 기다리고 있습니다.' : status === 'IN_PROGRESS' ? '검증이 진행 중입니다.' : status === 'COMPLETED' ? '검증 결과가 등록되었습니다.' : status === 'REJECTED' ? '검증 요청이 반려되었습니다.' : '아직 검증되지 않았습니다.'}</p>
    {(status === 'NONE' || status === 'REJECTED') && onRequestVerification && <button className="text-primary" onClick={onRequestVerification}>검증 신청하기</button>}
    {(status === 'COMPLETED' || status === 'REJECTED') && <button className="text-primary" onClick={onViewResults}>결과 보기</button>}
  </section>;
}
