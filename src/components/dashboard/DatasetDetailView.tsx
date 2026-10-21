import { useState } from 'react';
import { ArrowLeft, Download, Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuthStore } from '../../store/useAuthStore';
import type { DatasetDetailResponse } from '../../store/useCommunityStore';
import DatasetCreateForm from '../community/forms/DatasetCreateForm';
import VerificationResultModal from '../community/modals/VerificationResultModal';

export default function DatasetDetailView({ datasetId, onBack }: { datasetId: number; onBack: () => void }) {
  const { data, error, loading, reload } = useApiQuery<DatasetDetailResponse>(`/datasets/${datasetId}`);
  const { user } = useAuthStore();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setActionError(null);
    try { await action(); } catch (err) { setActionError(requestMessage(err, '요청을 처리하지 못했습니다.')); } finally { setBusy(false); }
  };
  if (loading) return <div className="p-8">데이터셋을 불러오는 중…</div>;
  if (error || !data) return <div className="p-8 space-y-4"><p role="alert">{error || '데이터셋이 없습니다.'}</p><button onClick={reload}>다시 시도</button><button onClick={onBack}>목록으로</button></div>;
  const own = user?.userId === data.author?.userId;
  const download = () => void run(async () => {
    if (!data.fileId) throw new Error('등록된 다운로드 파일이 없습니다.');
    // Open synchronously to keep the browser popup policy from dropping the download.
    const popup = window.open('', '_blank');
    try {
      const res = await api.post(`/files/${data.fileId}/download`);
      const url = res.data?.data?.presignedUrl;
      if (typeof url !== 'string' || !url) throw new Error('다운로드 주소를 확인할 수 없습니다.');
      if (popup) { popup.opener = null; popup.location.href = url; }
      else window.location.assign(url);
    } catch (err) { popup?.close(); throw err; }
  });
  return <main className="p-8 max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between gap-4"><button onClick={onBack} className="flex gap-2"><ArrowLeft size={18}/>목록으로</button><div className="flex gap-4">
      <button disabled={busy || !data.fileId} onClick={download} className="flex gap-2 text-primary disabled:opacity-50"><Download size={18}/>{data.fileId ? '데이터셋 다운로드' : '다운로드 파일 없음'}</button>
      {own && <><button onClick={() => setEditing(true)} className="flex gap-2"><Edit size={18}/>수정</button><button disabled={busy} onClick={() => { if (confirm('데이터셋을 삭제하시겠습니까?')) void run(async () => { await api.delete(`/datasets/${datasetId}`); onBack(); }); }} className="flex gap-2 text-red-500"><Trash2 size={18}/>삭제</button></>}
    </div></div>
    {actionError && <p role="alert" className="text-red-500">{actionError}</p>}
    <section className="p-8 bg-card border border-border rounded-3xl space-y-5"><h1 className="text-3xl font-bold">{data.title}</h1><p className="whitespace-pre-wrap">{data.description}</p>
      <p className="text-muted-foreground">{data.author?.nickname || '탈퇴한 사용자'} · {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '작성일 정보 없음'}</p>
      <div className="flex gap-2 flex-wrap">{data.tags?.map((tag) => <span key={tag} className="px-3 py-1 bg-muted rounded-lg">{tag}</span>)}</div>
    </section>
    <section className="p-8 bg-card border border-border rounded-3xl"><h2 className="font-bold text-xl mb-4">파일 정보</h2><dl className="grid md:grid-cols-2 gap-4">{[['파일명',data.fileName],['용량',data.fileSize],['파일 수',data.fileCount],['형식',data.format],['라이선스',data.license],['해상도',data.resolution]].map(([label,value]) => <div key={label} className="p-3 bg-muted rounded-xl"><dt className="text-sm text-muted-foreground">{label}</dt><dd>{value ?? '정보 없음'}</dd></div>)}</dl></section>
    <section className="p-8 bg-card border border-border rounded-3xl space-y-4"><h2 className="text-xl font-bold">작성자 활용 가이드</h2><div className="prose dark:prose-invert max-w-none"><ReactMarkdown>{data.usageExample || '등록된 활용 가이드가 없습니다.'}</ReactMarkdown></div></section>
    <section className="p-8 bg-card border border-border rounded-3xl space-y-4"><h2 className="text-xl font-bold">전문가 검증</h2><p>{data.isExpertVerified ? '검증 결과가 등록되었습니다.' : '검증 완료 정보가 없습니다.'}</p>{data.inspectionResult && <button className="text-primary" onClick={() => setShowResult(true)}>검증 결과 보기</button>}<p className="text-sm text-muted-foreground">현재 검수 신청은 프로젝트의 증강 데이터만 지원합니다.</p></section>
    {showResult && <VerificationResultModal result={data.inspectionResult} assetTitle={data.title} onClose={() => setShowResult(false)}/>}
    {editing && <div className="fixed inset-0 z-50 bg-black/60 p-6 overflow-auto"><div className="max-w-4xl mx-auto bg-card rounded-3xl"><DatasetCreateForm context="EDIT_ASSET" initialData={data} onClose={() => { setEditing(false); reload(); }}/></div></div>}
  </main>;
}
