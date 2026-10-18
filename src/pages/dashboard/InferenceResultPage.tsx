import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  MessageSquare, 
  ChevronRight,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

import { useJobStore, getJobErrorMessage, type JobDetail } from '../../store/useJobStore';

interface PredictionItem {
  fileId?: number;
  sampleIndex?: number;
  predictedClass: string;
  confidence: number;
  probabilities?: {
    normal: number;
    anomaly: number;
  };
}

interface Comment {
  id: string;
  user: string;
  time: string;
  content: string;
  avatar: string;
}

export default function InferenceResultPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const { currentJob, fetchJobStatus } = useJobStore();

  const [job, setJob] = useState<JobDetail | null>(
    currentJob?.jobId === jobId ? currentJob : null
  );
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState<string | null>(null);

  const [confidenceThreshold, setConfidenceThreshold] = useState(0.0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: '염승빈',
      time: '이전 기록',
      content: '추론 결과 신뢰도와 정상/이상 분포를 확인해 주세요.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom'
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
        if (isMounted) setError(getJobErrorMessage(err, '추론 결과를 불러오지 못했습니다.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [jobId, fetchJobStatus]);

  const rawResult = (job?.result ?? {}) as {
    predictions?: PredictionItem[];
  };

  const predictions: PredictionItem[] = Array.isArray(rawResult.predictions)
    ? rawResult.predictions
    : [];

  const totalCount = predictions.length;
  const normalPredictions = predictions.filter(
    (p) => p.predictedClass?.toUpperCase() === 'NORMAL'
  );
  const anomalyPredictions = predictions.filter(
    (p) => p.predictedClass?.toUpperCase() === 'ANOMALY'
  );
  const normalCount = normalPredictions.length;
  const anomalyCount = anomalyPredictions.length;
  const avgConfidence = totalCount > 0
    ? (predictions.reduce((acc, p) => acc + (p.confidence ?? 0), 0) / totalCount * 100).toFixed(1)
    : '0';

  const filteredPredictions = predictions.filter(
    (p) => (p.confidence ?? 0) >= confidenceThreshold
  );

  const handleDownloadJSON = () => {
    if (predictions.length === 0) {
      alert('다운로드할 추론 결과가 없습니다.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(predictions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `inference-results-job-${jobId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
        <p className="font-semibold text-sm">추론 작업 결과를 불러오는 중입니다…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-xl mx-auto mt-20 p-8 bg-card border border-border rounded-3xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">추론 결과를 불러올 수 없습니다</h2>
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
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
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
                추론 완료 리포트 {isSuccess && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={handleDownloadJSON}
              disabled={predictions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download size={18} />
              JSON 결과 다운로드
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {!isSuccess && (
          <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">추론 작업이 아직 완료되지 않았습니다 (현재 상태: {job.status})</h3>
              <p className="text-xs text-muted-foreground">진행 상황 또는 에러 메시지를 확인해 주세요.</p>
            </div>
            <button
              onClick={() => navigate(`/dashboard/projects/${projectId}/inference/${jobId}/progress`)}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
            >
              진행 상태 확인
            </button>
          </div>
        )}

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">총 추론 이미지</p>
            <p className="text-3xl font-black text-foreground">{totalCount}장</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">테스트 입력 수</p>
          </div>
          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm text-center">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Normal 예측</p>
            <p className="text-3xl font-black text-emerald-500">{normalCount}장</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              비율: {totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm text-center">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Anomaly 예측</p>
            <p className="text-3xl font-black text-orange-500">{anomalyCount}장</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              비율: {totalCount > 0 ? ((anomalyCount / totalCount) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div className="bg-card rounded-4xl p-7 border border-border shadow-sm text-center">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">평균 예측 신뢰도</p>
            <p className="text-3xl font-black text-primary">{avgConfidence}%</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Average Confidence</p>
          </div>
        </div>

        {/* Confidence Filter & Table Section */}
        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> 샘플별 예측 결과 상세
              </h3>
              <p className="text-xs text-muted-foreground">
                정답 라벨이 없는 환경이므로 모델의 예측 분류와 신뢰도(Confidence)를 제공합니다.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">신뢰도 필터:</span>
              <span className="text-xs font-bold text-primary">
                {(confidenceThreshold * 100).toFixed(0)}% 이상
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-28 cursor-pointer"
              />
            </div>
          </div>

          {filteredPredictions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm font-medium bg-muted/20 rounded-2xl border border-dashed border-border">
              {predictions.length === 0
                ? '등록된 추론 결과가 없습니다.'
                : '설정한 신뢰도 기준을 만족하는 예측 결과가 없습니다.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-5 py-3.5">샘플 번호</th>
                    <th className="px-5 py-3.5">예측 클래스</th>
                    <th className="px-5 py-3.5">신뢰도 (Confidence)</th>
                    <th className="px-5 py-3.5">정상 확률</th>
                    <th className="px-5 py-3.5">비정상 확률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPredictions.map((item, idx) => {
                    const isNormal = item.predictedClass?.toUpperCase() === 'NORMAL';
                    const sampleId = item.fileId ? `File #${item.fileId}` : `#${(item.sampleIndex ?? idx) + 1}`;
                    const confPct = ((item.confidence ?? 0) * 100).toFixed(1);
                    const normProb = item.probabilities ? `${(item.probabilities.normal * 100).toFixed(1)}%` : '-';
                    const anomProb = item.probabilities ? `${(item.probabilities.anomaly * 100).toFixed(1)}%` : '-';

                    return (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors font-medium">
                        <td className="px-5 py-4 font-bold text-foreground">{sampleId}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isNormal
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {item.predictedClass}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-primary">{confPct}%</td>
                        <td className="px-5 py-4 text-muted-foreground">{normProb}</td>
                        <td className="px-5 py-4 text-muted-foreground">{anomProb}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Interaction Section */}
        <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted text-muted-foreground rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">팀 코멘트</h3>
          </div>

          {/* Comment Input */}
          <div className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="추론 결과에 대한 소견이나 피드백을 남겨주세요..."
              className="w-full p-5 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-foreground min-h-24 text-sm"
            />
            <button 
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className={`absolute bottom-3 right-3 p-3 rounded-xl transition-all shadow-md cursor-pointer ${
                newComment.trim() ? 'bg-primary text-white hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3.5 p-4 bg-muted/40 rounded-2xl border border-border">
                <img src={comment.avatar} alt={comment.user} className="w-9 h-9 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs">{comment.user}</span>
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
