import { Award, Clock, FileText } from 'lucide-react';

export type VerificationStatus = 'NONE' | 'PENDING' | 'COMPLETED';

interface ExpertVerificationCardProps {
  status: VerificationStatus;
  onRequestVerification: () => void;
  onViewResults: () => void;
}

export default function ExpertVerificationCard({ status, onRequestVerification, onViewResults }: ExpertVerificationCardProps) {
  return (
    <div className={`rounded-4xl p-8 shadow-xl ${
      status === 'COMPLETED' ? 'bg-primary text-white shadow-primary/20' : 
      status === 'PENDING' ? 'bg-muted/80 text-foreground shadow-sm' : 
      'bg-primary text-white shadow-primary/20'
    }`}>
      <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${status === 'PENDING' ? 'text-muted-foreground' : ''}`}>
        <Award size={20} /> 전문가 검증
      </h3>
      
      {status === 'NONE' && (
        <>
          <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
            품질이 검증된 데이터셋/레시피는 연구 신뢰도를 높여줍니다. 전문가에게 검증을 요청하세요.
          </p>
          <button 
            onClick={onRequestVerification}
            className="w-full py-4 bg-card text-primary rounded-2xl font-black text-sm hover:bg-primary-foreground transition-all shadow-lg active:scale-95"
          >
            검증 신청하기
          </button>
        </>
      )}

      {status === 'PENDING' && (
        <>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-6">
            전문가 그룹이 면밀하게 품질을 검증하고 있습니다. 검증이 완료되면 알려드릴게요!
          </p>
          <button 
            disabled
            className="w-full py-4 bg-background text-muted-foreground rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
          >
            <Clock size={16} /> 검증 대기 중
          </button>
        </>
      )}

      {status === 'COMPLETED' && (
        <>
          <p className="text-white/90 text-sm font-bold leading-relaxed mb-6">
            🎉 전문가 검증을 우수한 성적으로 통과했습니다. 검증 리포트를 확인해보세요.
          </p>
          <button 
            onClick={onViewResults}
            className="w-full py-4 bg-card text-primary rounded-2xl font-black text-sm hover:bg-primary-foreground transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <FileText size={16} /> 결과 보기
          </button>
        </>
      )}
    </div>
  );
}
