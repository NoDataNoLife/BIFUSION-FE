import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardCheck, Clock3, FlaskConical, Search, X } from 'lucide-react';
import { AssetCover, DataState } from '../../components/dashboard/DataView';
import type { InspectionTarget, RequestedInspection, RequestedInspectionStatus } from '../../types/requestedInspection';

const targetLabels: Record<InspectionTarget, string> = { RECIPE: '레시피', UPLOADED_DATA: '원본 데이터셋', AUGMENTED_DATA: '증강 데이터셋' };
const statusMeta: Record<RequestedInspectionStatus, { label: string; style: string }> = {
  PENDING: { label: '검수 대기', style: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  IN_PROGRESS: { label: '검수 중', style: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  APPROVED: { label: '승인', style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  REJECTED: { label: '반려', style: 'bg-red-500/10 text-red-700 dark:text-red-300' },
};
// Shown only after the user explicitly enables the UI preview. Never sent to an API.
const previewItems: RequestedInspection[] = [
  { inspectionId: 104, target: { type: 'AUGMENTED_DATA', id: 3, name: '[예시] OCT 증강 데이터셋', imageUrl: null }, status: 'PENDING', requestedAt: '2026-10-26T09:30:00+09:00', completedAt: null, expert: null, result: null },
  { inspectionId: 103, target: { type: 'UPLOADED_DATA', id: 2, name: '[예시] 원본 이미지 데이터셋', imageUrl: null }, status: 'IN_PROGRESS', requestedAt: '2026-10-25T14:00:00+09:00', completedAt: null, expert: { nickname: '예시 전문가' }, result: null },
  { inspectionId: 102, target: { type: 'RECIPE', id: 1, name: '[예시] 이미지 노이즈 감소 레시피', imageUrl: null }, status: 'APPROVED', requestedAt: '2026-10-24T10:00:00+09:00', completedAt: '2026-10-25T11:00:00+09:00', expert: { nickname: '예시 전문가' }, result: { comment: '전처리 순서와 설정이 검수 기준에 적합합니다. 다른 데이터에 적용할 때에는 입력 이미지의 크기를 확인해 주세요.' } },
  { inspectionId: 101, target: { type: 'AUGMENTED_DATA', id: 4, name: '[예시] 추가 확인이 필요한 증강 데이터', imageUrl: null }, status: 'REJECTED', requestedAt: '2026-10-23T10:00:00+09:00', completedAt: '2026-10-24T16:00:00+09:00', expert: { nickname: '예시 전문가' }, result: { comment: '일부 이미지에서 구조가 흐려지는 현상이 보여 반려했습니다. 생성 설정을 조정하고 결과 이미지를 다시 확인해 주세요.' } },
];
const date = (value: string) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(value));

function InspectionDetails({ item, onClose }: { item: RequestedInspection; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  const status = statusMeta[item.status];
  return <dialog ref={ref} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="inspection-detail-title" className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/50">
    <div className="flex items-start justify-between gap-4 border-b border-border p-6">
      <div><p className="mb-2 text-xs font-bold text-primary">화면 미리보기 · 예시 요청 #{item.inspectionId}</p><h2 id="inspection-detail-title" className="text-xl font-bold">검수 요청 상세</h2></div>
      <button onClick={onClose} aria-label="검수 상세 닫기" className="rounded-xl p-2 hover:bg-muted"><X size={20}/></button>
    </div>
    <div className="space-y-6 p-6">
      <div className="aspect-video overflow-hidden rounded-2xl"><AssetCover src={item.target.imageUrl} title={item.target.name} dataset={item.target.type !== 'RECIPE'}/></div>
      <div><p className="mb-2 text-sm text-muted-foreground">{targetLabels[item.target.type]}</p><h3 className="break-words text-lg font-bold">{item.target.name}</h3></div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-sm">
        <dt className="text-muted-foreground">진행 상태</dt><dd><span className={`rounded-full px-3 py-1 text-xs font-bold ${status.style}`}>{status.label}</span></dd>
        <dt className="text-muted-foreground">요청일</dt><dd>{date(item.requestedAt)}</dd>
        <dt className="text-muted-foreground">담당 전문가</dt><dd>{item.expert?.nickname ?? '배정 대기'}</dd>
        {item.completedAt && <><dt className="text-muted-foreground">완료일</dt><dd>{date(item.completedAt)}</dd></>}
      </dl>
      <section className="rounded-2xl border border-border bg-muted/40 p-5" aria-label="검수 의견">
        <h3 className="mb-3 font-bold">{item.status === 'REJECTED' ? '반려 사유' : '검수 의견'}</h3>
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{item.result?.comment ?? (item.status === 'PENDING' ? '전문가 배정을 기다리고 있습니다. 검수가 완료되면 이곳에서 결과를 확인할 수 있습니다.' : '전문가가 검수 중입니다. 완료되면 검수 의견을 확인할 수 있습니다.')}</p>
      </section>
      <p className="text-xs text-muted-foreground">실제 검수 결과가 아닌 화면 구성 확인용 예시입니다.</p>
    </div>
  </dialog>;
}

export default function RequestedInspectionsPage() {
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<'ALL' | RequestedInspectionStatus>('ALL');
  const [target, setTarget] = useState<'ALL' | InspectionTarget>('ALL');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<RequestedInspection | null>(null);
  const items = preview ? previewItems : [];
  const filtered = items.filter(item => (status === 'ALL' || item.status === status) && (target === 'ALL' || item.target.type === target) && item.target.name.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase()));
  return <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-8">
    <Link to="/dashboard/assets" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft size={16}/> 내 자산으로</Link>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-xs font-bold tracking-widest text-primary">MY INSPECTIONS</p><h1 className="text-2xl font-black sm:text-3xl">내가 요청한 검수</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">레시피와 데이터셋의 검수 진행 상황과 전문가 의견을 확인하세요.</p></div>
      <Link to="/dashboard/assets" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold hover:bg-muted">검수할 자산 찾기 <ArrowRight size={16}/></Link>
    </header>
    <div role="status" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex gap-3"><FlaskConical className="mt-0.5 shrink-0 text-primary" size={20}/><div><p className="text-sm font-bold">{preview ? '예시 데이터로 화면을 미리 보고 있습니다' : '검수 요청 목록 연결 준비 중'}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{preview ? '아래 요청과 검수 의견은 실제 계정의 내역이 아닙니다.' : '아직 실제 요청 내역을 조회하지 않습니다. 예시로 목록과 결과 화면을 확인할 수 있습니다.'}</p></div></div>
      <button aria-pressed={preview} onClick={() => { setPreview(!preview); setSelected(null); }} className="shrink-0 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/20">{preview ? '미리보기 닫기' : '예시 화면 보기'}</button>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {(Object.entries(statusMeta) as [RequestedInspectionStatus, typeof statusMeta[RequestedInspectionStatus]][]).map(([key, meta]) => <div key={key} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{meta.label}</p><p className="mt-3 text-2xl font-black">{preview ? items.filter(item => item.status === key).length : '—'}<span className="ml-1 text-xs font-medium text-muted-foreground">건</span></p></div>)}
    </div>
    <section aria-label="검수 요청 목록" className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-48 flex-1"><Search aria-hidden="true" size={18} className="absolute left-4 top-3.5 text-muted-foreground"/><span className="sr-only">검수 대상 이름 검색</span><input value={keyword} onChange={event => setKeyword(event.target.value)} disabled={!preview} placeholder="검수 대상 이름 검색" className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50"/></label>
        <label><span className="sr-only">검수 대상 유형</span><select value={target} disabled={!preview} onChange={event => setTarget(event.target.value as typeof target)} className="rounded-xl border border-border bg-card px-4 py-3 text-sm disabled:opacity-50"><option value="ALL">모든 대상</option>{Object.entries(targetLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      <div aria-label="검수 상태 필터" className="flex gap-2 overflow-x-auto pb-1">
        {(['ALL', 'PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'] as const).map(key => <button key={key} disabled={!preview} aria-pressed={status === key} onClick={() => setStatus(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50 ${status === key ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-muted'}`}>{key === 'ALL' ? '전체' : statusMeta[key].label}</button>)}
      </div>
      {!preview ? <DataState title="실제 검수 내역은 연결 후 표시됩니다" description="목록 연동 전에는 요청 건수와 상태를 확인할 수 없습니다. 상단의 예시 화면 보기로 구성을 확인하세요."/> : filtered.length === 0 ? <DataState title="검색 조건에 맞는 검수가 없습니다" description="검색어나 대상 유형, 진행 상태를 변경해 보세요."/> : <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(item => <article key={item.inspectionId} className="flex flex-col rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3"><span className="text-xs font-bold text-muted-foreground">{targetLabels[item.target.type]}</span><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusMeta[item.status].style}`}>{statusMeta[item.status].label}</span></div>
          <div className="flex items-center gap-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl [&>div]:min-h-0 [&_svg]:h-8 [&_svg]:w-8"><AssetCover src={item.target.imageUrl} title={item.target.name} dataset={item.target.type !== 'RECIPE'}/></div><div className="min-w-0"><h2 className="break-words font-bold leading-6">{item.target.name}</h2><p className="mt-2 text-xs text-muted-foreground">예시 요청 #{item.inspectionId}</p></div></div>
          <div className="my-5 space-y-2 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Clock3 aria-hidden="true" size={15}/>{date(item.requestedAt)}</p><p>담당 전문가 · {item.expert?.nickname ?? '배정 대기'}</p></div>
          <button onClick={() => setSelected(item)} className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-bold hover:bg-primary/10 hover:text-primary"><ClipboardCheck size={17}/>{item.status === 'APPROVED' || item.status === 'REJECTED' ? '검수 결과 보기' : '요청 상세 보기'}<ArrowRight size={16}/></button>
        </article>)}
      </div>}
    </section>
    {selected && <InspectionDetails item={selected} onClose={() => setSelected(null)}/>}
  </div>;
}
