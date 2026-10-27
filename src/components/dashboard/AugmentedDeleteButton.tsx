import { useEffect, useRef, useState } from 'react';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useAuthStore } from '../../store/useAuthStore';
import type { ProjectJobItem } from '../../lib/projectJobs';
import type { ProjectDetail } from '../../store/useProjectStore';
export default function AugmentedDeleteButton({ projectId, datasetId, jobCode, onDeleted }: { projectId: string | number; datasetId: string | number; jobCode?: string; onDeleted: () => void }) {
  const userId = useAuthStore(s => s.user?.userId);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController(); setAllowed(false); setError(null);
    const permission = async () => {
      const project = await api.get<{ data: ProjectDetail }>(`/projects/${projectId}`, { signal: controller.signal });
      if (project.data.data.members.some(m => m.userId === userId && m.role === 'MANAGER')) { if (!controller.signal.aborted) setAllowed(true); return; }
      if (!jobCode) return;
      const response = await api.get(`/projects/${projectId}/jobs`, { params: { type: 'AUGMENTATION', keyword: jobCode, size: 20 }, signal: controller.signal });
      const jobs = response.data?.data?.items as ProjectJobItem[] | undefined;
      if (!controller.signal.aborted) setAllowed(!!jobs?.some(j => j.jobCode === jobCode && j.createdBy?.userId === userId));
    };
    void permission().catch(() => { /* Hide destructive action when permission cannot be established. */ });
    return () => controller.abort();
  }, [projectId, datasetId, jobCode, userId]);
  if (!allowed) return null;
  return <div className="space-y-2"><button type="button" disabled={busy} className="text-sm font-bold text-red-500 underline disabled:opacity-50" onClick={async () => {
    if (lock.current || !confirm('증강 결과 파일을 삭제할까요? 학습 선택지에서 제외되며 복구할 수 없습니다. 기존 학습 모델과 작업 기록은 유지됩니다.')) return;
    lock.current = true; setBusy(true); setError(null);
    try { await api.delete(`/projects/${projectId}/augmented-datasets/${datasetId}`); void useAuthStore.getState().fetchUser(); onDeleted(); }
    catch (err) {
      const response = (err as { response?: { status?: number } }).response;
      if (response?.status === 404) onDeleted();
      else setError(response?.status === 409 ? '전문가가 검수 중입니다. 검수가 끝난 뒤 삭제해 주세요.' : requestMessage(err));
    } finally { lock.current = false; setBusy(false); }
  }}>{busy ? '삭제 중…' : '증강 데이터 삭제'}</button>{error && <p role="alert" className="text-xs text-red-500">{error}</p>}</div>;
}
