import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  ChevronRight,
  Info
} from 'lucide-react';

import { useJobStore } from '../../store/useJobStore';

export default function TrainSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const { createJob, isLoading } = useJobStore();

  const [selectedAugmentData, setSelectedAugmentData] = useState('');
  const [kShot, setKShot] = useState<1 | 3 | 5 | 10>(5);
  const [queryFiles, setQueryFiles] = useState<File[]>([]);
  const [includeQueryLabel, setIncludeQueryLabel] = useState(false);

  const handleQueryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setQueryFiles(Array.from(e.target.files));
    }
  };

  const handleStartTrain = async () => {
    try {
      const job = await createJob(projectId || '1', 'TRAINING', {
        dataset_id: selectedAugmentData,
        datasetId: selectedAugmentData,
        k_shot: kShot,
        kShot: kShot,
        epochs: 30,
        queryCount: queryFiles.length,
        has_query_labels: includeQueryLabel,
      });

      navigate(`/dashboard/projects/${projectId}/train/${job.jobId}/progress`);
    } catch (err) {
      console.error('Failed to start training job:', err);
      navigate(`/dashboard/projects/${projectId}/train/${jobId || 'JOB-002'}/progress`);
    }
  };

  const isValid = selectedAugmentData && queryFiles.length > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center gap-4">
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
              <span className="text-primary font-black italic">Train Setup</span>
            </nav>
            <h1 className="text-2xl font-black text-foreground tracking-tight">모델 학습 설정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-card rounded-4xl border border-border shadow-sm p-10 md:p-12 space-y-10">
          <p className="text-muted-foreground font-medium">Few-Shot Learning 모델을 학습합니다</p>

          {/* Augment Data Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-foreground uppercase tracking-widest">
              증강 데이터 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAugmentData}
              onChange={(e) => setSelectedAugmentData(e.target.value)}
              className="w-full px-5 py-4 bg-muted border border-border rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              <option value="">증강 완료된 데이터를 선택하세요</option>
              <option value="JOB-001">JOB-001 (40장, 2026-02-09)</option>
              <option value="JOB-002">JOB-002 (80장, 2026-02-08)</option>
              <option value="JOB-003">JOB-003 (100장, 2026-02-07)</option>
            </select>
          </div>

          {/* K-shot Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-foreground uppercase tracking-widest">
              K-shot <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {[1, 3, 5, 10].map((shot) => (
                <button
                  key={shot}
                  type="button"
                  onClick={() => setKShot(shot as 1 | 3 | 5 | 10)}
                  className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 cursor-pointer ${
                    kShot === shot
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {shot}-shot
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              각 클래스당 {kShot}장의 Support 이미지 사용
            </p>
          </div>

          {/* Query Files Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-foreground uppercase tracking-widest">
              Query 이미지 첨부 <span className="text-red-500">*</span>
            </label>
            <div className="p-8 border-2 border-dashed border-border rounded-3xl hover:border-primary/50 transition-all bg-muted/20 text-center relative group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleQueryFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {queryFiles.length > 0 ? (
                      <span className="text-primary font-black">{queryFiles.length}개의 Query 이미지 선택됨</span>
                    ) : (
                      '클릭하거나 이미지를 드래그하여 업로드하세요'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    Few-Shot 평가에 사용할 쿼리 이미지들 (권장: 10장 이상)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Query Labels Toggle */}
          <div className="p-6 bg-muted/30 border border-border rounded-3xl">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                includeQueryLabel ? 'bg-primary border-primary text-white' : 'border-muted-foreground/40 bg-background'
              }`}>
                {includeQueryLabel && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <input
                type="checkbox"
                checked={includeQueryLabel}
                onChange={(e) => setIncludeQueryLabel(e.target.checked)}
                className="hidden"
              />
              <div className="space-y-1">
                <span className="block text-base font-black text-foreground tracking-tight flex items-center gap-2">
                  <Info size={16} className="text-primary" /> Query 라벨 포함
                </span>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  라벨이 있으면 <strong className="text-primary font-bold">Accuracy, AUROC</strong>를 계산합니다.<br />
                  없어도 학습은 진행되며, <strong className="text-foreground font-bold">confidence</strong> 통계만 제공됩니다.
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-sm hover:text-foreground transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleStartTrain}
              disabled={!isValid || isLoading}
              className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                isValid && !isLoading
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none opacity-50'
              }`}
            >
              {isLoading ? '학습 시작 중...' : '학습 시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
