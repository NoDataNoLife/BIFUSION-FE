import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  ChevronRight,
  Play,
  Settings2,
  FileImage,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function InferenceSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();

  const [selectedModel, setSelectedModel] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [includeLabels, setIncludeLabels] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const availableModels = [
    { id: 'model-1', name: '5-shot 심장 질환 예측 모델 (2026-02-09 15:23)', accuracy: '94.2%' },
    { id: 'model-2', name: '3-shot 폐암 감지 모델 (2026-02-08 10:15)', accuracy: '89.5%' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleStartInference = () => {
    navigate(`/dashboard/projects/${projectId}/inference/${jobId}/progress`, { 
      state: { totalImages: uploadedFiles.length } 
    });
  };

  const canStart = selectedModel && uploadedFiles.length > 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center gap-4">
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
              <span className="text-primary font-black italic">Inference Setup</span>
            </nav>
            <h1 className="text-2xl font-black text-foreground tracking-tight">모델 추론 설정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-12 space-y-10">
          <p className="text-muted-foreground font-medium italic">학습된 모델로 새로운 이미지를 분류합니다</p>

          {/* Model Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-foreground uppercase tracking-widest">
              학습된 모델 선택 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all appearance-none"
            >
              <option value="">학습 완료된 모델을 선택하세요</option>
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — Accuracy: {model.accuracy}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-foreground uppercase tracking-widest">
              추론할 이미지 업로드 <span className="text-red-500">*</span>
            </label>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files) setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
              className={`border-2 border-dashed rounded-4xl p-16 text-center transition-all cursor-pointer group ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <FileImage className={`w-10 h-10 ${uploadedFiles.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <p className="text-xl font-black text-foreground mb-2 tracking-tight">파일 선택 또는 드래그 & 드롭</p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-6">JPG, PNG (배치 업로드 가능)</p>
                
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  파일 찾아보기
                </label>
              </div>
            </div>

            {/* Uploaded Files List (Prototype style) */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 p-6 bg-muted rounded-3xl border border-border space-y-3">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                  업로드된 파일: <span className="text-primary">{uploadedFiles.length}개</span>
                </p>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {uploadedFiles.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm font-bold text-foreground bg-card rounded-xl p-3 shadow-sm border border-gray-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tabular-nums">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                  {uploadedFiles.length > 5 && (
                    <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-tighter pt-2">...외 {uploadedFiles.length - 5}개의 파일이 더 있습니다</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Optional: Include Labels (Blue Box) */}
          <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-4xl">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                includeLabels ? 'bg-blue-600 border-blue-600' : 'bg-card border-blue-200'
              }`}>
                {includeLabels && <div className="w-2 h-2 bg-card rounded-full" />}
              </div>
              <input
                type="checkbox"
                checked={includeLabels}
                onChange={(e) => setIncludeLabels(e.target.checked)}
                className="hidden"
              />
              <div className="space-y-1">
                <p className="text-lg font-black text-blue-900 tracking-tight italic">이미지 라벨 포함 (선택 사항)</p>
                <p className="text-sm font-medium text-blue-800/60 leading-relaxed">
                  라벨이 있으면 예측 정확도를 함께 분석하여 리포트에 표시합니다.<br />
                  없어도 AI 추론은 정상적으로 수행됩니다.
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="px-8 py-4 bg-card border border-border text-muted-foreground rounded-2xl font-black text-sm hover:bg-muted transition-all"
            >
              취소
            </button>
            <button
              onClick={handleStartInference}
              disabled={!canStart}
              className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                canStart
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
              }`}
            >
              추론 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
