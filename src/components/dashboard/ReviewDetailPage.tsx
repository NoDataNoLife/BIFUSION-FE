import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, X, Save } from 'lucide-react';
import { useExpertStore } from '../../store/useExpertStore';

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
  imageComments?: Record<number, string>;
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
  onApprove: (comment: string, imageComments?: Record<number, string>) => void;
  onReject: (comment: string, imageComments?: Record<number, string>) => void;
  onSaveDraft?: (comment: string, imageComments?: Record<number, string>) => void;
}

export default function ReviewDetailPage({
  request,
  onBack,
  onApprove,
  onReject,
  onSaveDraft,
}: ReviewDetailPageProps) {
  const { 
    inspectionDetail, 
    fetchInspectionDetail, 
    saveDraftComment, 
    saveImageComment, 
    approveInspection,
    rejectInspection
  } = useExpertStore();

  const [reviewComment, setReviewComment] = useState(request.feedback || '');
  const [selectedImage, setSelectedImage] = useState<ImageDetail | null>(null);
  const [imageComments, setImageComments] = useState<Record<number, string>>(
    request.imageComments || {}
  );
  const [imageComment, setImageComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const numericId = Number(request.id.replace(/\D/g, ''));

  useEffect(() => {
    if (numericId) {
      fetchInspectionDetail(numericId);
    }
  }, [numericId, fetchInspectionDetail]);

  useEffect(() => {
    if (inspectionDetail) {
      if (inspectionDetail.draftComment && !reviewComment) {
        setReviewComment(inspectionDetail.draftComment);
      }
      if (inspectionDetail.finalComment) {
        setReviewComment(inspectionDetail.finalComment);
      }
      if (inspectionDetail.images && inspectionDetail.images.length > 0) {
        const initialComments: Record<number, string> = { ...imageComments };
        inspectionDetail.images.forEach((img) => {
          if (img.comment) {
            initialComments[img.imageId] = img.comment;
          }
        });
        setImageComments(initialComments);
      }
    }
  }, [inspectionDetail]);

  // Image list (from real inspectionDetail or fallback sampleImages)
  const displayImages: ImageDetail[] = 
    inspectionDetail?.images && inspectionDetail.images.length > 0
      ? inspectionDetail.images.map((img) => ({
          id: img.imageId,
          fileName: `sample_${img.imageId}.png`,
          label: img.label || '정상',
          url: img.imageUrl,
        }))
      : [
          { id: 1, fileName: 'chest_xray_001.png', label: '정상', url: request.thumbnail },
          { id: 2, fileName: 'chest_xray_002.png', label: '이상', url: request.thumbnail },
          { id: 3, fileName: 'chest_xray_003.png', label: '정상', url: request.thumbnail },
          { id: 4, fileName: 'chest_xray_004.png', label: '이상', url: request.thumbnail },
          { id: 5, fileName: 'chest_xray_005.png', label: '정상', url: request.thumbnail },
          { id: 6, fileName: 'chest_xray_006.png', label: '이상', url: request.thumbnail },
        ];

  const handleImageClick = (image: ImageDetail) => {
    setSelectedImage(image);
    setImageComment(imageComments[image.id] || '');
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
    setImageComment('');
  };

  const handleSaveImageComment = async () => {
    if (selectedImage) {
      setImageComments((prev) => ({
        ...prev,
        [selectedImage.id]: imageComment,
      }));

      if (numericId) {
        try {
          await saveImageComment(numericId, selectedImage.id, imageComment);
        } catch (e) {
          console.error('Failed to save image comment to API:', e);
        }
      }
    }
    handleCloseImageModal();
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage('');

    if (numericId) {
      try {
        await saveDraftComment(numericId, reviewComment);
        setSaveMessage('최종 코멘트가 임시저장되었습니다.');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (e) {
        console.error('Failed to save draft comment:', e);
        setSaveMessage('임시저장에 실패했습니다.');
      } finally {
        setIsSaving(false);
      }
    } else {
      setTimeout(() => {
        setIsSaving(false);
        setSaveMessage('임시 저장되었습니다.');
        setTimeout(() => setSaveMessage(''), 3000);
      }, 300);
    }

    if (onSaveDraft) {
      onSaveDraft(reviewComment, imageComments);
    }
  };

  const handleApproveClick = async () => {
    if (!reviewComment.trim()) {
      alert('검수 종합 의견을 입력해 주세요.');
      return;
    }
    if (numericId) {
      try {
        await approveInspection(numericId, reviewComment);
      } catch (e) {
        console.error('Failed to submit inspection approval:', e);
      }
    }
    onApprove(reviewComment, imageComments);
  };

  const handleRejectClick = async () => {
    if (!reviewComment.trim()) {
      alert('반려 사유 및 종합 의견을 입력해 주세요.');
      return;
    }
    if (numericId) {
      try {
        await rejectInspection(numericId, reviewComment);
      } catch (e) {
        console.error('Failed to submit inspection rejection:', e);
      }
    }
    onReject(reviewComment, imageComments);
  };

  const commentedCount = Object.values(imageComments).filter((c) => c && c.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-all group font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            목록으로 돌아가기
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {request.project}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center gap-2">
                <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                  {request.id}
                </span>
                {commentedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                    💬 이미지별 코멘트 {commentedCount}개
                  </span>
                )}
              </p>
            </div>
            {request.status !== 'completed' && (
              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span className="text-xs font-bold text-green-600 animate-fade-in">
                    {saveMessage}
                  </span>
                )}
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-card border border-border text-muted-foreground rounded-xl font-bold hover:bg-muted transition-all text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save size={18} /> {isSaving ? '저장 중...' : '임시 저장'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">요청자 정보</h3>
            <div className="flex items-center gap-4">
              <img
                src={request.requester.avatar}
                alt={request.requester.name}
                className="w-14 h-14 rounded-2xl ring-4 ring-muted shadow-xs"
              />
              <div>
                <p className="font-bold text-foreground text-lg">{request.requester.name}</p>
                <p className="text-sm text-muted-foreground font-medium">
                  {request.requester.email}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  요청일시: {request.requestDate}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">증강 파라미터</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-2xl text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  클래스당 수량
                </p>
                <p className="text-lg font-black text-foreground">
                  {request.parameters.imagesPerClass}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-2xl text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  스텝 수
                </p>
                <p className="text-lg font-black text-foreground">
                  {request.parameters.samplingSteps}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-2xl text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  CFG 스케일
                </p>
                <p className="text-lg font-black text-foreground">
                  {request.parameters.guidanceScale}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Grid Section */}
        <div className="bg-card rounded-4xl p-10 border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-foreground">합성 샘플 데이터 정밀 검수</h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {request.status === 'completed'
                  ? '이미지를 클릭하여 작성된 전문가 의견을 조회할 수 있습니다.'
                  : '이미지를 클릭하여 개별 피드백과 검수 의견을 남겨주세요.'}
              </p>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              총 {displayImages.length}개 샘플
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayImages.map((image) => {
              const hasComment = Boolean(imageComments[image.id] && imageComments[image.id].trim().length > 0);
              return (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className={`group relative aspect-square bg-muted rounded-2xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-[1.02] ${
                    hasComment ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <span
                      className={`self-start px-2 py-0.5 rounded text-[10px] font-black text-white ${
                        image.label === '정상' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {image.label}
                    </span>
                    <span className="text-[10px] text-white font-bold flex items-center gap-1">
                      <MessageSquare size={12} /> {request.status === 'completed' ? '코멘트 보기' : '코멘트 작성'}
                    </span>
                  </div>

                  {/* 코멘트 작성 뱃지 */}
                  {hasComment && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-1">
                      <MessageSquare size={10} /> 코멘트
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Feedback Section */}
        <div className="bg-card rounded-4xl p-10 border border-border shadow-sm space-y-6">
          <h3 className="text-xl font-black text-foreground">
            {request.status === 'completed' ? '최종 검수 결과 및 총평' : '종합 검수 의견'}
          </h3>

          {request.status === 'completed' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    request.reviewResult === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {request.reviewResult === 'approved' ? (
                    <>
                      <CheckCircle size={16} /> 승인 완료
                    </>
                  ) : (
                    <>
                      <XCircle size={16} /> 반려됨
                    </>
                  )}
                </span>
              </div>
              <div className="p-6 bg-muted/60 rounded-3xl border border-border text-foreground font-medium text-base leading-relaxed whitespace-pre-wrap">
                {reviewComment || '작성된 종합 의견이 없습니다.'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="합성 데이터 품질, 임상적 유의성, 노이즈 패턴 등에 대한 종합적인 평가를 작성하세요..."
                className="w-full h-40 p-6 bg-muted border border-border rounded-3xl focus:ring-2 focus:ring-primary focus:bg-background transition-all font-medium text-sm resize-none text-foreground"
              />
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  onClick={handleRejectClick}
                  className="px-8 py-4 bg-card border border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <XCircle size={20} /> 검수 반려
                </button>
                <button
                  onClick={handleApproveClick}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle size={20} /> 최종 승인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-8"
          onClick={handleCloseImageModal}
        >
          <div
            className="bg-card rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-foreground">이미지 정밀 검수</h3>
              <button
                onClick={handleCloseImageModal}
                className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.fileName}
                  className="w-full rounded-2xl shadow-inner"
                />
              </div>
              <div className="w-full md:w-80 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      파일 정보
                    </p>
                    <p className="font-bold text-foreground text-lg">{selectedImage.fileName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      분류 라벨
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${
                        selectedImage.label === '정상'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedImage.label}
                    </span>
                  </div>

                  {/* 검수 완료(결과 확인) vs 검수 중(작성) 분기 */}
                  {request.status === 'completed' ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        전문가 이미지 코멘트
                      </p>
                      {imageComments[selectedImage.id] ? (
                        <div className="p-4 bg-muted/80 rounded-2xl border border-border text-sm font-medium text-foreground leading-relaxed">
                          {imageComments[selectedImage.id]}
                        </div>
                      ) : (
                        <div className="p-4 bg-muted/40 rounded-2xl border border-dashed border-border text-xs text-muted-foreground italic">
                          작성된 개별 코멘트가 없습니다.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        이미지별 검수 의견 작성
                      </p>
                      <textarea
                        value={imageComment}
                        onChange={(e) => setImageComment(e.target.value)}
                        placeholder="이 이미지에 대한 피드백을 작성하세요..."
                        className="w-full h-32 p-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:bg-background transition-all text-sm font-medium resize-none text-foreground"
                      />
                    </div>
                  )}
                </div>

                {request.status === 'completed' ? (
                  <button
                    onClick={handleCloseImageModal}
                    className="w-full py-4 bg-muted hover:bg-gray-200 text-foreground rounded-xl font-black text-sm transition-all cursor-pointer"
                  >
                    확인 (닫기)
                  </button>
                ) : (
                  <button
                    onClick={handleSaveImageComment}
                    className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all cursor-pointer"
                  >
                    코멘트 저장
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
