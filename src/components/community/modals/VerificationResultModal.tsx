import { X, CheckCircle, User, Star } from 'lucide-react';

interface VerificationResultModalProps {
  onClose: () => void;
  assetTitle: string;
}

export default function VerificationResultModal({ onClose, assetTitle }: VerificationResultModalProps) {
  // 백엔드 연동 전 임시 Mock 데이터
  const mockResult = {
    reviewerName: "김의사 (서울대학교병원 영상의학과 전문의)",
    score: 95,
    comment: "제공해주신 의료 이미지 증강 파이프라인의 결과물을 검토한 결과, 픽셀 손실이 거의 없고 결절의 경계면 증강 처리가 매우 우수합니다.\n\n다만, 일부 노이즈 필터링 과정에서 미세한 혈관 패턴이 뭉개지는 현상이 발견되었으니, 이 부분의 파라미터를 조정하신다면 완벽한 의료 데이터셋으로 활용 가능할 것으로 판단됩니다.\n\n전반적으로 매우 훌륭한 품질의 데이터입니다.",
    verifiedAt: "2026-08-13"
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-[2rem] border border-border max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-3 text-green-500">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
              전문가 검증 결과
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-widest">검증 대상</h3>
            <p className="text-lg font-black text-foreground">{assetTitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">담당 전문가</span>
              </div>
              <p className="text-sm font-bold text-foreground leading-snug">{mockResult.reviewerName}</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">종합 점수</span>
              </div>
              <p className="text-2xl font-black text-primary">{mockResult.score} <span className="text-sm text-muted-foreground font-medium">/ 100</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-widest flex justify-between items-end">
              <span>전문가 코멘트</span>
              <span className="text-xs font-medium normal-case">{mockResult.verifiedAt}</span>
            </h3>
            <div className="bg-background border border-border rounded-2xl p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {mockResult.comment}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3.5 bg-foreground text-background rounded-xl font-black hover:bg-foreground/90 transition-all shadow-lg"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
