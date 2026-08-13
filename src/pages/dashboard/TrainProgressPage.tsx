import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  XCircle, 
  ChevronRight
} from 'lucide-react';

export default function TrainProgressPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const totalEpisodes = 200;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate(`/dashboard/projects/${projectId}/train/${jobId}/result`);
          }, 1000);
          return 100;
        }
        return prev + 1;
      });

      setCurrentEpisode(prev => {
        if (prev >= totalEpisodes) return totalEpisodes;
        return prev + 2;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [projectId, jobId, navigate]);

  const handleCancel = () => {
    if (confirm('정말로 학습을 취소하시겠습니까?')) {
      navigate(`/dashboard/projects/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                <span>Project</span>
                <ChevronRight className="w-3 h-3" />
                <span>Job {jobId}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary font-black italic">Training</span>
              </nav>
              <h1 className="text-2xl font-black text-foreground tracking-tight">모델 학습 중</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Strict prototype structure) */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-card rounded-[3rem] border border-border shadow-2xl shadow-primary/5 p-16 space-y-12">
          <h1 className="text-3xl font-black text-foreground text-center tracking-tight">모델 학습 중</h1>

          {/* Progress Bar Container */}
          <div className="space-y-6">
            <div className="w-full bg-muted rounded-full h-4 p-1 shadow-inner border border-border overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out shadow-lg shadow-primary/30"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-6xl font-black text-primary text-center tracking-tighter italic tabular-nums">
              {progress}%
            </p>
          </div>

          {/* Current Step (Gray box from prototype) */}
          <div className="bg-muted rounded-3xl p-10 border border-border text-center space-y-2">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">현재 단계</p>
            <p className="text-2xl font-black text-foreground tracking-tight">
              Episode 생성 중... <span className="text-primary italic ml-2">({currentEpisode}/{totalEpisodes})</span>
            </p>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleCancel}
              className="px-10 py-4 border-2 border-red-100 text-red-500 rounded-2xl font-black text-sm hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
            >
              작업 취소하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
