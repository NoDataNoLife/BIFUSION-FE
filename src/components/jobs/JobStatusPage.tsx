import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock3, LoaderCircle } from 'lucide-react';
import { useJobPolling } from '../../hooks/useJobPolling';
import type { JobStatus } from '../../store/useJobStore';

interface JobStatusPageProps {
  title: string;
  resultSection: 'jobs' | 'train' | 'inference';
}

const statusLabels: Record<JobStatus, string> = {
  PENDING: '대기 중',
  STARTED: '실행 중',
  RUNNING: '실행 중',
  SUCCESS: '완료',
  COMPLETED: '완료',
  FAILED: '실패',
  CANCELLED: '취소됨',
};

export default function JobStatusPage({ title, resultSection }: JobStatusPageProps) {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const { job, status, currentStep, error, isPolling } = useJobPolling({
    jobId,
    onComplete: () => {
      navigate(`/dashboard/projects/${projectId}/${resultSection}/${jobId}/result`, { replace: true });
    },
  });

  const failed = status === 'FAILED' || status === 'CANCELLED';
  const complete = status === 'SUCCESS' || status === 'COMPLETED';
  const label = !jobId ? '작업 번호 없음' : error ? '상태 확인 필요' : status ? statusLabels[status] : '상태 확인 중';
  const Icon = error || failed || !jobId ? AlertCircle : complete ? CheckCircle2 : status === 'PENDING' ? Clock3 : LoaderCircle;
  const description = !jobId
    ? '프로젝트에서 작업을 선택해 주세요.'
    : error
    ? error
    : failed
    ? job?.error || '작업이 완료되지 않았습니다.'
    : currentStep || (status === 'PENDING' ? '서버에서 실행 순서를 기다리고 있습니다.' : status ? '서버가 작업을 처리하고 있습니다.' : '서버에서 작업 상태를 확인하고 있습니다.');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <button type="button" aria-label="프로젝트로 돌아가기" onClick={() => navigate(`/dashboard/projects/${projectId}`)} className="p-2 rounded-xl hover:bg-muted cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm text-muted-foreground">작업 {jobId || '미선택'}</p>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <section aria-live="polite" className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center space-y-6">
          <Icon aria-hidden="true" className={`w-12 h-12 mx-auto ${error || failed ? 'text-red-500' : 'text-primary'} ${isPolling && status !== 'PENDING' ? 'animate-spin' : ''}`} />
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">{label}</h2>
            <p role={error || failed ? 'alert' : undefined} className="text-muted-foreground break-words">{description}</p>
            {error && <p className="text-sm text-muted-foreground">연결 오류는 작업 실패를 의미하지 않습니다. 상태를 다시 확인하고 있습니다.</p>}
          </div>
          <p className="text-sm text-muted-foreground">프로젝트로 돌아가도 진행 중인 작업은 취소되지 않습니다.</p>
          <button type="button" onClick={() => navigate(`/dashboard/projects/${projectId}`)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold cursor-pointer hover:bg-primary/90">
            프로젝트로 돌아가기
          </button>
        </section>
      </main>
    </div>
  );
}
