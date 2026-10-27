import { useState } from 'react';
import type { InspectionDetailResponse } from '../../store/useExpertStore';
import { AssetCover } from './DataView';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
export default function ExpertTargetDetails({ detail }: { detail: InspectionDetailResponse }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const data = detail.targetType === 'RECIPE' ? detail.recipe : detail.dataset;
  const src = detail.targetType === 'RECIPE' ? detail.recipe?.bannerUrl : detail.targetType === 'UPLOADED_DATA' ? detail.dataset?.bannerImageUrl : detail.previewUrl;
  return <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
    <h2 className="text-xl font-bold">{data?.title ?? '증강 결과 미리보기'}{data?.isDeleted && ' · 삭제됨'}</h2>
    <div className="max-h-96 overflow-hidden rounded-xl"><AssetCover src={src} title={data?.title ?? '증강 결과'} dataset={detail.targetType !== 'RECIPE'}/></div>
    {data?.description && <p className="whitespace-pre-wrap text-sm">{data.description}</p>}
    {detail.reason && <p className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm">요청 메모: {detail.reason}</p>}
    {detail.targetType === 'RECIPE' && <dl className="space-y-3 text-sm">{Object.entries({ ...(detail.recipe?.overview ?? {}), ...(detail.recipe?.settings ?? {}) }).map(([key,value]) => <div key={key} className="rounded-xl bg-muted p-3"><dt className="font-bold">{key}</dt><dd className="mt-2 whitespace-pre-wrap break-words">{Array.isArray(value) ? value.join(' · ') : value == null ? '미등록' : String(value)}</dd></div>)}</dl>}
    {detail.targetType === 'UPLOADED_DATA' && <><dl className="grid grid-cols-2 gap-3 text-sm">{['category','license','format','imageType','resolution','classes','fileName','fileSize','usageExample'].map(key => <div key={key}><dt className="text-muted-foreground">{key}</dt><dd className="whitespace-pre-wrap break-words">{String(detail.dataset?.[key] ?? '미등록')}</dd></div>)}</dl><button disabled={busy || !detail.dataset?.fileId || detail.dataset.isDeleted} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50" onClick={async () => {
      if (busy) return;
      const popup = window.open('', '_blank'); setBusy(true); setError(null);
      try { const response = await api.post(`/files/${detail.dataset!.fileId}/download`); const url = response.data?.data?.presignedUrl; if (!url) throw new Error('다운로드 주소가 없습니다.'); if (popup) { popup.opener = null; popup.location.href = url; } else window.location.assign(url); }
      catch (err) { popup?.close(); setError(requestMessage(err)); } finally { setBusy(false); }
    }}>{busy ? '다운로드 준비 중…' : '데이터셋 다운로드'}</button></>}
    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
  </section>;
}
