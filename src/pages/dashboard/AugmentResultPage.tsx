import JobExecutionInputs from '../../components/jobs/JobExecutionInputs';
import { augmentationRecipeScreenEnabled } from '../../lib/backendFeatures';
import AugmentationRecipeForm from '../../components/community/forms/AugmentationRecipeForm';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Play, 

  ChevronRight,
  Clock,
  HardDrive,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

import JobStatusPage from '../../components/jobs/JobStatusPage';

import { useJobStore, getJobErrorMessage, type JobDetail } from '../../store/useJobStore';

export default function AugmentResultPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const { currentJob, fetchJobStatus } = useJobStore();

  const [job, setJob] = useState<JobDetail | null>(
    currentJob?.jobId === jobId ? currentJob : null
  );
  const [savingRecipe, setSavingRecipe] = useState(false);
  const recipeDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (savingRecipe) recipeDialog.current?.showModal(); }, [savingRecipe]);
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJobStatus(jobId);
        if (isMounted) setJob(data);
      } catch (err) {
        if (isMounted) setError(getJobErrorMessage(err, '작업 결과를 불러오지 못했습니다.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [jobId, fetchJobStatus]);

  const result = (job?.result ?? {}) as {
    datasetId?: number | string;
    dataset_id?: number | string;
    generatedCount?: number;
    generated_count?: number;
    totalSampleCount?: number;
    total_sample_count?: number;
    previewUrl?: string | null;
    preview_url?: string | null;
    downloadUrl?: string | null;
    download_url?: string | null;
    artifacts?: {
      dataset_url?: string;
      preview_url?: string;
      size_bytes?: number;
    };
  };

  const datasetId = result.datasetId ?? result.dataset_id;
  const generatedCount = result.generatedCount ?? result.generated_count ?? 0;
  const totalSampleCount = result.totalSampleCount ?? result.total_sample_count ?? generatedCount;
  const previewUrl = result.previewUrl ?? result.preview_url ?? result.artifacts?.preview_url ?? null;
  const downloadUrl = result.downloadUrl ?? result.download_url ?? result.artifacts?.dataset_url ?? null;

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      alert('다운로드 파일이 준비되지 않았거나 결과 파일을 제공할 수 없습니다. 잠시 후 다시 확인해 주세요.');
    }
  };

  const handleStartTrain = () => {
    navigate(`/dashboard/projects/${projectId}/train/new/setup`, {
      state: { datasetId }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-semibold text-sm">증강 작업 결과를 불러오는 중입니다…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-xl mx-auto mt-20 p-8 bg-card border border-border rounded-3xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">결과를 불러올 수 없습니다</h2>
          <p className="text-sm text-muted-foreground">{error ?? '해당 작업을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90"
          >
            프로젝트 홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isSuccess = job.status === 'SUCCESS' || job.status === 'COMPLETED';
  if (!isSuccess) return <JobStatusPage title="데이터 증강 상태" resultSection="jobs" />;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {savingRecipe && <dialog ref={recipeDialog} aria-label="내 레시피로 저장" onCancel={event => event.preventDefault()} className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-0 text-foreground backdrop:bg-black/60"><AugmentationRecipeForm context="ASSET" sourceJobId={Number(jobId)} onClose={() => setSavingRecipe(false)} onCreated={() => { setSavingRecipe(false); navigate('/dashboard/assets'); }}/></dialog>}
      {/* Header Section */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                <span>Project</span>
                <ChevronRight className="w-3 h-3" />
                <span>Job {jobId}</span>
                <ChevronRight className="w-3 h-3" />
                <span className={isSuccess ? "text-emerald-500 font-black" : "text-orange-500 font-black"}>
                  {job.status}
                </span>
              </nav>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                데이터 증강 결과 리포트 {isSuccess && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </h1>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              {augmentationRecipeScreenEnabled && <button onClick={() => setSavingRecipe(true)} className="rounded-2xl border border-border bg-card px-5 py-3 text-sm font-bold">내 레시피로 저장</button>}
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl font-bold text-sm text-foreground hover:bg-muted transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {downloadUrl ? '결과 파일 다운로드' : '다운로드 (준비중)'}
              </button>
              {isSuccess && (
                <button 
                  onClick={handleStartTrain}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
                >
                  모델 학습 시작 <Play className="w-4 h-4 fill-current ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <JobExecutionInputs key={job.jobId} job={job}/>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-3xl p-7 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mb-6">
              <ImageIcon size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">생성된 이미지 수</p>
            <p className="text-3xl font-black text-foreground mb-1">{generatedCount}장</p>
          </div>

          <div className="bg-card rounded-3xl p-7 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mb-6">
              <Clock size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">작업 일시</p>
            <p className="text-lg font-bold text-foreground mb-1">
              {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : '확인 중'}
            </p>
            <p className="text-xs font-bold text-muted-foreground">Seed: {String(job.seed ?? '미지정')}</p>
          </div>

          <div className="bg-card rounded-3xl p-7 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-6">
              <HardDrive size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">생성 데이터셋 ID</p>
            <p className="text-2xl font-black text-foreground mb-1">
              {datasetId ? `ID: ${datasetId}` : '데이터셋 등록 확인 중'}
            </p>
            <p className="text-xs font-bold text-muted-foreground">
              총 샘플 수: {totalSampleCount}장
            </p>
          </div>
        </div>

        {/* Results Preview Section */}
        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">증강 결과 미리보기</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                모델이 생성한 합성 이미지 결과물입니다.
              </p>
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
              >
                원본 이미지 보기 <ExternalLink size={14} />
              </a>
            )}
          </div>

          {previewUrl ? (
            <div className="rounded-3xl overflow-hidden border border-border bg-black/5 flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt="증강 생성 미리보기"
                className="max-h-[500px] w-auto object-contain rounded-2xl shadow-sm"
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-2 bg-muted/20">
              <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">미리보기 이미지가 준비되지 않았습니다</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                서버에서 미리보기 주소를 제공하지 않았습니다. 생성된 데이터셋 ID는 다음 학습 단계에서 그대로 사용할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        <div>
          {/* Quick Guide */}
          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 space-y-4">
            <h3 className="font-bold text-foreground text-lg">다음 권장 단계</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              증강된 데이터셋은 이 프로젝트의 고유 데이터셋 ID({datasetId ? `ID: ${datasetId}` : '생성 완료'})로 등록되었습니다. 상단의 <strong>[모델 학습 시작]</strong> 버튼을 누르면 해당 데이터셋이 자동으로 선택된 상태로 학습을 진행할 수 있습니다.
            </p>
            {isSuccess && (
              <button
                onClick={handleStartTrain}
                className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                모델 학습으로 이동 <Play size={14} className="fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
