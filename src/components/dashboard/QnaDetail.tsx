import { useState } from 'react';
import { ArrowLeft, CheckCircle, ThumbsUp, MessageCircle, Award, Send, Edit2, Trash2, X, Check } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

interface QnaDetailProps {
  qaPost: {
    id: string;
    title: string;
    author: string;
    authorAvatar: string;
    status: string;
    tags: string[];
    commentCount: number;
    hasExpertReply: boolean;
  };
  onBack: () => void;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  date: string;
  isExpert: boolean;
  likes: number;
}

export default function QnaDetail({ qaPost, onBack }: QnaDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const currentUser = '염승빈';
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: '김성한',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
      content: '데이터 증강 시 overfitting을 방지하려면 증강된 데이터의 다양성을 확보하는 것이 중요합니다. Rotation, Flip, Crop 등 다양한 기법을 조합해서 사용하시고, 원본 데이터와 증강 데이터의 비율도 적절히 조절해야 합니다.',
      date: '2025-03-01',
      isExpert: true,
      likes: 24,
    },
    {
      id: '2',
      author: '조현희',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cho',
      content: '저도 비슷한 문제를 겪었는데, validation set을 별도로 구성해서 모니터링하는 것이 도움이 되었습니다.',
      date: '2025-03-01',
      isExpert: false,
      likes: 8,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved': return 'bg-green-100 text-green-600';
      case 'Expert Answered': return 'bg-blue-100 text-blue-600';
      case 'Open': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: currentUser,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom',
        content: newComment,
        date: new Date().toISOString().split('T')[0],
        isExpert: false,
        likes: 0,
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {/* Question Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(qaPost.status)}`}>
              {qaPost.status}
            </span>
            {qaPost.hasExpertReply && (
              <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={12} /> Expert Reply
              </div>
            )}
          </div>

          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{qaPost.title}</h1>

          <div className="flex items-center gap-2 flex-wrap">
            {qaPost.tags.map((tag, idx) => (
              <span key={idx} className="px-4 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold border border-gray-100">
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-slate max-w-none text-gray-600 font-medium leading-relaxed pt-4">
            데이터 증강을 진행하면서 모델의 성능이 오히려 저하되는 경우가 있습니다. 
            원본 데이터로 학습했을 때는 validation accuracy가 85%였는데, 
            증강 데이터를 추가하니 78%로 떨어졌습니다. 
            증강 파라미터 설정이나 비율 조정 방법에 대한 조언 부탁드립니다.
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-gray-50">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <ImageWithFallback src={qaPost.authorAvatar} alt={qaPost.author} className="w-10 h-10 rounded-xl shadow-sm" />
              <div>
                <p className="font-bold text-gray-900 text-sm">{qaPost.author}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">2025-02-28</p>
              </div>
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 rounded-xl transition-all font-bold text-sm">
              <ThumbsUp size={18} /> 15
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 ml-2">
            <MessageCircle className="text-primary" /> {comments.length}개의 답변
          </h2>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className={`p-8 bg-white rounded-[2rem] border ${comment.isExpert ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-gray-100 shadow-sm'} space-y-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <ImageWithFallback src={comment.authorAvatar} alt={comment.author} className="w-12 h-12 rounded-2xl shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{comment.author}</p>
                        {comment.isExpert && (
                          <div className="px-2 py-0.5 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                            Expert
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{comment.date}</p>
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 hover:text-primary rounded-xl transition-all font-bold text-xs">
                    <ThumbsUp size={14} /> {comment.likes}
                  </button>
                </div>
                
                <p className="text-gray-600 font-medium leading-relaxed">{comment.content}</p>
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
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} /> 답변 등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
