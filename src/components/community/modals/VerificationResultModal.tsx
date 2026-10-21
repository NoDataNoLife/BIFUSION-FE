import type { InspectionResult } from '../../../lib/liveData';
import { X, CheckCircle, User, Star } from 'lucide-react';

interface VerificationResultModalProps {
  onClose: () => void;
  assetTitle: string;
  result?: InspectionResult | null;
}

export default function VerificationResultModal({ onClose, assetTitle, result }: VerificationResultModalProps) {
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
              <p className="text-sm font-bold text-foreground leading-snug">{result?.reviewerName || '담당자 정보 없음'}</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">종합 점수</span>
              </div>
              <p className="text-2xl font-black text-primary">{result?.score ?? '미제공'} <span className="text-sm text-muted-foreground font-medium">/ 100</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-widest flex justify-between items-end">
              <span>전문가 코멘트</span>
              <span className="text-xs font-medium normal-case">{result?.verifiedAt ? new Date(result.verifiedAt).toLocaleString() : '검증일 정보 없음'}</span>
            </h3>
            <div className="bg-background border border-border rounded-2xl p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {result?.comment || '서버에서 검증 결과를 제공하지 않았습니다.'}
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
