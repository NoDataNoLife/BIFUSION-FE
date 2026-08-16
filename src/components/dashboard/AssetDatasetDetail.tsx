import { useState } from "react";
import VerificationRequestModal from "../community/modals/VerificationRequestModal";
import {
  ArrowLeft,
  Database,
  Download,
  HardDrive,
  FileText,
  Calendar,
  Code,
  Info,
  Trash2,
  Edit,
  X,
  Tag,
  Clock,
  Play,
  Award,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import ExpertVerificationCard, { VerificationStatus } from "../community/ExpertVerificationCard";
import VerificationResultModal from "../community/modals/VerificationResultModal";

interface AssetDatasetDetailProps {
  dataset: {
    id: string;
    name: string;
    type: "uploaded" | "augmented";
    size: string;
    fileCount: number;
    thumbnail: string;
    uploadedAt: string;
    format: string;
    description?: string;
    tags?: string[];
    imageCount?: number;
    classCount?: number;
    augmentationMethod?: string;
    generationTime?: string;
    generationJobId?: string;
    verificationStatus?: VerificationStatus;
  };
  onBack: () => void;
  onDelete: () => void;
  onUpdate?: (updatedData: {
    name: string;
    description: string;
    tags: string[];
  }) => void;
}

 export default function AssetDatasetDetail({
  dataset,
  onBack,
  onDelete,
  onUpdate,
}: AssetDatasetDetailProps) {
  const [isDownloading, setIsDownloading] = useState(false);
 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(dataset.name);
  const [newDescription, setNewDescription] = useState(
    dataset.description || "",
  );
  const [newTags, setNewTags] = useState(dataset.tags || []);
  const [verificationStatus] = useState<VerificationStatus>(dataset.verificationStatus || "NONE");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

 
  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("다운로드가 시작되었습니다.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Assets로 돌아가기
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-all"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
            >
              <Download size={18} />{" "}
              {isDownloading ? "다운로드 중..." : "데이터셋 다운로드"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {/* Main Info Card */}
        <div className="bg-card rounded-4xl p-10 border border-border shadow-sm flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-64 h-64 rounded-3xl overflow-hidden shadow-inner shrink-0">
            <img
              src={dataset.thumbnail}
              alt={dataset.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${dataset.type === "augmented" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
              >
                {dataset.type}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-foreground tracking-tight">
                {dataset.name}
              </h1>
              {verificationStatus === 'COMPLETED' && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap">
                  <ShieldCheck size={14} /> Expert Certified
                </div>
              )}
            </div>

            <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
              {dataset.description ||
                (dataset.type === "augmented"
                  ? "Bifusion AI를 통해 정밀하게 증강된 의료 데이터셋입니다. 해부학적 구조를 유지하면서 데이터의 다양성을 확보했습니다."
                  : "사용자가 직접 업로드한 원본 의료 데이터셋입니다. 증강 및 학습 프로젝트의 기초 데이터로 활용됩니다.")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  총 용량
                </p>
                <p className="font-bold text-foreground">{dataset.size}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  파일 수
                </p>
                <p className="font-bold text-foreground">
                  {dataset.fileCount.toLocaleString()}개
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  업로드 날짜
                </p>
                <p className="font-bold text-foreground">{dataset.uploadedAt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  데이터 형식
                </p>
                <p className="font-bold text-foreground">{dataset.format}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Code Area */}
            <div className="bg-gray-900 rounded-4xl p-8 shadow-2xl relative overflow-hidden">
              <Code className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <Terminal size={20} className="text-primary" /> Python API 사용
                예시
              </h3>
              <div className="bg-black/30 rounded-2xl p-6 font-mono text-sm text-primary/90 overflow-x-auto">
                <pre>
                  <code>{`import biffusion\n\n# 데이터셋 로드\ndataset = biffusion.load_asset('${dataset.id}')\n\n# 증강 파이프라인 적용\naugmented = dataset.augment(\n    method='adaptive_diffusion',\n    count=1000\n)\n\n# 결과 확인\nprint(f"생성 완료: {len(augmented)} images")`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-8">
            <div className="bg-card rounded-4xl p-8 border border-border shadow-sm">
              <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
                <Info size={18} className="text-primary" /> 상세 명세
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-bold">라벨 수</span>
                  <span className="font-bold text-foreground">12 Classes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-bold">해상도</span>
                  <span className="font-bold text-foreground">1024 x 1024</span>
                </div>
                {dataset.type === "augmented" && (
                  <div className="pt-4 mt-4 border-t border-gray-50 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-bold">증강 방식</span>
                      <span className="font-bold text-primary">
                        Diffusion v4
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-bold">생성 시간</span>
                      <span className="font-bold text-foreground">2h 15m</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expert Section */}
            <ExpertVerificationCard 
              status={verificationStatus}
              onRequestVerification={() => setShowVerificationModal(true)}
              onViewResults={() => setShowResultModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Delete Modal (Simplified) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-foreground mb-2">
              데이터셋 삭제
            </h2>
            <p className="text-muted-foreground font-medium mb-8">
              "{dataset.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <VerificationRequestModal
          assetTitle={dataset.name}
          onClose={() => setShowVerificationModal(false)}
          onSubmit={(reason, reward) => {
            console.log('Verification requested:', { reason, reward });
            setShowVerificationModal(false);
          }}
        />
      )}

      {showResultModal && (
        <VerificationResultModal
          assetTitle={dataset.name}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </div>
  );
}

// Mock Terminal icon for sample code
function Terminal({ size, className }: { size: number; className: string }) {
  return <Play size={size} className={className} />;
}
