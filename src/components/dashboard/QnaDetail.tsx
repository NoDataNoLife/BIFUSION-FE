import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, ThumbsUp, MessageCircle, Award, Send, Edit2, Trash2, X, Check } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useAuthStore } from '../../store/useAuthStore';

interface QnaDetailProps {
  qnaId: number;
  onBack: () => void;
  onDelete?: () => void;
}

export default function QnaDetail({ qnaId, onBack, onDelete }: QnaDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { qnaDetail, fetchQnaDetail, createQnaAnswer, isLoadingDetail } = useCommunityStore();
  const { user } = useAuthStore();
  const isAuthor = user?.userId === qnaDetail?.author.userId;

  useEffect(() => {
    fetchQnaDetail(qnaId);
  }, [qnaId, fetchQnaDetail]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved': return 'bg-green-100 text-green-600';
      case 'Expert Answered': return 'bg-blue-100 text-blue-600';
      case 'Open': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSubmitComment = async () => {
    if (newComment.trim()) {
      setIsSubmitting(true);
      try {
        await createQnaAnswer(qnaId, newComment.trim());
        setNewComment('');
        await fetchQnaDetail(qnaId); // Refresh after answering
      } catch (error) {
        console.error('Failed to create answer:', error);
        alert('답변 등록에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoadingDetail || !qnaDetail) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-bold text-muted-foreground">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            커뮤니티로 돌아가기
          </button>

          {isAuthor && (
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground hover:text-primary hover:bg-white rounded-xl font-bold transition-all text-sm border border-transparent hover:border-border"
              >
                <Edit2 size={18} /> 수정
              </button>
              <button 
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all text-sm border border-transparent hover:border-red-100"
              >
                <Trash2 size={18} /> 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {/* Question Card */}
        <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(qnaDetail.status)}`}>
              {qnaDetail.status}
            </span>
            {qnaDetail.isExpertAnswered && (
              <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={12} /> Expert Reply
              </div>
            )}
          </div>

          <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">{qnaDetail.title}</h1>

          <div className="flex items-center gap-2 flex-wrap">
            {qnaDetail.tags?.map((tag: string, idx: number) => (
              <span key={idx} className="px-4 py-1.5 bg-muted text-muted-foreground rounded-xl text-xs font-bold border border-border">
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-slate max-w-none text-muted-foreground font-medium leading-relaxed pt-4 whitespace-pre-wrap">
            {qnaDetail.content}
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-gray-50">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-2xl border border-border">
              <ImageWithFallback src={qnaDetail.author.profileImageUrl} alt={qnaDetail.author.nickname} className="w-10 h-10 rounded-xl shadow-sm" />
              <div>
                <p className="font-bold text-foreground text-sm">{qnaDetail.author.nickname}</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{new Date(qnaDetail.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-border text-muted-foreground hover:text-primary hover:border-primary/20 rounded-xl transition-all font-bold text-sm">
              <ThumbsUp size={18} /> {qnaDetail.answerCount * 5}

            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3 ml-2">
            <MessageCircle className="text-primary" /> {qnaDetail.answers?.length || 0}개의 답변
          </h2>

          <div className="space-y-4">
            {qnaDetail.answers?.map((comment) => (
              <div key={comment.answerId} className={`p-8 bg-card rounded-4xl border ${comment.isExpert ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-border shadow-sm'} space-y-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <ImageWithFallback src={comment.author.profileImageUrl} alt={comment.author.nickname} className="w-12 h-12 rounded-2xl shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{comment.author.nickname}</p>
                        {comment.isExpert && (
                          <div className="px-2 py-0.5 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                            Expert
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground hover:text-primary rounded-xl transition-all font-bold text-xs">
                    <ThumbsUp size={14} /> {comment.answerId % 10 + 2}
                  </button>
                </div>
                
                <p className="text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Answer Form */}
          <div className="bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Edit2 className="text-primary" size={20} /> 답변 남기기
            </h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="동료 연구자에게 도움이 되는 따뜻한 답변을 남겨주세요..."
              className="w-full h-40 px-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all font-medium resize-none"
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} /> {isSubmitting ? '등록 중...' : '답변 등록하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
