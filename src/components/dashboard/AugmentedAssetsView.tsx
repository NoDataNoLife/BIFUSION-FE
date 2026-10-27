import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataState } from './DataView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { requestMessage } from '../../lib/liveData';
import { cancelInspection, requestInspection, type AugmentedDataset } from '../../lib/backendContracts';
import type { ProjectResponseData } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import VerificationRequestModal from '../community/modals/VerificationRequestModal';
import VerificationResultModal from '../community/modals/VerificationResultModal';

export function AugmentedInspectionCard({ item, projectId, onRefresh }: {
  item: AugmentedDataset; projectId: number; onRefresh: () => void;
}) {
  const target = item.inspectionTarget;
  const [modal, setModal] = useState<'request' | 'result' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { fetchUser } = useAuthStore();
  const refreshPoints = () => { void fetchUser(); };
  const title = item.jobCode || `증강 작업 ${item.datasetId}`;
  const status = { PENDING: '검수 대기', IN_PROGRESS: '검수 중', APPROVED: '검수 승인', REJECTED: '검수 반려', CANCELLED: '신청 취소' };
  const cancel = async () => {
    const id = target?.inspectionRequestId;
    if (busy || id == null || !confirm('검수 시작 전인 신청만 취소할 수 있습니다. 취소하고 앤트를 환불받을까요?')) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const result = await cancelInspection(id);
      setNotice(`검수 신청 #${result.inspectionRequestId}을 취소했습니다.`);
      refreshPoints(); onRefresh();
    } catch (err) { setError(requestMessage(err)); }
    finally { setBusy(false); }
  };
  return <article className="bg-card rounded-3xl border border-border overflow-hidden">
    {item.previewUrl && <img src={item.previewUrl} alt={`${title} 증강 미리보기`} className="w-full h-48 object-contain bg-muted" />}
    <div className="p-6 space-y-4">
      <h3 className="font-black text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">총 {item.totalSampleCount}장 · 생성 {item.generatedCount}장</p>
      {target && <p className="text-sm font-bold">{target.status ? status[target.status] : '검수 신청 이력 없음'}</p>}
      {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
      {notice && <p role="status" className="text-primary text-sm">{notice}</p>}
      <div className="flex flex-wrap gap-3 text-sm font-bold">
        <Link className="text-primary underline" to={`/dashboard/projects/${projectId}/jobs/${item.datasetId}/result`}>증강 결과·다운로드</Link>
        {target?.canRequest && <button disabled={busy} onClick={() => { setError(null); setModal('request'); }} className="text-primary underline">전문가 검수 신청</button>}
        {target?.result && <button onClick={() => setModal('result')} className="text-primary underline">검수 결과 보기</button>}
        {target?.status === 'PENDING' && target.inspectionRequestId != null && <button disabled={busy} className="text-red-500 underline disabled:opacity-50" onClick={() => void cancel()}>검수 신청 취소</button>}
      </div>
      {!target && <p className="text-xs text-muted-foreground">이 데이터셋은 검수 신청 대상이 아닙니다.</p>}
      {target?.status === 'PENDING' && <p className="text-xs text-muted-foreground">전문가가 검수를 시작했다면 신청을 취소할 수 없습니다.</p>}
    </div>
    {modal === 'request' && target && <VerificationRequestModal minReward={target.minRewardPoints} maxReward={target.maxRewardPoints} assetTitle={title} onClose={() => setModal(null)} onSubmit={async (reason, reward) => {
      const result = await requestInspection(target, reason, reward);
      setModal(null); setNotice(`검수 신청 #${result.inspectionRequestId}이 접수되었습니다.`);
      refreshPoints(); onRefresh();
    }} />}
    {modal === 'result' && <VerificationResultModal assetTitle={title} result={target?.result} onClose={() => setModal(null)} />}
  </article>;
}

function ProjectDatasets({ projectId, searchQuery }: { projectId: number; searchQuery: string }) {
  const query = useApiQuery<AugmentedDataset[]>(`/projects/${projectId}/augmented-datasets`);
  if (query.loading || query.error) return <DataState loading={query.loading} error={query.error} onRetry={query.reload} />;
  const items = (query.data ?? []).filter(item => (item.jobCode || String(item.datasetId)).toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="space-y-4">
    <button onClick={query.reload} className="text-sm text-primary underline">증강 결과·검수 상태 새로고침</button>
    {items.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{items.map(item => <AugmentedInspectionCard key={item.datasetId} item={item} projectId={projectId} onRefresh={query.reload} />)}</div> : <DataState title="표시할 증강 결과가 없습니다" description="프로젝트에서 증강을 완료하거나 다른 검색어를 입력해 주세요." />}
  </div>;
}

export default function AugmentedAssetsView({ searchQuery }: { searchQuery: string }) {
  const projects = useApiQuery<ProjectResponseData>('/projects');
  const [selectedProject, setSelectedProject] = useState('');
  if (projects.loading || projects.error) return <DataState loading={projects.loading} error={projects.error} onRetry={projects.reload} />;
  const items = [...new Map([...(projects.data?.managingProjects ?? []), ...(projects.data?.participatingProjects ?? [])].map(p => [p.projectId, p])).values()];
  if (!items.length) return <DataState title="참여 중인 프로젝트가 없습니다" />;
  const projectId = items.some(p => String(p.projectId) === selectedProject) ? Number(selectedProject) : items[0].projectId;
  return <section className="space-y-6">
    <label className="flex flex-wrap items-center gap-3 font-bold">프로젝트
      <select value={projectId} onChange={event => setSelectedProject(event.target.value)} className="bg-card border border-border rounded-xl p-3">{items.map(p => <option key={p.projectId} value={p.projectId}>{p.title}</option>)}</select>
    </label>
    <ProjectDatasets key={projectId} projectId={projectId} searchQuery={searchQuery} />
  </section>;
}
