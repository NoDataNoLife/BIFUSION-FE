import { Award, Clock, FileText } from 'lucide-react';
export type VerificationStatus = 'NONE' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
interface Props { status: VerificationStatus; onRequestVerification?: () => void; onViewResults: () => void }
export default function ExpertVerificationCard({ status, onRequestVerification, onViewResults }: Props) {
  const pending = status === 'PENDING' || status === 'IN_PROGRESS';
  const result = status === 'COMPLETED' || status === 'REJECTED';
  return <section className={`rounded-4xl p-8 shadow-xl ${pending ? 'bg-muted/80 text-foreground shadow-sm' : 'bg-primary text-white shadow-primary/20'}`}>
    <h3 className="text-lg font-black mb-4 flex items-center gap-2"><Award size={20}/>전문가 검증</h3>
    <p className={`text-sm font-medium leading-relaxed mb-6 ${pending ? 'text-muted-foreground' : 'text-white/90'}`}>
      {status === 'PENDING' ? '검증 신청이 접수되었습니다. 전문가의 검토를 기다리고 있어요.' : status === 'IN_PROGRESS' ? '전문가가 품질을 검토하고 있습니다.' : status === 'COMPLETED' ? '전문가 검증이 완료되었습니다. 검증 리포트를 확인해 보세요.' : status === 'REJECTED' ? '검증 요청이 반려되었습니다. 검토 의견을 확인해 주세요.' : onRequestVerification ? '연구에 활용할 데이터의 품질을 전문가에게 검증받아 보세요.' : '이 자산의 검증 신청 기능을 준비하고 있습니다.'}
    </p>
    {pending ? <button disabled className="w-full py-4 bg-background text-muted-foreground rounded-2xl font-black text-sm flex items-center justify-center gap-2"><Clock size={16}/>{status === 'PENDING' ? '검증 대기 중' : '검증 진행 중'}</button>
      : result ? <button className="w-full py-4 bg-card text-primary rounded-2xl font-black text-sm flex items-center justify-center gap-2" onClick={onViewResults}><FileText size={16}/>결과 보기</button>
      : <button disabled={!onRequestVerification} onClick={onRequestVerification} className="w-full py-4 bg-card text-primary rounded-2xl font-black text-sm disabled:opacity-70 disabled:cursor-not-allowed">{onRequestVerification ? '검증 신청하기' : '검증 신청 준비 중'}</button>}
  </section>;
}
