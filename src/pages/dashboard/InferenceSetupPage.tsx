import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  ChevronRight,
  FileImage,
  AlertCircle,
  Loader2,
  X,
  Cpu,
} from 'lucide-react';

import '../../components/jobs/AISetup.css';

import api from '../../lib/axios';
import { getJobErrorMessage, useJobStore } from '../../store/useJobStore';
import { uploadTempFiles, validateImageFiles } from '../../lib/fileUpload';

interface TrainedModel {
  trainedModelId: number | string;
  id?: number | string;
  modelName?: string;
  name?: string;
  jobCode?: string;
  accuracy?: number;
  createdAt?: string;
}

export default function InferenceSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { createJob, isLoading } = useJobStore();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [models, setModels] = useState<TrainedModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  const initialModelId = location.state?.trainedModelId ? String(location.state.trainedModelId) : '';
  const [selectedModel, setSelectedModel] = useState<string>(initialModelId);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;
    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        setModelError(null);
        const res = await api.get(`/projects/${projectId}/trained-models`);
        const data = (res.data?.data ?? res.data) as TrainedModel[];
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setModels(list);
          if (list.length > 0 && !selectedModel) {
            const matched = initialModelId
              ? list.find((m) => String(m.trainedModelId ?? m.id) === initialModelId)
              : null;
            setSelectedModel(matched ? String(matched.trainedModelId ?? matched.id) : String(list[0].trainedModelId ?? list[0].id));
          }
        }
      } catch (err) {
        if (isMounted) {
          setModelError(getJobErrorMessage(err, '학습된 모델 목록을 불러오지 못했습니다.'));
        }
      } finally {
        if (isMounted) {
          setLoadingModels(false);
        }
      }
    };
    fetchModels();
    return () => { isMounted = false; };
  }, [projectId, initialModelId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...incoming].slice(0, 20));
      e.target.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const totalBytes = uploadedFiles.reduce((acc, f) => acc + f.size, 0);

  const isValid = !!projectId
    && !!selectedModel
    && uploadedFiles.length >= 1 && uploadedFiles.length <= 20
    && totalBytes <= 20 * 1024 * 1024;

  const handleStartInference = async () => {
    if (isLoading || isUploading || !isValid || !projectId) return;
    setSubmitError(null);

    const validation = validateImageFiles(uploadedFiles, { minCount: 1, maxCount: 20 });
    if (!validation.valid) {
      setSubmitError(validation.error ?? '업로드할 이미지를 확인해 주세요.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const uploaded = await uploadTempFiles(uploadedFiles, (p) => setUploadProgress(p));
      const fileIds = uploaded.map((f) => f.fileId);

      const parsedModelId = isNaN(Number(selectedModel))
        ? selectedModel
        : Number(selectedModel);

      const job = await createJob(projectId, 'INFERENCE', {
        model_id: parsedModelId,
        fileIds,
      });

      navigate(`/dashboard/projects/${projectId}/inference/${job.jobId}/progress`, {
        state: { totalImages: uploadedFiles.length }
      });
    } catch (err) {
      setSubmitError(getJobErrorMessage(err, '추론 요청에 실패했습니다. 다시 시도해 주세요.'));
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="ai-setup min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center gap-4">
          <button
            aria-label="프로젝트로 돌아가기"
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
              <span>Project</span>
              <ChevronRight className="w-3 h-3" />
              <span>{jobId === 'new' ? 'New Job' : `Job ${jobId}`}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary font-semibold italic">Inference Setup</span>
            </nav>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">모델 추론 설정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        {submitError && (
          <p role="alert" className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm font-medium">
            {submitError}
          </p>
        )}

        <div className="bg-card rounded-3xl border border-border shadow-sm p-6 md:p-8 space-y-7">
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            학습된 모델로 새 이미지를 정상·비정상으로 분류합니다. 정답 라벨 없이 모델의 예측 확률과 신뢰도를 확인하는 단계입니다.
          </p>

          {/* Model Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-foreground uppercase tracking-wide">
                학습된 모델 선택 <span className="text-red-500">*</span>
              </label>
              {loadingModels && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> 모델 목록 조회 중…
                </span>
              )}
            </div>

            {modelError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-500">
                {modelError}
              </div>
            )}

            {!loadingModels && models.length === 0 ? (
              <div className="p-6 bg-muted/40 border border-dashed border-border rounded-2xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-orange-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">사용 가능한 학습 모델이 없습니다</p>
                <p className="text-xs text-muted-foreground">
                  추론을 실행하려면 먼저 데이터 증강 후 모델 학습을 1회 이상 완료해야 합니다.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/projects/${projectId}/train/new/setup`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  <Cpu size={16} /> 모델 학습으로 이동
                </button>
              </div>
            ) : (
              <select
                value={selectedModel}
                disabled={loadingModels || models.length === 0}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-5 py-4 bg-muted border border-border rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-sm disabled:opacity-50"
              >
                <option value="">학습 완료된 모델을 선택하세요</option>
                {models.map((model) => {
                  const id = String(model.trainedModelId ?? model.id);
                  const name = model.modelName || model.name || model.jobCode || `모델 #${id}`;
                  const accText = model.accuracy ? ` (정확도 ${(model.accuracy * 100).toFixed(1)}%)` : '';
                  const dateStr = model.createdAt ? ` - ${new Date(model.createdAt).toLocaleDateString()}` : '';
                  return (
                    <option key={id} value={id}>
                      {name}{accText}{dateStr}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-foreground uppercase tracking-wide">
                추론할 이미지 업로드 (1~20장) <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${uploadedFiles.length >= 1 && uploadedFiles.length <= 20 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {uploadedFiles.length}/20장 {uploadedFiles.length >= 1 ? '✓' : '(최소 1장)'}
              </span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  const incoming = Array.from(e.dataTransfer.files);
                  setUploadedFiles((prev) => [...prev, ...incoming].slice(0, 20));
                }
              }}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/40 hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-card border border-border rounded-3xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <FileImage className={`w-8 h-8 ${uploadedFiles.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1 tracking-tight">
                  {uploadedFiles.length >= 20 ? '최대 20장까지 등록되었습니다' : '파일 선택 또는 드래그 & 드롭'}
                </p>
                <p className="text-xs text-muted-foreground font-medium mb-4">JPG, PNG (최대 20장, 총 20MB 이하)</p>

                <input
                  type="file"
                  id="inference-file-upload"
                  multiple
                  accept="image/jpeg,image/png"
                  disabled={uploadedFiles.length >= 20 || isUploading}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="inference-file-upload"
                  className={`px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95 ${
                    uploadedFiles.length >= 20 || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 cursor-pointer'
                  }`}
                >
                  파일 찾아보기
                </label>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="p-5 bg-muted/50 rounded-2xl border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>선택된 파일: <strong className="text-foreground">{uploadedFiles.length}장</strong></span>
                  <span className={totalBytes > 20 * 1024 * 1024 ? 'text-red-500 font-bold' : 'text-muted-foreground'}>
                    총 용량: <strong className={totalBytes > 20 * 1024 * 1024 ? 'text-red-500' : 'text-foreground'}>{(totalBytes / (1024 * 1024)).toFixed(1)} MB</strong> / 20 MB
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`infer-${file.name}-${index}`}
                      className="flex items-center justify-between text-xs font-medium text-foreground bg-card rounded-xl px-3 py-2 border border-border shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        <Upload className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isUploading}
                          className="p-1 text-muted-foreground hover:text-red-500 rounded-md transition-colors cursor-pointer"
                          title="파일 삭제"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>추론용 이미지 파일 업로드 중… ({uploadProgress ?? 0}%)</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-semibold text-sm hover:text-foreground transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleStartInference}
              disabled={!isValid || isLoading || isUploading || loadingModels}
              className={`px-10 py-4 rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                isValid && !isLoading && !isUploading && !loadingModels
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none opacity-50'
              }`}
            >
              {isUploading ? '이미지 업로드 중...' : isLoading ? '추론 요청 중...' : '추론 시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
