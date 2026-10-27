import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import AntCoin from '../../components/common/AntCoin';
import { useAuthStore } from '../../store/useAuthStore';
import { ANT_PACKAGES, ANT_PRICE_KRW, antPrice } from '../../lib/antTopup';

export default function AntTopupPage() {
  const points = useAuthStore(state => state.user?.points);
  const [amount, setAmount] = useState<number>(1000);
  const [previewed, setPreviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const charge = async () => {
    if (lock.current || previewed) return;
    lock.current = true; setBusy(true); setError(null);
    try {
      const response = await api.post('/points/charge', { points: amount });
      const result = response.data?.data;
      if (!Number.isFinite(result?.balance) || result?.chargedPoints !== amount) throw new Error('충전 응답을 확인하지 못했습니다. 다시 충전하기 전에 잔액을 확인해 주세요.');
      useAuthStore.setState(state => ({ user: state.user ? { ...state.user, points: result.balance } : null }));
      setPreviewed(true);
    } catch (err) {
      const response = (err as { response?: { status?: number } }).response;
      setError(response?.status === 503 ? '체험 충전은 준비 중입니다. 잠시 후 다시 확인해 주세요.' : requestMessage(err, '충전을 확인하지 못했습니다. 잔액을 먼저 확인해 주세요.'));
      void useAuthStore.getState().fetchUser();
    } finally { lock.current = false; setBusy(false); }
  };
  const won = (value: number) => `${value.toLocaleString('ko-KR')}원`;
  return <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} />대시보드로 돌아가기</Link>
    <header className="flex flex-wrap items-center justify-between gap-6">
      <div><p className="text-primary text-xs font-bold tracking-widest mb-2">ANT</p><h1 className="text-3xl font-black text-foreground">앤트 충전</h1><p className="text-sm text-muted-foreground mt-3">AI 작업과 전문가 검수에 사용할 앤트를 선택하세요.</p></div>
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-4"><AntCoin className="w-12 h-12" /><div><p className="text-xs text-muted-foreground">현재 보유 앤트</p><p className="text-xl font-black text-foreground mt-1">{points == null ? '조회되지 않음' : `${points.toLocaleString('ko-KR')} 앤트`}</p></div></div>
    </header>
    <div className="flex gap-3 rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4 text-sm"><Info size={18} className="text-primary shrink-0 mt-0.5" /><p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">충전 체험 화면입니다.</strong> 결제 없이 선택한 앤트가 실제 서비스 잔액에 지급됩니다. 표시 가격은 참고용 임시 기준이며 청구되지 않습니다.</p></div>
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      <section aria-labelledby="package-title" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2"><h2 id="package-title" className="text-xl font-black text-foreground">충전할 앤트 선택</h2><p className="text-xs text-muted-foreground">임시 단가 · 1 앤트 = {won(ANT_PRICE_KRW)}</p></div>
        <div role="group" aria-label="충전 상품" className="grid sm:grid-cols-2 gap-4">
          {ANT_PACKAGES.map(value => <button key={value} type="button" aria-pressed={amount === value} disabled={busy} onClick={() => { setAmount(value); setPreviewed(false); setError(null); }} className={`relative text-left rounded-3xl border-2 p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${amount === value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}>
            <div className="flex items-center justify-between mb-6"><AntCoin className="w-12 h-12" /><span aria-hidden="true" className={`w-6 h-6 rounded-full border flex items-center justify-center ${amount === value ? 'bg-primary border-primary text-white' : 'border-border'}`}>{amount === value && <Check size={15} />}</span></div>
            <p className="text-2xl font-black text-foreground">{value.toLocaleString('ko-KR')} <span className="text-sm font-bold">앤트</span></p><p className="text-muted-foreground mt-2">{won(antPrice(value))}</p>
          </button>)}
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15} />체험을 위해 결제 정보나 카드 번호를 입력할 필요가 없습니다.</p>
      </section>
      <aside aria-labelledby="summary-title" className="rounded-3xl border border-border bg-card p-6 space-y-6 lg:sticky lg:top-6">
        <h2 id="summary-title" className="font-black text-lg text-foreground">선택 내역</h2>
        <dl className="space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">선택한 앤트</dt><dd className="font-bold text-foreground">{amount.toLocaleString('ko-KR')} 앤트</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">앤트당 가격</dt><dd className="text-foreground">{won(ANT_PRICE_KRW)}</dd></div><div className="flex items-center justify-between gap-4 border-t border-border pt-5"><dt className="font-bold text-foreground">체험 기준 금액</dt><dd className="text-2xl font-black text-primary">{won(antPrice(amount))}</dd></div></dl>
        <button type="button" onClick={() => void charge()} disabled={busy || previewed} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-3.5 font-bold hover:bg-primary/90 disabled:opacity-60">{busy ? '충전 중…' : previewed ? '충전 완료' : '무료 체험 충전하기'}{!previewed && <ArrowRight size={17} />}</button>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {previewed && <div role="status" className="rounded-xl bg-emerald-500/10 p-4 text-sm space-y-2"><p className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={17} />앤트 충전이 완료되었습니다.</p><p className="text-muted-foreground leading-relaxed">{amount.toLocaleString('ko-KR')} 앤트가 지급되었습니다. 실제 결제는 발생하지 않았습니다.</p></div>}
        <p className="text-xs leading-relaxed text-muted-foreground">체험 충전은 서버 운영 설정에 따라 일시적으로 중단될 수 있습니다.</p>
      </aside>
    </div>
  </div>;
}
