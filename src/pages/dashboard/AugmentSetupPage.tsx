import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle,
  ChevronRight,
  Play,
  FolderUp,
  Settings2,
  Image as ImageIcon,
  Info
} from 'lucide-react';

export default function AugmentSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();

  const [imagesPerClass, setImagesPerClass] = useState('10');
  const [samplingSteps, setSamplingSteps] = useState('100');
  const [guidanceScale, setGuidanceScale] = useState('7.5');
  const [fixedSeed, setFixedSeed] = useState(false);
  
  const [normalFiles, setNormalFiles] = useState<File[]>([]);
  const [anomalyFiles, setAnomalyFiles] = useState<File[]>([]);

  const handleNormalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNormalFiles(Array.from(e.target.files));
    }
  };

  const handleAnomalyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnomalyFiles(Array.from(e.target.files));
    }
  };

  const handleStartAugmentation = () => {
    // 실제 구현 시 백엔드 API 호출 후 Progress 페이지로 이동
    navigate(`/dashboard/projects/${projectId}/jobs/${jobId}/progress`);
  };

  const isValid = normalFiles.length >= 5 && anomalyFiles.length >= 5;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Section */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6">
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
                <span className="text-primary">Setup</span>
              </nav>
              <h1 className="text-2xl font-black text-foreground tracking-tight">데이터 증강 설정</h1>
            </div>

            <div className="ml-auto">
              <button
                onClick={handleStartAugmentation}
                disabled={!isValid}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isValid
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                증강 시작하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-lg mb-1 tracking-tight">데이터 증강이란?</h3>
            <p className="text-muted-foreground font-medium leading-relaxed text-sm">
              업로드한 소량의 Support 이미지를 기반으로 AI가 추가 학습 데이터를 대량으로 생성하여, 최종 AI 모델의 진단 성능과 강건성을 크게 향상시킵니다.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <FolderUp className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Support 데이터 업로드</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Normal Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-foreground uppercase tracking-widest">
                  Normal (정상) <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${normalFiles.length >= 5 ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {normalFiles.length}장 업로드 됨
                </span>
              </div>
              <label className="block group">
                <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  normalFiles.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted hover:border-primary/50 hover:bg-primary/5'
                }`}>
                  <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className={`w-8 h-8 ${normalFiles.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-black text-foreground mb-1">클릭하거나 파일을 드래그하세요</p>
                  <p className="text-sm text-muted-foreground font-medium">JPG, PNG 파일 포맷 지원</p>
                  <input type="file" accept="image/*" multiple onChange={handleNormalFileChange} className="hidden" />
                </div>
              </label>
              {normalFiles.length < 5 && (
                <p className="flex items-center gap-1.5 text-sm font-bold text-red-500">
                  <AlertCircle className="w-4 h-4" /> 최소 5장의 이미지가 필요합니다.
                </p>
              )}
            </div>

            {/* Anomaly Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-foreground uppercase tracking-widest">
                  Anomaly (비정상) <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${anomalyFiles.length >= 5 ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {anomalyFiles.length}장 업로드 됨
                </span>
              </div>
              <label className="block group">
                <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  anomalyFiles.length > 0 ? 'border-orange-400/50 bg-orange-50' : 'border-border bg-muted hover:border-orange-400/50 hover:bg-orange-50'
                }`}>
                  <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className={`w-8 h-8 ${anomalyFiles.length > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-black text-foreground mb-1">클릭하거나 파일을 드래그하세요</p>
                  <p className="text-sm text-muted-foreground font-medium">JPG, PNG 파일 포맷 지원</p>
                  <input type="file" accept="image/*" multiple onChange={handleAnomalyFileChange} className="hidden" />
                </div>
              </label>
              {anomalyFiles.length < 5 && (
                <p className="flex items-center gap-1.5 text-sm font-bold text-red-500">
                  <AlertCircle className="w-4 h-4" /> 최소 5장의 이미지가 필요합니다.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Parameters Section */}
        <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-900 text-white rounded-2xl">
              <Settings2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">하이퍼파라미터 설정</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-black text-foreground uppercase tracking-widest">
                생성 이미지 수 (클래스당)
              </label>
              <select
                value={imagesPerClass}
                onChange={(e) => setImagesPerClass(e.target.value)}
                className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all appearance-none"
              >
                <option value="5">5장</option>
                <option value="10">10장</option>
                <option value="20">20장</option>
                <option value="50">50장</option>
                <option value="100">100장</option>
              </select>
              <p className="text-sm font-medium text-muted-foreground">
                총 예상 생성 이미지: <span className="font-bold text-primary">{parseInt(imagesPerClass) * 2}장</span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-black text-foreground uppercase tracking-widest">
                Sampling Steps
              </label>
              <select
                value={samplingSteps}
                onChange={(e) => setSamplingSteps(e.target.value)}
                className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all appearance-none"
              >
                <option value="50">50</option>
                <option value="100">100 (표준)</option>
                <option value="150">150</option>
                <option value="200">200 (고품질)</option>
              </select>
              <p className="text-sm font-medium text-muted-foreground">값이 높을수록 품질이 향상되나 시간이 더 소요됩니다.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-black text-foreground uppercase tracking-widest">
                Guidance Scale
              </label>
              <select
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(e.target.value)}
                className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all appearance-none"
              >
                <option value="5.0">5.0</option>
                <option value="7.5">7.5 (권장)</option>
                <option value="10.0">10.0</option>
                <option value="12.5">12.5</option>
              </select>
              <p className="text-sm font-medium text-muted-foreground">원본 이미지의 특성을 얼마나 강하게 반영할지 결정합니다.</p>
            </div>

            <div className="flex items-center mt-6">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-14 h-8 rounded-full p-1 transition-colors ${fixedSeed ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`w-6 h-6 bg-card rounded-full transition-transform shadow-sm ${fixedSeed ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" checked={fixedSeed} onChange={(e) => setFixedSeed(e.target.checked)} className="hidden" />
                <div>
                  <span className="block text-sm font-black text-foreground uppercase tracking-widest group-hover:text-primary transition-colors">시드 고정 (재현성)</span>
                  <span className="text-sm font-medium text-muted-foreground">동일한 조건에서 같은 이미지를 다시 생성합니다.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
