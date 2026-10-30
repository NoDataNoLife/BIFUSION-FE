import { useState } from 'react';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useProjectJobs } from '../../../hooks/useProjectJobs';
import type { ProjectResponseData } from '../../../store/useProjectStore';
import { DataState } from '../../dashboard/DataView';
import { formatKst } from '../../../lib/kstDate';

function CompletedJobs({ projectId, busy, onSelect }: { projectId: string; busy: boolean; onSelect: (id: number) => void }) {
  const query = useProjectJobs(projectId, 'AUGMENTATION', 'SUCCESS');
  return <div className="space-y-3">{query.loadingJobs || query.jobsError ? <DataState loading={query.loadingJobs} error={query.jobsError} onRetry={query.fetchJobs}/> : query.jobs.length ? <>
    <div className="grid gap-2 sm:grid-cols-2">{query.jobs.map(job => <button key={job.jobId} type="button" disabled={busy || !Number.isSafeInteger(Number(job.jobId)) || Number(job.jobId) <= 0} onClick={() => onSelect(Number(job.jobId))} className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary disabled:opacity-60">
      <p className="font-bold">{job.jobCode || `JOB-${job.jobId}`}</p><p className="mt-1 text-xs text-muted-foreground">증강 완료 · {job.finishedAt ? formatKst(job.finishedAt) : job.createdAt ? formatKst(job.createdAt) : '날짜 정보 없음'}</p><p className="mt-2 text-xs text-primary">실행 설정 불러오기</p>
    </button>)}</div>
    {query.hasNext && <button type="button" disabled={busy} onClick={query.loadMoreJobs} className="rounded-lg border border-border px-4 py-2 text-sm">이전 작업 더 보기</button>}
  </> : <DataState title="완료된 증강 작업이 없습니다" description="이 프로젝트에서 증강을 완료하면 작업을 선택할 수 있습니다."/>}</div>;
}

export default function ProjectAugmentationPicker({ onSelect, onClose, busy }: { onSelect: (id: number) => void; onClose: () => void; busy: boolean }) {
  const [projectId, setProjectId] = useState('');
  const projects = useApiQuery<ProjectResponseData>('/projects');
  const items = [...new Map([...(projects.data?.managingProjects ?? []), ...(projects.data?.participatingProjects ?? [])].map(project => [project.projectId, project])).values()];
  return <section aria-label="프로젝트 증강 작업에서 불러오기" className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
    <div className="flex justify-between gap-3"><h4 className="font-bold">프로젝트의 증강 작업 선택</h4><button type="button" disabled={busy} onClick={onClose} className="text-sm text-muted-foreground">닫기</button></div>
    <p className="text-sm text-muted-foreground">참여 중인 프로젝트에서 완료된 증강 작업의 실제 설정을 가져옵니다. 입력 이미지와 결과 파일은 복사하지 않습니다.</p>
    {projects.loading || projects.error ? <DataState loading={projects.loading} error={projects.error} onRetry={projects.reload}/> : items.length ? <label className="block text-sm font-bold">프로젝트<select value={projectId} disabled={busy} onChange={event => setProjectId(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background p-3"><option value="">프로젝트를 선택해 주세요</option>{items.map(project => <option key={project.projectId} value={project.projectId}>{project.title}</option>)}</select></label> : <DataState title="참여 중인 프로젝트가 없습니다"/>}
    {projectId && <CompletedJobs key={projectId} projectId={projectId} busy={busy} onSelect={onSelect}/>}
  </section>;
}
