import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Play, 
  MessageSquare, 
  ChevronRight,
  TrendingUp,
  Target,
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  HardDrive
} from 'lucide-react';

import { useJobStore, getJobErrorMessage, type JobDetail } from '../../store/useJobStore';

interface Comment {
  id: string;
  user: string;
  time: string;
  content: string;
  avatar: string;
}

export default function TrainResultPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const { currentJob, fetchJobStatus } = useJobStore();

  const [job, setJob] = useState<JobDetail | null>(
    currentJob?.jobId === jobId ? currentJob : null
  );
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: '김성한',
      time: '이전 기록',
      content: '모델 성능 지표를 검토하고 필요시 추론 테스트를 진행해 주세요.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim'
    }
  ]);

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
        if (isMounted) setError(getJobErrorMessage(err, '학습 결과를 불러오지 못했습니다.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [jobId, fetchJobStatus]);

  const result = (job?.result ?? {}) as {
    trainedModelId?: number | string;
    trained_model_id?: number | string;
    kShot?: number;
    k_shot?: number;
    metrics?: {
      accuracy?: number;
      auroc?: number;
      loss?: number;
    };
    downloadUrl?: string | null;
    download_url?: string | null;
  };

  const trainedModelId = result.trainedModelId ?? result.trained_model_id;
  const kShot = result.kShot ?? result.k_shot;
  const metrics = result.metrics ?? {};
  const accuracy = typeof metrics.accuracy === 'number' ? (metrics.accuracy * 100).toFixed(1) : null;
  const auroc = typeof metrics.auroc === 'number' ? metrics.auroc.toFixed(3) : null;
  const loss = typeof metrics.loss === 'number' ? metrics.loss.toFixed(4) : null;
  const downloadUrl = result.downloadUrl ?? result.download_url ?? null;

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      alert('모델 가중치 다운로드 URL이 없거나 준비 중입니다.');
    }
  };

  const handleStartInference = () => {
    navigate(`/dashboard/projects/${projectId}/inference/new/setup`, {
      state: { trainedModelId }
    });
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: '사용자',
        time: '방금 전',
        content: newComment.trim(),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-semibold text-sm">학습 작업 결과를 불러오는 중입니다…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-xl mx-auto mt-20 p-8 bg-card border border-border rounded-3xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">학습 결과를 불러올 수 없습니다</h2>
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground cursor-pointer"
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
                학습 완료 리포트 {isSuccess && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-muted text-muted-foreground hover:text-foreground border border-border rounded-2xl font-bold text-sm transition-all shadow-sm cursor-pointer"
            >
              <Download size={18} />
              {downloadUrl ? '가중치 다운로드' : '가중치 (준비중)'}
            </button>
            {isSuccess && (
              <button 
                onClick={handleStartInference}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                모델 추론 시작 <Play className="w-4 h-4 fill-current ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {!isSuccess && (
          <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">학습이 아직 완료되지 않았습니다 (현재 상태: {job.status})</h3>
              <p className="text-xs text-muted-foreground">진행 상황 또는 에러 메시지를 확인해 주세요.</p>
            </div>
            <button
              onClick={() => navigate(`/dashboard/projects/${projectId}/train/${jobId}/progress`)}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
            >
              진행 상태 확인
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Accuracy (정확도)</p>
            <p className="text-3xl font-black text-foreground">
              {accuracy !== null ? `${accuracy}%` : '-'}
            </p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">학습 검증 성능</p>
          </div>

          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
              <TrendingUp size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">AUROC</p>
            <p className="text-3xl font-black text-foreground">
              {auroc !== null ? auroc : '-'}
            </p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">판별 지표</p>
          </div>

          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
              <Activity size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Loss (손실값)</p>
            <p className="text-3xl font-black text-foreground">
              {loss !== null ? loss : '-'}
            </p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">최종 손실</p>
          </div>

          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <HardDrive size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">학습 모델 ID</p>
            <p className="text-xl font-black text-foreground truncate">
              {trainedModelId ? `#${trainedModelId}` : '등록 확인 중'}
            </p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              {kShot ? `${kShot}-shot 설정` : 'Few-shot'}
            </p>
          </div>
        </div>

        {/* Interaction Section */}
        <div className="bg-card rounded-4xl p-10 border border-border shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted text-muted-foreground rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">팀 코멘트</h3>
          </div>

          {/* Comment Input */}
          <div className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="학습 결과에 대한 의견을 공유하세요..."
              className="w-full p-6 bg-muted/50 border border-border rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-foreground min-h-30"
            />
            <button 
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className={`absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-lg cursor-pointer ${
                newComment.trim() ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 bg-muted/40 rounded-2xl border border-border">
                <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{comment.user}</span>
                    <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
