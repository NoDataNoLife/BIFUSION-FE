import { deleteDatasetWithRefund } from '../../lib/pointActions';
import InspectionPanel from '../community/InspectionPanel';
import { useState } from 'react';
import { ArrowLeft, Download, Edit, Trash2, FileText, Code, Info, ShieldCheck } from 'lucide-react';
import { AssetCover, DataState } from './DataView';
import ReactMarkdown from 'react-markdown';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuthStore } from '../../store/useAuthStore';
import type { DatasetDetailResponse } from '../../store/useCommunityStore';
import ExpertVerificationCard, { type VerificationStatus } from '../community/ExpertVerificationCard';
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
  if (loading) return <div className="p-8"><DataState loading /></div>;
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
  const status = (['NONE', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].includes(data.inspectionStatus ?? '') ? data.inspectionStatus : 'NONE') as VerificationStatus;
  return <div className="min-h-screen bg-background">
    <div className="bg-card border-b border-border sticky top-0 z-10"><div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm"><ArrowLeft size={18}/>목록으로 돌아가기</button>
      <div className="flex flex-wrap gap-3">{own && <><button disabled={busy} onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl font-bold text-sm"><Edit size={18}/>수정</button><button disabled={busy} onClick={() => { if (confirm('데이터셋을 삭제하시겠습니까?')) void run(async () => { await deleteDatasetWithRefund(datasetId); onBack(); }); }} className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl text-red-500 font-bold text-sm"><Trash2 size={18}/>삭제</button></>}
        <button disabled={busy || !data.fileId} onClick={download} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 text-sm"><Download size={18}/>{busy ? '처리 중…' : data.fileId ? '데이터셋 다운로드' : '다운로드 파일 없음'}</button>
      </div>
    </div></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {actionError && <p role="alert" className="p-4 bg-red-500/10 text-red-500 rounded-2xl">{actionError}</p>}
      <section className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8"><div className="w-28 h-28 overflow-hidden [&>div]:min-h-0 bg-primary/10 rounded-4xl flex items-center justify-center shrink-0"><AssetCover src={data.bannerImageUrl} title={data.title} dataset/></div><div className="flex-1 space-y-4"><h1 className="text-3xl sm:text-4xl font-black tracking-tight break-words">{data.title}</h1><p className="text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">{data.description}</p><div className="flex flex-wrap gap-2">{data.tags?.map(tag => <span key={tag} className="px-4 py-1.5 bg-muted text-muted-foreground rounded-xl text-xs font-bold border border-border">{tag}</span>)}</div>{data.isExpertVerified && <span className="inline-flex items-center gap-2 text-primary text-xs font-black"><ShieldCheck size={16}/>전문가 검증 완료</span>}</div></div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border text-center">{[['파일 크기',data.fileSize],['파일 수',data.fileCount?.toLocaleString()],['다운로드',data.downloadCount?.toLocaleString()],['파일 형식',data.format]].map(([label,value]) => <div key={label}><dt className="text-xs font-bold text-muted-foreground mb-2">{label}</dt><dd className="text-xl font-black break-words">{value ?? '—'}</dd></div>)}</dl>
      </section>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm"><h2 className="text-xl font-black mb-6 flex items-center gap-3"><FileText className="text-primary"/>등록된 파일</h2>{data.fileName ? <div className="flex items-center justify-between gap-3 p-5 bg-muted rounded-2xl"><div className="min-w-0"><p className="font-bold break-all">{data.fileName}</p><p className="text-xs text-muted-foreground mt-1">{data.fileSize || '용량 정보 없음'} · {data.format || '형식 미등록'}</p></div><button aria-label="등록된 파일 다운로드" disabled={busy || !data.fileId} onClick={download} className="p-3 text-primary bg-card rounded-xl disabled:opacity-50"><Download size={20}/></button></div> : <p className="text-sm text-muted-foreground">등록된 파일 정보가 없습니다.</p>}<p className="text-xs text-muted-foreground mt-4">압축 파일의 내부 구성은 다운로드 후 확인할 수 있어요.</p></section>
          <section className="bg-gray-900 rounded-[2.5rem] p-6 sm:p-10 shadow-xl space-y-6"><h2 className="text-xl font-black text-white flex items-center gap-3"><Code className="text-primary"/>작성자 활용 가이드</h2><div className="bg-black/30 rounded-2xl p-6 text-sm text-gray-300 overflow-x-auto prose prose-invert max-w-none"><ReactMarkdown>{data.usageExample || '작성자가 아직 활용 가이드를 등록하지 않았습니다.'}</ReactMarkdown></div></section>
        </div>
        <aside className="space-y-8">
          <section className="bg-card rounded-4xl p-8 border border-border shadow-sm"><h2 className="text-lg font-black flex items-center gap-2 mb-6"><Info size={18} className="text-primary"/>상세 정보</h2><dl className="space-y-4">{[['라이선스',data.license],['업로드 날짜',data.createdAt ? new Date(data.createdAt).toLocaleDateString('ko-KR') : null],['해상도',data.resolution],['클래스',data.classes],['작성자',data.author?.nickname]].map(([label,value]) => <div key={label} className="flex justify-between gap-4 text-sm"><dt className="text-muted-foreground shrink-0">{label}</dt><dd className="font-bold text-right break-words">{value || '미등록'}</dd></div>)}</dl></section>
          <section className="bg-primary/5 rounded-4xl p-8 border border-primary/10"><h2 className="text-lg font-black text-primary mb-3">데이터 활용 안내</h2><p className="text-sm text-muted-foreground leading-relaxed">데이터를 사용하기 전에 작성자가 등록한 라이선스와 활용 가이드를 확인해 주세요.</p></section>
          {data.inspectionTarget ? <InspectionPanel target={data.inspectionTarget} title={data.title} reload={reload}/> : <ExpertVerificationCard status={status} onViewResults={() => setShowResult(true)} />}
        </aside>
      </div>
    </div>
    {showResult && <VerificationResultModal result={data.inspectionResult} assetTitle={data.title} onClose={() => setShowResult(false)}/>}
    {editing && <div className="fixed inset-0 z-50 bg-black/60 p-6 overflow-auto"><div className="max-w-4xl mx-auto bg-card rounded-3xl"><DatasetCreateForm context="EDIT_ASSET" initialData={data} onClose={() => { setEditing(false); reload(); }}/></div></div>}
  </div>;
}
