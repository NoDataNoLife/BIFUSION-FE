import AntCoin from "../../common/AntCoin";
import { X, Award, AlertCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { requestMessage } from '../../../lib/liveData';
import { useAuthStore } from '../../../store/useAuthStore';

interface VerificationRequestModalProps {
  onClose: () => void;
  onSubmit: (reason: string, reward: number) => void | Promise<void>;
  assetTitle: string;
  minReward?: number;
  maxReward?: number;
}

export default function VerificationRequestModal({ onClose, onSubmit, assetTitle, minReward = 100, maxReward = 1000 }: VerificationRequestModalProps) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reward, setReward] = useState<number | string>(Math.max(minReward, Math.min(500, maxReward)));
  const { user } = useAuthStore();
  const currentPoints = user?.points || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const points = Number(reward);
    if (lock.current || !reason.trim() || !Number.isInteger(points) || points < minReward || points > maxReward || points > currentPoints) return;
    lock.current = true;
    setBusy(true); setError(null);
    try { await onSubmit(reason.trim(), points); }
    catch (err) { setError(requestMessage(err, '검증 요청에 실패했습니다.')); }
    finally { lock.current = false; setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-[2rem] border border-border max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-3 text-primary">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
              전문가 검증 신청
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {error && <p role="alert" className="px-8 pt-4 text-red-500">{error}</p>}
        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 text-primary">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">검증 대상: {assetTitle}</p>
              <p className="opacity-90 leading-relaxed">
                해당 애셋에 대한 검증을 전문가 그룹에 요청합니다. 전문가는 등록된 내용과 레시피/데이터를 기반으로 적합성을 판단합니다.
              </p>
            </div>
          </div>

          <form id="verification-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">
                검증 요청 메모 (필수)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                전문가가 무엇을 중점적으로 검토해야 하는지 적어주세요.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="예) 증강 파이프라인 적용 후 노이즈 비율이 적절한지, 또는 의료 데이터로서 손실이 없는지 검토 부탁드립니다."
                className="w-full h-32 px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex justify-between items-end">
                <span className="flex items-center gap-2"><AntCoin className="w-5 h-5" />검수 보상 앤트</span>
                <span className={`text-xs font-bold ${Number(reward) > currentPoints ? 'text-red-500' : 'text-primary'}`}>
                  내 보유 앤트: {currentPoints.toLocaleString()} 앤트
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value.replace(/^0+(?=\d)/, ''))}
                  min={minReward}
                  max={maxReward}
                  step={1}
                  className={`w-full h-14 px-5 bg-background border ${Number(reward) > currentPoints ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} rounded-2xl text-foreground font-bold focus:outline-none focus:ring-1 transition-all`}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold flex items-center gap-2">
                  <AntCoin className="w-5 h-5" /><span>앤트</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">신청 가능 범위: {minReward.toLocaleString()} ~ {maxReward.toLocaleString()} 앤트</p>
              {Number(reward) > currentPoints && (
                <p className="text-xs text-red-500 font-bold mt-1">보유 앤트가 부족합니다.</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 bg-background border border-border rounded-xl text-foreground font-bold hover:bg-muted transition-all"
          >
            취소
          </button>
          <button
            type="submit"
            form="verification-form"
            disabled={busy || !reason.trim() || !Number.isInteger(Number(reward)) || Number(reward) < minReward || Number(reward) > maxReward || Number(reward) > currentPoints}
            className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            신청하기
          </button>
        </div>
      </div>
    </div>
  );
}
