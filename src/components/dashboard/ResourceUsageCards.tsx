import { HardDrive, Zap } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatBytes } from '../../lib/liveData';
import { usagePercent, type ResourceUsage } from '../../lib/backendContracts';

export function ResourceUsageSummary({ data, loading, error, onRetry }: {
  data: ResourceUsage | null; loading: boolean; error: string | null; onRetry: () => void;
}) {
  const date = (value: string) => new Date(value).toLocaleDateString('ko-KR', {
    timeZone: data?.timezone || 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric',
  });
  const cards = [
    { title: '스토리지', Icon: HardDrive, used: data?.storageUsedBytes, limit: data?.storageLimitBytes,
      format: formatBytes, description: '클라우드 저장 공간',
      note: data?.storageUnmeasuredFileCount ? `크기 미확인 파일 ${data.storageUnmeasuredFileCount}개는 합계에서 제외됩니다.` : null },
    { title: '월간 증강', Icon: Zap, used: data?.monthlyAugmentations, limit: data?.monthlyAugmentationLimit,
      format: (value: number) => `${value.toLocaleString()}회`, description: '진행 중 포함 · 실패·취소 제외', note: null },
  ];
  return <>{cards.map(({ title, Icon, used, limit, format, description, note }) => {
    const percent = usagePercent(used, limit);
    return <DashboardCard key={title} className="p-7 rounded-3xl border border-border space-y-5">
      <div className="flex items-center gap-3"><div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center"><Icon className="w-6 h-6 text-primary" /></div><div><h4 className="font-black">{title}</h4><p className="text-xs text-muted-foreground">{description}</p></div></div>
      {loading ? <p role="status">사용량 조회 중…</p> : error ? <div role="alert" className="text-sm text-red-500"><p>{error}</p><button onClick={onRetry} className="mt-2 underline">다시 시도</button></div> : <>
        <p className="text-xl font-black">{used == null ? '집계하지 못했습니다' : format(used)}</p>
        {used == null && <button onClick={onRetry} className="text-sm text-primary underline">다시 조회</button>}
        <p className="text-xs text-muted-foreground">{limit == null ? '별도 한도 없이 사용량만 표시합니다.' : `한도 ${format(limit)}`}</p>
        {percent != null && <div role="progressbar" aria-label={`${title} 사용률`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${percent}%` }} /></div>}
        {note && <p className="text-xs text-amber-600">{note}</p>}
        {title === '월간 증강' && data?.periodStart && data.periodEnd && <p className="text-xs text-muted-foreground">{date(data.periodStart)}부터 {date(data.periodEnd)} 전까지 ({data.timezone || 'Asia/Seoul'})</p>}
      </>}
    </DashboardCard>;
  })}</>;
}

export default function ResourceUsageCards() {
  const query = useApiQuery<ResourceUsage>('/users/me/resource-usage');
  return <ResourceUsageSummary {...query} onRetry={query.reload} />;
}
