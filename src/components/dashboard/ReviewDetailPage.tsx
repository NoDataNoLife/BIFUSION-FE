import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, X, FileText, Tag, Save } from 'lucide-react';

interface ReviewRequest {
  id: string;
  project: string;
  dataType: string;
  requester: {
    name: string;
    email: string;
    avatar: string;
  };
  requestDate: string;
  thumbnail: string;
  parameters: {
    imagesPerClass: number;
    samplingSteps: number;
    guidanceScale: number;
  };
  status: 'pending' | 'reviewing' | 'completed';
  reviewResult?: 'approved' | 'rejected';
  feedback?: string;
}

interface ImageDetail {
  id: number;
  fileName: string;
  label: string;
  url: string;
}

interface ReviewDetailPageProps {
  request: ReviewRequest;
  onBack: () => void;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  onSaveDraft?: (comment: string) => void;
}

export default function ReviewDetailPage({ request, onBack, onApprove, onReject, onSaveDraft }: ReviewDetailPageProps) {
  const [reviewComment, setReviewComment] = useState(request.feedback || '');
  const [selectedImage, setSelectedImage] = useState<ImageDetail | null>(null);
  const [imageComment, setImageComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Mock image data
  const sampleImages: ImageDetail[] = [
    { id: 1, fileName: 'chest_xray_001.png', label: '정상', url: request.thumbnail },
    { id: 2, fileName: 'chest_xray_002.png', label: '이상', url: request.thumbnail },
    { id: 3, fileName: 'chest_xray_003.png', label: '정상', url: request.thumbnail },
    { id: 4, fileName: 'chest_xray_004.png', label: '이상', url: request.thumbnail },
    { id: 5, fileName: 'chest_xray_005.png', label: '정상', url: request.thumbnail },
    { id: 6, fileName: 'chest_xray_006.png', label: '이상', url: request.thumbnail },
    { id: 7, fileName: 'chest_xray_007.png', label: '정상', url: request.thumbnail },
    { id: 8, fileName: 'chest_xray_008.png', label: '이상', url: request.thumbnail },
  ];

  const handleImageClick = (image: ImageDetail) => {
    setSelectedImage(image);
    setImageComment('');
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
    setImageComment('');
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setIsSaving(true);
      setSaveMessage('');
      
      setTimeout(() => {
        onSaveDraft(reviewComment);
        setIsSaving(false);
        setSaveMessage('임시 저장되었습니다.');
        setTimeout(() => setSaveMessage(''), 3000);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-primary mb-6 transition-all group font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            목록으로 돌아가기
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{request.project}</h1>
              <p className="text-sm text-gray-400 mt-2 font-medium flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">{request.id}</span>
                <span>•</span>
                <span className="text-primary font-bold">{request.dataType}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveDraft} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm flex items-center gap-2">
                <Save size={18} /> {isSaving ? '저장 중...' : '임시 저장'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">요청자 정보</h3>
            <div className="flex items-center gap-4">
              <img src={request.requester.avatar} alt={request.requester.name} className="w-16 h-16 rounded-2xl ring-4 ring-gray-50" />
              <div>
                <p className="font-bold text-gray-900 text-lg">{request.requester.name}</p>
                <p className="text-sm text-gray-400 font-medium">{request.requester.email}</p>
                <p className="text-xs text-primary font-bold mt-2">요청일: {request.requestDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
            <h3 className="text-lg font-bold text-primary mb-6">데이터 증강 파라미터</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Images/Class</p>
                <p className="text-2xl font-black text-primary">{request.parameters.imagesPerClass}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Sampling</p>
                <p className="text-2xl font-black text-primary">{request.parameters.samplingSteps}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Guidance</p>
                <p className="text-2xl font-black text-primary">{request.parameters.guidanceScale}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Images */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8 tracking-tight">생성된 샘플 이미지 <span className="text-gray-300 font-medium text-sm ml-2">(8/800)</span></h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sampleImages.map((image) => (
              <div 
                key={image.id} 
                onClick={() => handleImageClick(image)}
                className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group relative"
              >
                <img src={image.url} alt={image.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">자세히 보기</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-white rounded-3xl p-8 border-2 border-primary shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">전문가 최종 검수 코멘트</h3>
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="이 데이터셋의 품질에 대한 상세한 피드백을 남겨주세요..."
            className="w-full h-40 px-6 py-5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-medium resize-none text-gray-700"
          />
        </div>

        {/* Sticky Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => onReject(reviewComment)}
            className="flex-1 py-5 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <XCircle size={20} /> 거절하기
          </button>
          <button
            onClick={() => onApprove(reviewComment)}
            className="flex-1 py-5 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle size={20} /> 최종 승인하기
          </button>
        </div>
      </div>

      {/* Image Modal (Simplified for brevity) */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-8" onClick={handleCloseImageModal}>
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">이미지 정밀 검수</h3>
              <button onClick={handleCloseImageModal} className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <img src={selectedImage.url} alt={selectedImage.fileName} className="w-full rounded-2xl shadow-inner" />
              </div>
              <div className="w-full md:w-80 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">파일 정보</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedImage.fileName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">분류 라벨</p>
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${selectedImage.label === '정상' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedImage.label}</span>
                </div>
                <textarea
                  value={imageComment}
                  onChange={(e) => setImageComment(e.target.value)}
                  placeholder="이미지에 대한 의견..."
                  className="w-full h-32 p-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium resize-none"
                />
                <button onClick={handleCloseImageModal} className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all">코멘트 저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
