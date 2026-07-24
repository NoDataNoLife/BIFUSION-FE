import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  XCircle, 
  ChevronRight,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AugmentProgressPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState(0);
  const [currentClass, setCurrentClass] = useState<'Normal' | 'Anomaly'>('Normal');
  const [message, setMessage] = useState('데이터 증강 작업을 준비 중입니다...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 5);
        if (next >= 100) {
          clearInterval(interval);
          setMessage('작업이 완료되었습니다! 결과를 정리하고 있습니다...');
          setTimeout(() => {
            navigate(`/dashboard/projects/${projectId}/jobs/${jobId}/result`);
          }, 1500);
          return 100;
        }
        
        // Update messages and class based on progress
        if (next < 10) setMessage('파라미터를 로드하고 있습니다...');
        else if (next < 50) {
          setCurrentClass('Normal');
          setMessage(`Normal 클래스 이미지 생성 중... (${Math.floor((next / 50) * 100)}%)`);
        }
        else if (next < 95) {
          setCurrentClass('Anomaly');
          setMessage(`Anomaly 클래스 이미지 생성 중... (${Math.floor(((next - 50) / 45) * 100)}%)`);
        }
        else setMessage('생성된 이미지를 저장하고 데이터셋을 구성 중입니다...');
        
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [projectId, jobId, navigate]);

  const handleCancel = () => {
    if (confirm('진행 중인 증강 작업을 중단하시겠습니까? 지금까지의 데이터는 저장되지 않습니다.')) {
      navigate(`/dashboard/projects/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                <span>Project</span>
                <ChevronRight className="w-3 h-3" />
                <span>Job {jobId}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary font-black italic">Progress</span>
              </nav>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI 데이터 증강 실행 중</h1>
            </div>
          </div>
          
          <button 
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-red-500 font-black text-sm hover:bg-red-50 rounded-xl transition-all active:scale-95"
          >
            <XCircle className="w-4 h-4" />
            중단하기
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-12">
          {/* Main Visual Card */}
          <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl shadow-primary/5 relative overflow-hidden group">
            {/* Background Animation */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              {/* Spinning Loader Container */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-gray-50 border-t-primary animate-spin-slow shadow-inner" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter italic tabular-nums">
                    {Math.floor(progress)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 w-full">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} />
                  <p className="text-2xl font-black text-gray-900 tracking-tight">{message}</p>
                </div>
                
                {/* Progress Bar Container */}
                <div className="w-full bg-gray-50 rounded-full h-4 p-1 shadow-inner border border-gray-100 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-lg shadow-primary/30 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Detail Stats */}
              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <div className={`p-6 rounded-3xl border transition-all ${currentClass === 'Normal' ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-gray-50 border-transparent opacity-40'}`}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Class</p>
                  <p className="text-xl font-black text-gray-900">Normal</p>
                </div>
                <div className={`p-6 rounded-3xl border transition-all ${currentClass === 'Anomaly' ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-gray-50 border-transparent opacity-40'}`}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Class</p>
                  <p className="text-xl font-black text-gray-900">Anomaly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Helper Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-4xl border border-gray-100 shadow-sm">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-sm tracking-tight mb-1">고성능 GPU 활성화</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">작업의 속도를 위해 BIFUSION의 전용 GPU 가속 서버가 현재 작업을 처리 중입니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-4xl border border-gray-100 shadow-sm">
              <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-sm tracking-tight mb-1">실시간 결과 확인</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">작업이 100% 완료되면 즉시 증강된 이미지를 검수하고 데이터셋으로 내보낼 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
