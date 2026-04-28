import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  ChevronRight,
  Play,
  Settings2,
  Info
} from 'lucide-react';

export default function TrainSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();

  const [selectedAugmentData, setSelectedAugmentData] = useState('');
  const [kShot, setKShot] = useState<1 | 3 | 5 | 10>(5);
  const [queryFiles, setQueryFiles] = useState<File[]>([]);
  const [includeQueryLabel, setIncludeQueryLabel] = useState(false);

  const handleQueryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setQueryFiles(Array.from(e.target.files));
    }
  };

  const handleStartTrain = () => {
    navigate(`/dashboard/projects/${projectId}/train/${jobId}/progress`);
  };

  const isValid = selectedAugmentData && queryFiles.length > 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header (Based on prototype structure) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center gap-4">
          <button 
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Project</span>
              <ChevronRight className="w-3 h-3" />
              <span>Job {jobId}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">Train Setup</span>
            </nav>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">모델 학습 설정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-10">
          <p className="text-gray-500 font-medium">Few-Shot Learning 모델을 학습합니다</p>

          {/* Augment Data Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-gray-900 uppercase tracking-widest">
              증강 데이터 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAugmentData}
              onChange={(e) => setSelectedAugmentData(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all appearance-none"
            >
              <option value="">증강 완료된 데이터를 선택하세요</option>
              <option value="JOB-001">JOB-001 (40장, 2026-02-09)</option>
              <option value="JOB-002">JOB-002 (80장, 2026-02-08)</option>
              <option value="JOB-003">JOB-003 (100장, 2026-02-07)</option>
            </select>
          </div>

          {/* K-shot Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-gray-900 uppercase tracking-widest">
              K-shot <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {[1, 3, 5, 10].map((shot) => (
                <button
                  key={shot}
                  onClick={() => setKShot(shot as any)}
                  className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                    kShot === shot
                      ? 'bg-primary/5 border-primary text-primary shadow-sm'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {shot}-shot
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              각 클래스당 {kShot}장의 Support 이미지 사용
            </p>
          </div>

          {/* Query Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-gray-900 uppercase tracking-widest">
              Query 이미지 업로드 <span className="text-red-500">*</span>
            </label>
            <label className="block group">
              <div className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                queryFiles.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-primary/5'
              }`}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className={`w-8 h-8 ${queryFiles.length > 0 ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <p className="font-black text-gray-900 mb-1">파일 선택 또는 드래그 & 드롭</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">JPG, PNG (128×128 권장)</p>
                <input type="file" accept="image/*" multiple onChange={handleQueryFileChange} className="hidden" />
              </div>
            </label>
            {queryFiles.length > 0 && (
              <p className="text-sm font-bold text-primary px-2 italic">
                {queryFiles.length}장의 이미지가 선택되었습니다.
              </p>
            )}
          </div>

          {/* Query Label Option (Yellow Box from prototype) */}
          <div className="bg-yellow-50/50 border border-yellow-100 rounded-[2rem] p-8">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                includeQueryLabel ? 'bg-primary border-primary' : 'bg-white border-gray-200'
              }`}>
                {includeQueryLabel && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <input
                type="checkbox"
                checked={includeQueryLabel}
                onChange={(e) => setIncludeQueryLabel(e.target.checked)}
                className="hidden"
              />
              <div className="space-y-2">
                <span className="block text-lg font-black text-gray-900 tracking-tight">Query 라벨 포함</span>
                <p className="text-sm font-medium text-yellow-800/70 leading-relaxed">
                  라벨이 있으면 <strong className="text-yellow-900">Accuracy, AUROC</strong>를 계산합니다.<br />
                  없어도 학습은 진행되며, <strong className="text-yellow-900">confidence</strong> 통계만 제공됩니다.
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="px-8 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all"
            >
              취소
            </button>
            <button
              onClick={handleStartTrain}
              disabled={!isValid}
              className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                isValid
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              학습 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
