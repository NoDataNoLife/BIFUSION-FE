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

import '../../components/jobs/AISetup.css';

import { getJobErrorMessage, useJobStore } from '../../store/useJobStore';

export default function AugmentSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const { createJob, isLoading } = useJobStore();

  const [imagesPerClass, setImagesPerClass] = useState('10');
  const [samplingSteps, setSamplingSteps] = useState('50');
  const [strength, setStrength] = useState('0.3');
  const [finetuneSteps, setFinetuneSteps] = useState('400');
  const [seed, setSeed] = useState('42');
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  const handleStartAugmentation = async () => {
    if (!isValid || isLoading || !projectId) return;
    setSubmitError(null);
    try {
      const job = await createJob(projectId, 'AUGMENTATION', {
        num_samples_per_class: Number(imagesPerClass),
        strength: Number(strength),
        finetune_steps: Number(finetuneSteps),
        steps: Number(samplingSteps),
        ...(fixedSeed ? { seed: Number(seed) } : {}),
        normalCount: normalFiles.length,
        anomalyCount: anomalyFiles.length,
      });
      navigate(`/dashboard/projects/${projectId}/jobs/${job.jobId}/progress`);
    } catch (err) {
      setSubmitError(getJobErrorMessage(err, '증강 요청에 실패했습니다. 설정을 확인하고 다시 시도해 주세요.'));
    }
  };

  const isValid = !!projectId && normalFiles.length >= 5 && anomalyFiles.length >= 5
    && Number.isInteger(Number(imagesPerClass)) && Number(imagesPerClass) > 0
    && strength !== '' && Number(strength) >= 0 && Number(strength) <= 1
    && finetuneSteps !== '' && Number.isInteger(Number(finetuneSteps)) && Number(finetuneSteps) >= 0
    && Number.isInteger(Number(samplingSteps)) && Number(samplingSteps) > 0
    && (!fixedSeed || (seed !== '' && Number.isSafeInteger(Number(seed)) && Number(seed) >= 0));

  return (
    <div className="ai-setup min-h-screen bg-background text-foreground pb-20">
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
              <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                <span>Project</span>
                <ChevronRight className="w-3 h-3" />
                <span>{jobId === 'new' ? 'New Job' : `Job ${jobId}`}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">Setup</span>
              </nav>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">데이터 증강 설정</h1>
            </div>

            <div className="ml-auto">
              <button
                onClick={handleStartAugmentation}
                disabled={!isValid || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isValid
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                {isLoading ? '요청 중…' : '증강 시작하기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {submitError && <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">{submitError}</p>}
        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg mb-1 tracking-tight">데이터 증강이란?</h3>
            <p className="text-muted-foreground font-medium leading-relaxed text-sm">
              Support(참고 이미지)를 바탕으로 정상·비정상 학습 이미지를 추가로 생성합니다. 생성 결과의 품질과 학습 효과는 실제 실행 후 확인해야 합니다.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <FolderUp className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Support 데이터 업로드</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Normal Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Normal (정상) <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${normalFiles.length >= 5 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {normalFiles.length}장 선택됨
                </span>
              </div>
              <label className="block group">
                <div className={`border-2 border-dashed rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  normalFiles.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted hover:border-primary/50 hover:bg-primary/5'
                }`}>
                  <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className={`w-8 h-8 ${normalFiles.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-semibold text-foreground mb-1">클릭해서 파일을 선택하세요</p>
                  <p className="text-sm text-muted-foreground font-medium">JPG, PNG 파일 포맷 지원</p>
                  <input type="file" accept="image/jpeg,image/png" multiple onChange={handleNormalFileChange} className="hidden" />
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
                <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Anomaly (비정상) <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${anomalyFiles.length >= 5 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {anomalyFiles.length}장 선택됨
                </span>
              </div>
              <label className="block group">
                <div className={`border-2 border-dashed rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  anomalyFiles.length > 0 ? 'border-orange-400/50 bg-primary/5' : 'border-border bg-muted hover:border-orange-400/50 hover:bg-primary/5'
                }`}>
                  <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className={`w-8 h-8 ${anomalyFiles.length > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-semibold text-foreground mb-1">클릭해서 파일을 선택하세요</p>
                  <p className="text-sm text-muted-foreground font-medium">JPG, PNG 파일 포맷 지원</p>
                  <input type="file" accept="image/jpeg,image/png" multiple onChange={handleAnomalyFileChange} className="hidden" />
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

        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-7">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Settings2 className="w-5 h-5" /></div>
            <div><h2 className="text-xl font-semibold">생성 설정</h2><p className="text-sm text-muted-foreground mt-1">처음에는 기본값으로 시작하고, 필요한 항목만 조절하세요.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div className="space-y-3">
              <label htmlFor="augment-count" className="block text-sm font-semibold">종류별 생성 이미지 수</label>
              <select id="augment-count" value={imagesPerClass} onChange={e => setImagesPerClass(e.target.value)} className="ai-field">
                {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}장</option>)}
              </select>
              <p className="text-sm text-muted-foreground">정상·비정상 각각 추가로 생성합니다.</p>
              <p className="text-sm font-semibold text-primary">총 {Number(imagesPerClass) * 2}장 추가 생성</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="augment-strength-slider" className="text-sm font-semibold">변화 강도 <span className="text-muted-foreground font-normal">Strength</span></label>
                <input id="augment-strength" aria-label="변화 강도 직접 입력" type="number" min="0" max="1" step="0.05" value={strength} onChange={e => setStrength(e.target.value)} className="ai-value-input" />
              </div>
              <input id="augment-strength-slider" className="ai-range" type="range" min="0" max="1" step="0.05" value={strength === '' ? 0 : Number(strength)} onChange={e => setStrength(e.target.value)} aria-describedby="strength-description" style={{ '--range-fill': `${Math.min(100, Math.max(0, Number(strength) * 100))}%` } as React.CSSProperties} />
              <div className="flex justify-between text-xs text-muted-foreground"><span>0 · 원본에 가깝게</span><span>1 · 변화가 크게</span></div>
              <p id="strength-description" className="text-sm text-muted-foreground">원본에 넣는 노이즈의 비율입니다. 기본값 0.3. 슬라이더 또는 숫자로 조절할 수 있습니다.</p>
            </div>
          </div>
          <details className="ai-advanced" open>
            <summary>고급 설정 <span className="font-normal text-muted-foreground text-sm">· 추가 학습과 생성 계산</span></summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <div className="space-y-3">
                <label htmlFor="augment-finetune" className="block text-sm font-semibold">추가 학습 횟수 <span className="text-muted-foreground font-normal">Fine-tune Steps</span></label>
                <input id="augment-finetune" type="number" min="0" step="1" value={finetuneSteps} onChange={e => setFinetuneSteps(e.target.value)} className="ai-field" />
                <p className="text-sm text-muted-foreground">참고 이미지에 생성 모델을 적응시키는 횟수입니다. 기본 400회, 0은 추가 학습 생략입니다.</p>
              </div>
              <div className="space-y-3">
                <label htmlFor="augment-steps" className="block text-sm font-semibold">생성 단계 <span className="text-muted-foreground font-normal">Steps</span></label>
                <input id="augment-steps" type="number" min="1" step="1" value={samplingSteps} onChange={e => setSamplingSteps(e.target.value)} className="ai-field" />
                <p className="text-sm text-muted-foreground">이미지를 만드는 계산 횟수입니다. 기본 50회. 늘리면 실행 시간이 길어질 수 있습니다.</p>
              </div>
            </div>
          </details>
          <div className="border-t border-border pt-5">
            <div className="flex items-start justify-between gap-5">
              <div><label htmlFor="augment-fixed-seed" className="text-sm font-semibold cursor-pointer">시드 고정 <span className="font-normal text-muted-foreground">Seed</span></label><p className="text-sm text-muted-foreground mt-1">무작위 계산 시작값을 고정해 같은 환경에서 결과 재현을 돕습니다.</p></div>
              <input id="augment-fixed-seed" type="checkbox" role="switch" checked={fixedSeed} onChange={e => setFixedSeed(e.target.checked)} className="ai-switch mt-1" />
            </div>
            {fixedSeed && <div className="mt-4 flex items-center gap-4"><label htmlFor="augment-seed" className="text-sm text-muted-foreground">시드 값</label><input id="augment-seed" type="number" min="0" step="1" value={seed} onChange={e => setSeed(e.target.value)} className="ai-field max-w-48" /></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
