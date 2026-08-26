import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight
} from 'lucide-react';

export default function InferenceProgressPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const totalImages = location.state?.totalImages || 50;
  
  const [progress, setProgress] = useState(0);
  const [processedImages, setProcessedImages] = useState(0);

  useEffect(() => {
    const duration = 5000; // 5 seconds
    const interval = 100;
    const steps = duration / interval;
    const progressIncrement = 100 / steps;
    const imageIncrement = totalImages / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            navigate(`/dashboard/projects/${projectId}/inference/${jobId}/result`, { state: { totalImages } });
          }, 1000);
          return 100;
        }
        return Math.min(prev + progressIncrement, 100);
      });

      setProcessedImages(prev => Math.min(prev + imageIncrement, totalImages));
    }, interval);

    return () => clearInterval(timer);
  }, [projectId, jobId, navigate, totalImages]);

  const handleCancel = () => {
    if (confirm('정말로 추론을 취소하시겠습니까?')) {
      navigate(`/dashboard/projects/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
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
                <span className="text-primary font-black italic">Inference</span>
              </nav>
              <h1 className="text-2xl font-black text-foreground tracking-tight">AI 모델 추론 중</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-card rounded-4xl border border-border shadow-2xl shadow-primary/5 p-12 md:p-16 space-y-12">
          <h1 className="text-3xl font-black text-foreground text-center tracking-tight">이미지 분류 중</h1>

          {/* Progress Bar Container */}
          <div className="space-y-6">
            <div className="w-full bg-muted rounded-full h-4 p-1 shadow-inner border border-border overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out shadow-lg shadow-primary/30"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-6xl font-black text-primary text-center tracking-tighter italic tabular-nums">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Current Step */}
          <div className="bg-muted/50 rounded-3xl p-8 md:p-10 border border-border text-center space-y-2">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">현재 상태</p>
            <p className="text-2xl font-black text-foreground tracking-tight">
              추론 중... <span className="text-primary italic ml-2">({Math.floor(processedImages)}/{totalImages} 이미지)</span>
            </p>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleCancel}
              className="px-10 py-4 border border-red-500/30 text-red-400 rounded-2xl font-black text-sm hover:bg-red-500/10 transition-all active:scale-95 cursor-pointer"
            >
              작업 취소하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
