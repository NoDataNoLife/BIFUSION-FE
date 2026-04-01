import { useState } from 'react';
import { ArrowLeft, Database, Download, Heart, HardDrive, FileText, Calendar, CheckCircle, Code, Info, ExternalLink } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

interface CommunityDatasetDetailProps {
  datasetPost: {
    id: string;
    title: string;
    description: string;
    author: string;
    authorAvatar: string;
    tags: string[];
    fileSize: string;
    fileCount: number;
    downloadCount: number;
    upvotes: number;
    uploadDate: string;
    license: string;
  };
  onBack: () => void;
}

interface FileItem {
  name: string;
  size: string;
  type: string;
}

export default function CommunityDatasetDetail({ datasetPost, onBack }: CommunityDatasetDetailProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const sampleFiles: FileItem[] = [
    { name: 'train_images.zip', size: '2.3 GB', type: 'Archive' },
    { name: 'annotations.json', size: '45 MB', type: 'JSON' },
    { name: 'metadata.csv', size: '12 MB', type: 'CSV' },
  ];

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert('다운로드가 시작되었습니다.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            커뮤니티로 돌아가기
          </button>
          
          <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm"
          >
            <Download size={18} /> {isDownloading ? '준비 중...' : '데이터셋 다운로드'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        {/* Dataset Header Card */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center flex-shrink-0">
              <Database className="w-16 h-16 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{datasetPost.title}</h1>
              <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">{datasetPost.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {datasetPost.tags.map((tag, idx) => (
                  <span key={idx} className="px-4 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-gray-50 text-center">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">파일 크기</p>
              <p className="text-xl font-black text-gray-900">{datasetPost.fileSize}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">이미지 수</p>
              <p className="text-xl font-black text-gray-900">{datasetPost.fileCount.toLocaleString()}개</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">다운로드</p>
              <p className="text-xl font-black text-gray-900">{datasetPost.downloadCount.toLocaleString()}회</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">추천 수</p>
              <p className="text-xl font-black text-primary flex items-center justify-center gap-1">
                <Heart size={20} fill="currentColor" /> {datasetPost.upvotes}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* File List */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3 ml-2">
                <FileText className="text-primary" /> 포함된 파일 목록
              </h2>
              <div className="space-y-3">
                {sampleFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm group-hover:text-primary transition-colors">
                        <Database size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{file.name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                      <Download size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Example */}
            <div className="bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl space-y-6">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Code className="text-primary" /> Python API 사용 가이드
              </h2>
              <div className="bg-black/30 rounded-2xl p-6 font-mono text-sm text-primary/90 overflow-x-auto">
                <pre>
                  <code>{`import biffusion\n\n# 데이터셋 불러오기\ndataset = biffusion.load_dataset('${datasetPost.id}')\n\n# 증강 파이프라인 구성\naugmented = dataset.augment(\n    method='adaptive_diffusion',\n    count=5000\n)\n\n# 학습 데이터로 활용\nprint(f"Dataset ready: {len(augmented)} samples")`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Info size={18} className="text-primary" /> 상세 정보
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">라이선스</span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">{datasetPost.license}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">업로드 날짜</span>
                  <span className="font-bold text-gray-900">{datasetPost.uploadDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-50">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">작성자</span>
                  <div className="flex items-center gap-2">
                    <img src={datasetPost.authorAvatar} alt={datasetPost.author} className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-gray-900">{datasetPost.author}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100 space-y-4">
              <h3 className="text-lg font-black text-blue-900 flex items-center gap-2">
                <CheckCircle size={20} /> 활용 가이드
              </h3>
              <p className="text-blue-700/80 text-sm font-medium leading-relaxed">
                본 데이터셋은 연구 및 교육 목적으로 공개되었습니다. 상업적 이용 시 별도의 허가가 필요할 수 있습니다.
              </p>
              <button className="flex items-center gap-2 text-sm text-blue-600 font-black hover:text-blue-800 transition-colors uppercase tracking-widest">
                전체 라이선스 읽기 <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
