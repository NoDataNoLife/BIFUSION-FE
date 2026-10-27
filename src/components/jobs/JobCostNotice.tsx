import { Link } from 'react-router-dom';
import type { JobEstimate } from '../../hooks/useJobEstimate';
export default function JobCostNotice({ estimate }: { estimate: { data: JobEstimate | null; error: string | null; loading: boolean; reload: () => void } }) {
  return <div aria-live="polite" className="my-4 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
    {estimate.loading ? <p>예상 앤트 조회 중…</p> : estimate.error ? <p role="alert" className="text-red-500">{estimate.error} <button type="button" className="underline" onClick={estimate.reload}>비용 다시 조회</button></p> : estimate.data ? <><p className="font-bold">예상 비용 {estimate.data.cost.toLocaleString()} 앤트 · 보유 {estimate.data.currentPoints.toLocaleString()} 앤트</p><p className="text-xs text-muted-foreground">실패하거나 취소한 작업의 비용은 환불됩니다.</p>{!estimate.data.affordable && <p className="text-red-500">보유 앤트가 부족합니다.</p>}</> : <p>이미지를 선택하고 예상 비용을 먼저 확인해 주세요.</p>}
    <Link to="/dashboard/ants/topup" className="inline-block text-primary underline">앤트 충전</Link>
  </div>;
}
