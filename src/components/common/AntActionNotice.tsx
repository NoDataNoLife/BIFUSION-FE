import { Link } from 'react-router-dom';
import { apiErrorCode } from '../../lib/apiErrorCode';
import { requestMessage } from '../../lib/liveData';

export function AntCostNotice({ cost, label, points }: { cost: number; label: string; points?: number }) {
  return <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
    <p>{label} 시 {cost.toLocaleString()} 앤트가 사용됩니다. <span className="text-muted-foreground">보유 {points == null ? '확인 필요' : points.toLocaleString()} 앤트</span></p>
    {points != null && points < cost && <p className="text-red-500">보유 앤트가 부족합니다. <Link to="/dashboard/ants/topup" className="font-bold underline">앤트 충전하기</Link></p>}
  </div>;
}
export function AntRequestError({ error, fallback }: { error: unknown; fallback?: string }) {
  if (!error) return null;
  return <div role="alert" className="space-y-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
    <p>{requestMessage(error, fallback)}</p>
    {apiErrorCode(error) === 'IS004' && <Link to="/dashboard/ants/topup" className="inline-block font-bold underline">앤트 충전하기</Link>}
  </div>;
}
