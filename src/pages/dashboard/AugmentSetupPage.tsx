import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { readAugmentationSettings, augmentationJobParameters } from '../../lib/augmentationRecipe';
import { augmentationRecipesEnabled } from '../../lib/backendFeatures';
import { requestMessage } from '../../lib/liveData';
import { useJobEstimate } from '../../hooks/useJobEstimate';
import JobCostNotice from '../../components/jobs/JobCostNotice';
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  Play,
  FolderUp,
  Settings2,
  Image as ImageIcon,
  Info,
  X,
  Loader2,
} from 'lucide-react';

import '../../components/jobs/AISetup.css';

import { getJobErrorMessage, useJobStore } from '../../store/useJobStore';
import { uploadTempFiles, validateImageFiles, type TempUploadedFile } from '../../lib/fileUpload';

export default function AugmentSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const { createJob, isLoading } = useJobStore();

  const [query] = useSearchParams();
  const recipeId = query.get('recipeId');
  const [recipeReady, setRecipeReady] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [imagesPerClass, setImagesPerClass] = useState('10');
  const [samplingSteps, setSamplingSteps] = useState('50');
  const [strength, setStrength] = useState('0.3');
  const [finetuneSteps, setFinetuneSteps] = useState('400');
  const [seed, setSeed] = useState('42');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fixedSeed, setFixedSeed] = useState(false);

  useEffect(() => {
    setRecipeReady(false); setRecipeError(null); setRecipeTitle('');
    if (!recipeId) return;
    if (!augmentationRecipesEnabled || !/^\d+$/.test(recipeId) || Number(recipeId) <= 0) { setRecipeError('레시피 연동을 사용할 수 없습니다.'); return; }
    const controller = new AbortController(); setRecipeLoading(true);
    api.get(`/community/recipes/${recipeId}`, { signal: controller.signal }).then(response => {
      if (controller.signal.aborted) return;
      const data = response.data?.data;
      if (response.data?.success === false || data?.isDeleted || data?.recipeId !== Number(recipeId)) throw new Error('레시피를 확인할 수 없습니다.');
      const settings = readAugmentationSettings(data.augmentationSettings);
      const parameters = augmentationJobParameters(settings);
      setImagesPerClass(String(parameters.num_samples_per_class)); setStrength(String(parameters.strength));
      setFinetuneSteps(String(parameters.finetune_steps)); setSamplingSteps(String(parameters.steps)); setSeed(String(parameters.seed)); setFixedSeed(true);
      setRecipeTitle(data.title); setRecipeReady(true);
    }).catch(error => { if (!controller.signal.aborted) setRecipeError(requestMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setRecipeLoading(false); });
    return () => controller.abort();
  }, [recipeId]);

  const [normalFiles, setNormalFiles] = useState<File[]>([]);
  const [anomalyFiles, setAnomalyFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadCache = useRef(new Map<File, TempUploadedFile>());
  const submitting = useRef(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleNormalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files);
      setNormalFiles((prev) => [...prev, ...incoming].slice(0, 10));
      e.target.value = '';
    }
  };

  const handleAnomalyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files);
      setAnomalyFiles((prev) => [...prev, ...incoming].slice(0, 10));
      e.target.value = '';
    }
  };

  const handleRemoveNormalFile = (indexToRemove: number) => {
    setNormalFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveAnomalyFile = (indexToRemove: number) => {
    setAnomalyFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const totalBytes = [...normalFiles, ...anomalyFiles].reduce((acc, f) => acc + f.size, 0);

  const isValid = (!recipeId || recipeReady) && !recipeLoading && !!projectId
    && normalFiles.length >= 5 && normalFiles.length <= 10
    && anomalyFiles.length >= 5 && anomalyFiles.length <= 10
    && totalBytes <= 20 * 1024 * 1024
    && Number.isInteger(Number(imagesPerClass)) && Number(imagesPerClass) >= 1 && Number(imagesPerClass) <= 100
    && strength !== '' && Number(strength) >= 0 && Number(strength) <= 1
    && finetuneSteps !== '' && Number.isInteger(Number(finetuneSteps)) && Number(finetuneSteps) >= 1 && Number(finetuneSteps) <= 1000
    && Number.isInteger(Number(samplingSteps)) && Number(samplingSteps) >= 1 && Number(samplingSteps) <= 200
    && (!fixedSeed || (seed !== '' && Number.isSafeInteger(Number(seed)) && Number(seed) >= 0 && Number(seed) <= 4294967295));

  const estimate = useJobEstimate(Number(imagesPerClass) >= 1 && Number(samplingSteps) >= 1 ? { type: 'AUGMENTATION', num_samples_per_class: Number(imagesPerClass), strength: Number(strength), finetune_steps: Number(finetuneSteps), steps: Number(samplingSteps), ...(fixedSeed ? { seed: Number(seed) } : {}) } : null);
  const handleStartAugmentation = async () => {
    if (!estimate.data?.affordable || !isValid || submitting.current || isUploading || isLoading || !projectId) return;
    setSubmitError(null);

    const normalValidation = validateImageFiles(normalFiles, { minCount: 5, maxCount: 10 });
    if (!normalValidation.valid) {
      setSubmitError(`정상 이미지 오류: ${normalValidation.error}`);
      return;
    }

    const anomalyValidation = validateImageFiles(anomalyFiles, { minCount: 5, maxCount: 10 });
    if (!anomalyValidation.valid) {
      setSubmitError(`비정상 이미지 오류: ${anomalyValidation.error}`);
      return;
    }

    if (totalBytes > 20 * 1024 * 1024) {
      setSubmitError('전체 이미지 용량이 20MB를 초과했습니다. 이미지 크기를 줄여주세요.');
      return;
    }

    submitting.current = true;
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploaded = await uploadTempFiles(
        [...normalFiles, ...anomalyFiles],
        (progress) => setUploadProgress(progress),
        uploadCache.current,
      );
      const normalUploaded = uploaded.slice(0, normalFiles.length);
      const anomalyUploaded = uploaded.slice(normalFiles.length);

      setUploadProgress(100);

      const normalFileIds = normalUploaded.map((f) => f.fileId);
      const anomalyFileIds = anomalyUploaded.map((f) => f.fileId);

      const job = await createJob(projectId, 'AUGMENTATION', {
        normalFileIds,
        anomalyFileIds,
        num_samples_per_class: Number(imagesPerClass),
        strength: Number(strength),
        finetune_steps: Number(finetuneSteps),
        steps: Number(samplingSteps),
        ...(fixedSeed ? { seed: Number(seed) } : {}),
      });

      setUploadProgress(100);
      navigate(`/dashboard/projects/${projectId}/jobs/${job.jobId}/progress`);
    } catch (err) {
      setSubmitError(getJobErrorMessage(err, '증강 요청에 실패했습니다. 설정을 확인하고 다시 시도해 주세요.'));
    } finally {
      submitting.current = false;
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

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
                disabled={!estimate.data?.affordable || !isValid || isUploading || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isValid && !isUploading && !isLoading
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isUploading || isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {isUploading
                  ? `업로드 중 (${uploadProgress ?? 0}%)`
                  : isLoading
                    ? '작업 접수 중…'
                    : '증강 시작하기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {recipeId && <div className="rounded-xl border border-border p-4">{recipeLoading ? <p role="status">레시피 설정을 불러오는 중…</p> : recipeError ? <p role="alert" className="text-red-500">{recipeError} <button onClick={() => navigate(`/dashboard/projects/${projectId}/jobs/new/setup`)} className="underline">레시피 없이 직접 설정</button></p> : <p role="status">불러온 레시피: {recipeTitle}. 입력 이미지를 선택해 주세요.</p>}</div>}
        <JobCostNotice estimate={estimate}/>
        {submitError && (
          <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-500 text-sm font-medium">
            {submitError}
          </p>
        )}

        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg mb-1 tracking-tight">데이터 증강이란?</h3>
            <p className="text-muted-foreground font-medium leading-relaxed text-sm">
              Support(참고 이미지)를 바탕으로 정상·비정상 학습 이미지를 추가로 생성합니다. 실제 모델 연산에 사용될 이미지는 서버 임시 저장소에 안전하게 등록된 후 증강 작업을 시작합니다.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <FolderUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight">Support 데이터 업로드</h2>
                <p className="text-xs text-muted-foreground mt-0.5">정상·비정상 이미지를 각각 5~10장(총 20MB 이하, JPG/PNG) 등록해 주세요.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Normal Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Normal (정상) <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${normalFiles.length >= 5 && normalFiles.length <= 10 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {normalFiles.length}/10장 {normalFiles.length >= 5 ? '✓' : '(최소 5장)'}
                </span>
              </div>
              <label className="block group">
                <div className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  normalFiles.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted hover:border-primary/50 hover:bg-primary/5'
                }`}>
                  <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className={`w-6 h-6 ${normalFiles.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {normalFiles.length >= 10 ? '최대 10장이 선택되었습니다' : '클릭해서 파일 추가'}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">JPG, PNG 파일 (개별 또는 다중 선택)</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    disabled={normalFiles.length >= 10 || isUploading}
                    onChange={handleNormalFileChange}
                    className="hidden"
                  />
                </div>
              </label>

              {/* Normal files preview list */}
              {normalFiles.length > 0 && (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {normalFiles.map((file, idx) => (
                    <div
                      key={`normal-${file.name}-${idx}`}
                      className="flex items-center justify-between px-3 py-2 bg-muted/60 rounded-xl border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <ImageIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate font-medium text-foreground">{file.name}</span>
                        <span className="text-muted-foreground shrink-0">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNormalFile(idx)}
                        disabled={isUploading}
                        className="p-1 text-muted-foreground hover:text-red-500 rounded-md transition-colors ml-2 cursor-pointer"
                        title="파일 삭제"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {normalFiles.length < 5 && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" /> 최소 5장의 정상 이미지가 필요합니다.
                </p>
              )}
            </div>

            {/* Anomaly Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Anomaly (비정상) <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${anomalyFiles.length >= 5 && anomalyFiles.length <= 10 ? 'bg-orange-500/10 text-orange-500' : 'bg-muted text-muted-foreground'}`}>
                  {anomalyFiles.length}/10장 {anomalyFiles.length >= 5 ? '✓' : '(최소 5장)'}
                </span>
              </div>
              <label className="block group">
                <div className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  anomalyFiles.length > 0 ? 'border-orange-400/50 bg-orange-500/5' : 'border-border bg-muted hover:border-orange-400/50 hover:bg-orange-500/5'
                }`}>
                  <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className={`w-6 h-6 ${anomalyFiles.length > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {anomalyFiles.length >= 10 ? '최대 10장이 선택되었습니다' : '클릭해서 파일 추가'}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">JPG, PNG 파일 (개별 또는 다중 선택)</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    disabled={anomalyFiles.length >= 10 || isUploading}
                    onChange={handleAnomalyFileChange}
                    className="hidden"
                  />
                </div>
              </label>

              {/* Anomaly files preview list */}
              {anomalyFiles.length > 0 && (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {anomalyFiles.map((file, idx) => (
                    <div
                      key={`anomaly-${file.name}-${idx}`}
                      className="flex items-center justify-between px-3 py-2 bg-muted/60 rounded-xl border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <ImageIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate font-medium text-foreground">{file.name}</span>
                        <span className="text-muted-foreground shrink-0">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnomalyFile(idx)}
                        disabled={isUploading}
                        className="p-1 text-muted-foreground hover:text-red-500 rounded-md transition-colors ml-2 cursor-pointer"
                        title="파일 삭제"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {anomalyFiles.length < 5 && (
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" /> 최소 5장의 비정상 이미지가 필요합니다.
                </p>
              )}
            </div>
          </div>

          {/* Upload Status Summary */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-medium">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground">
                총 등록: <strong className="text-foreground">{normalFiles.length + anomalyFiles.length}장</strong>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className={totalBytes > 20 * 1024 * 1024 ? 'text-red-500 font-bold' : 'text-muted-foreground'}>
                총 용량: <strong className={totalBytes > 20 * 1024 * 1024 ? 'text-red-500' : 'text-foreground'}>{(totalBytes / (1024 * 1024)).toFixed(1)} MB</strong> / 20 MB
              </span>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>이미지 파일 업로드 중… ({uploadProgress ?? 0}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Generation Settings */}
        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-7">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">생성 설정</h2>
              <p className="text-sm text-muted-foreground mt-1">처음에는 기본값으로 시작하고, 필요한 항목만 조절하세요.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div className="space-y-3">
              <label htmlFor="augment-count" className="block text-sm font-semibold">종류별 생성 이미지 수 (1~100장)</label>
              <select
                id="augment-count"
                value={imagesPerClass}
                onChange={(e) => setImagesPerClass(e.target.value)}
                className="ai-field"
              >
                {[5, 10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}장</option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">정상·비정상 각각 추가로 생성합니다.</p>
              <p className="text-sm font-semibold text-primary">총 {Number(imagesPerClass) * 2}장 추가 생성</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="augment-strength-slider" className="text-sm font-semibold">
                  변화 강도 <span className="text-muted-foreground font-normal">Strength</span>
                </label>
                <input
                  id="augment-strength"
                  aria-label="변화 강도 직접 입력"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="ai-value-input"
                />
              </div>
              <input
                id="augment-strength-slider"
                className="ai-range"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={strength === '' ? 0 : Number(strength)}
                onChange={(e) => setStrength(e.target.value)}
                aria-describedby="strength-description"
                style={{ '--range-fill': `${Math.min(100, Math.max(0, Number(strength) * 100))}%` } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 · 원본에 가깝게</span>
                <span>1 · 변화가 크게</span>
              </div>
              <p id="strength-description" className="text-sm text-muted-foreground">
                원본에 넣는 노이즈의 비율입니다 (0~1, 기본값 0.3).
              </p>
            </div>
          </div>

          <details className="ai-advanced" open>
            <summary>고급 설정 <span className="font-normal text-muted-foreground text-sm">· 추가 학습과 생성 계산</span></summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <div className="space-y-3">
                <label htmlFor="augment-finetune" className="block text-sm font-semibold">
                  추가 학습 횟수 <span className="text-muted-foreground font-normal">Fine-tune Steps (1~1000)</span>
                </label>
                <input
                  id="augment-finetune"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  value={finetuneSteps}
                  onChange={(e) => setFinetuneSteps(e.target.value)}
                  className="ai-field"
                />
                <p className="text-sm text-muted-foreground">
                  참고 이미지에 생성 모델을 적응시키는 횟수입니다. (기본 400회, 최소 1회 필요)
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="augment-steps" className="block text-sm font-semibold">
                  생성 단계 <span className="text-muted-foreground font-normal">Steps (1~200)</span>
                </label>
                <input
                  id="augment-steps"
                  type="number"
                  min="1"
                  max="200"
                  step="1"
                  value={samplingSteps}
                  onChange={(e) => setSamplingSteps(e.target.value)}
                  className="ai-field"
                />
                <p className="text-sm text-muted-foreground">
                  이미지를 만드는 계산 횟수입니다. (기본 50회)
                </p>
              </div>
            </div>
          </details>

          <div className="border-t border-border pt-5">
            <div className="flex items-start justify-between gap-5">
              <div>
                <label htmlFor="augment-fixed-seed" className="text-sm font-semibold cursor-pointer">
                  시드 고정 <span className="font-normal text-muted-foreground">Seed</span>
                </label>
                <p className="text-sm text-muted-foreground mt-1">무작위 계산 시작값을 고정해 같은 환경에서 결과 재현을 돕습니다.</p>
              </div>
              <input
                id="augment-fixed-seed"
                type="checkbox"
                role="switch"
                checked={fixedSeed}
                onChange={(e) => setFixedSeed(e.target.checked)}
                className="ai-switch mt-1 cursor-pointer"
              />
            </div>
            {fixedSeed && (
              <div className="mt-4 flex items-center gap-4">
                <label htmlFor="augment-seed" className="text-sm text-muted-foreground">시드 값 (0~4294967295)</label>
                <input
                  id="augment-seed"
                  type="number"
                  min="0"
                  max="4294967295"
                  step="1"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="ai-field max-w-48"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
