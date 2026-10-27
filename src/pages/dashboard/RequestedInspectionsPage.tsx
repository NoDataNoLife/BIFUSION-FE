import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardCheck, Search, X } from 'lucide-react';
import { AssetCover, DataState, Pagination } from '../../components/dashboard/DataView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { cancelInspection } from '../../lib/backendContracts';
import { requestMessage } from '../../lib/liveData';
import { formatKst } from '../../lib/kstDate';
import { useAuthStore } from '../../store/useAuthStore';
import type { InspectionTarget, RequestedInspection, RequestedInspectionPage, RequestedInspectionStatus } from '../../types/requestedInspection';

const root = '/inspections/me/requests';
const targets: Record<InspectionTarget, string> = { RECIPE: '레시피', UPLOADED_DATA: '원본 데이터셋', AUGMENTED_DATA: '증강 데이터셋' };
const statuses: Record<RequestedInspectionStatus, string> = { PENDING: '검수 대기', IN_PROGRESS: '검수 중', APPROVED: '승인', REJECTED: '반려' };
function Details({ id, close, refresh }: { id: number; close: () => void; refresh: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const query = useApiQuery<RequestedInspection>(`${root}/${id}`);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  const item = query.data;
  return <dialog ref={ref} onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }} aria-labelledby="inspection-title" className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/50">
    <div className="mb-6 flex items-center justify-between"><h2 id="inspection-title" className="text-xl font-bold">검수 요청 #{id}</h2><button disabled={busy} aria-label="검수 상세 닫기" onClick={close}><X/></button></div>
    {query.loading || query.error || !item ? <><DataState loading={query.loading} error={query.error} onRetry={query.reload}/>{query.error && <button className="mt-4 text-primary underline" onClick={() => { close(); refresh(); }}>목록으로 돌아가기·새로고침</button>}</> : <div className="space-y-5">
      <div className="aspect-video overflow-hidden rounded-xl"><AssetCover src={item.target.imageUrl} title={item.target.name} dataset={item.target.type !== 'RECIPE'}/></div>
      <p className="text-sm text-muted-foreground">{targets[item.target.type]} · {statuses[item.status]}{item.target.deleted && ' · 삭제됨'}</p><h3 className="text-lg font-bold">{item.target.name}</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-3 text-sm"><dt>신청일</dt><dd>{formatKst(item.requestedAt)}</dd><dt>담당 전문가</dt><dd>{item.expert?.nickname ?? '배정 대기'}</dd>{item.completedAt && <><dt>완료일</dt><dd>{formatKst(item.completedAt)}</dd></>}<dt>검수 보상</dt><dd>{item.rewardPoints?.toLocaleString() ?? '—'} 앤트</dd></dl>
      <section className="rounded-xl bg-muted/40 p-4"><h3 className="mb-2 font-bold">요청 메모</h3><p className="whitespace-pre-wrap break-words text-sm">{item.reason || '등록된 메모가 없습니다.'}</p></section>
      <section className="rounded-xl bg-muted/40 p-4"><h3 className="mb-2 font-bold">{item.status === 'REJECTED' ? '반려 사유' : '검수 의견'}</h3><p className="whitespace-pre-wrap break-words text-sm">{item.result?.comment ?? (item.status === 'APPROVED' ? '승인되었습니다. 별도 의견은 등록되지 않았습니다.' : item.status === 'REJECTED' ? '별도 반려 사유가 등록되지 않았습니다.' : '검수가 완료되면 결과를 확인할 수 있습니다.')}</p></section>
      {!item.target.deleted && item.target.type !== 'AUGMENTED_DATA' && <Link className="inline-block text-primary underline" to={`/dashboard/community?${item.target.type === 'RECIPE' ? 'recipeId' : 'datasetId'}=${item.target.id}`}>검수 대상 보기</Link>}
      {item.status === 'PENDING' && <button disabled={busy} className="block rounded-xl border border-border px-4 py-3 text-red-500 disabled:opacity-50" onClick={async () => {
        if (lock.current || !confirm('검수 신청을 취소하고 앤트를 환불받을까요?')) return;
        lock.current = true; setBusy(true); setError(null);
        try { await cancelInspection(id); void useAuthStore.getState().fetchUser(); close(); refresh(); }
        catch (err) { setError(requestMessage(err)); }
        finally { lock.current = false; setBusy(false); }
      }}>{busy ? '취소 중…' : '신청 취소'}</button>}
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    </div>}
  </dialog>;
}
export default function RequestedInspectionsPage() {
  const [status, setStatus] = useState<'ALL' | RequestedInspectionStatus>('ALL');
  const [target, setTarget] = useState<'ALL' | InspectionTarget>('ALL');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const query = useApiQuery<RequestedInspectionPage>(root, { status: status === 'ALL' ? undefined : status, targetType: target === 'ALL' ? undefined : target, keyword: search || undefined, page, size: 10 });
  const counts = useApiQuery<Record<RequestedInspectionStatus, number>>(`${root}/counts`);
  const refresh = () => { query.reload(); counts.reload(); };
  return <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-8">
    <Link to="/dashboard/assets" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/>내 자산으로</Link>
    <header className="flex flex-wrap justify-between gap-4"><div><p className="mb-2 text-xs font-bold tracking-widest text-primary">MY INSPECTIONS</p><h1 className="text-3xl font-black">내가 요청한 검수</h1><p className="mt-3 text-sm text-muted-foreground">요청한 레시피와 데이터셋의 최신 검수 상태를 확인하세요.</p></div><button onClick={refresh} className="rounded-xl border border-border px-4 py-2 text-sm">새로고침</button></header>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Object.entries(statuses).map(([key,label]) => <div key={key} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-black">{counts.loading || counts.error ? '—' : counts.data?.[key as RequestedInspectionStatus] ?? '—'}<span className="ml-1 text-xs font-normal">건</span></p></div>)}</div>
    {counts.error && <p role="alert" className="text-sm text-red-500">요약 건수를 불러오지 못했습니다. <button onClick={counts.reload} className="underline">다시 시도</button></p>}
    <form onSubmit={e => { e.preventDefault(); setPage(0); setSearch(keyword.trim()); }} className="flex flex-wrap gap-3"><label className="relative min-w-48 flex-1"><Search size={18} className="absolute left-4 top-3.5 text-muted-foreground"/><input aria-label="검수 대상 이름 검색" placeholder="검수 대상 이름 검색" value={keyword} onChange={e => setKeyword(e.target.value)} className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm"/></label><button className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">검색</button><select aria-label="검수 대상 유형" value={target} onChange={e => { setPage(0); setTarget(e.target.value as typeof target); }} className="rounded-xl border border-border bg-card px-4 py-3 text-sm"><option value="ALL">모든 대상</option>{Object.entries(targets).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></form>
    <div className="flex flex-wrap gap-2">{(['ALL', 'PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'] as const).map(key => <button key={key} aria-pressed={status === key} onClick={() => { setPage(0); setStatus(key); }} className={`rounded-full px-4 py-2 text-sm font-bold ${status === key ? 'bg-primary text-white' : 'border border-border bg-card text-muted-foreground'}`}>{key === 'ALL' ? '전체' : statuses[key]}</button>)}</div>
    {query.loading || query.error || !query.data?.content.length ? <DataState loading={query.loading} error={query.error} title="조건에 맞는 검수 요청이 없습니다" description="취소한 요청은 표시되지 않습니다. 검색 조건을 바꾸거나 자산에서 검수를 신청해 주세요." onRetry={query.reload}/> : <><div className="grid gap-4 md:grid-cols-2">{query.data.content.map(item => <article key={item.inspectionRequestId} className="space-y-4 rounded-3xl border border-border bg-card p-6"><p className="text-sm font-bold text-primary">{targets[item.target.type]} · {statuses[item.status]}</p><div className="flex items-center gap-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><AssetCover src={item.target.imageUrl} title={item.target.name} dataset={item.target.type !== 'RECIPE'}/></div><h2 className="break-words font-bold">{item.target.name}{item.target.deleted && <span className="ml-2 text-xs text-muted-foreground">삭제됨</span>}</h2></div><p className="text-xs text-muted-foreground">{formatKst(item.requestedAt)} · {item.expert?.nickname ?? '배정 대기'}</p><button onClick={() => setSelected(item.inspectionRequestId)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-bold"><ClipboardCheck size={16}/>{item.result ? '검수 결과 보기' : '요청 상세 보기'}<ArrowRight size={16}/></button></article>)}</div><Pagination page={query.data.page} totalPages={query.data.totalPages} totalElements={query.data.totalElements} onChange={setPage}/></>}
    {selected != null && <Details key={selected} id={selected} close={() => setSelected(null)} refresh={refresh}/>}
  </div>;
}
