import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Play, 
  MessageSquare, 
  ChevronRight,
  TrendingUp,
  Target,
  Activity,
  Send,
  MoreVertical
} from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  time: string;
  content: string;
  avatar: string;
}

export default function TrainResultPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: '김성한',
      time: '1시간 전',
      content: '모델 성능이 예상보다 잘 나왔네요. 특히 5-shot 임에도 불구하고 Accuracy가 매우 안정적입니다.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim'
    }
  ]);

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: '염승빈',
        time: '방금 전',
        content: newComment.trim(),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                <span className="text-green-600 font-black italic">Completed</span>
              </nav>
              <h1 className="text-2xl font-black text-foreground tracking-tight italic">학습 완료 리포트</h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl font-black text-sm text-foreground hover:bg-muted transition-all shadow-sm">
              <Download size={18} />
              모델(PTH) 다운로드
            </button>
            <button 
              onClick={() => navigate(`/dashboard/projects/${projectId}/inference/new-job/setup`)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              모델 추론 시작 <Play className="w-4 h-4 fill-current ml-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-10">
        {/* Metrics Grid (Prototype structure) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-4xl p-8 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Accuracy</p>
            <p className="text-3xl font-black text-foreground italic">94.2%</p>
          </div>
          <div className="bg-card rounded-4xl p-8 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <TrendingUp size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">AUROC</p>
            <p className="text-3xl font-black text-foreground italic">0.982</p>
          </div>
          <div className="bg-card rounded-4xl p-8 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
              <Activity size={24} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Confidence</p>
            <p className="text-3xl font-black text-foreground italic">High</p>
          </div>
        </div>

        {/* Interaction Section */}
        <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted text-muted-foreground rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">팀 코멘트</h3>
          </div>

          {/* Comment Input */}
          <div className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="학습 결과에 대한 의견을 공유하세요..."
              className="w-full p-6 bg-muted border border-transparent rounded-4xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-medium resize-none text-foreground min-h-[120px]"
            />
            <button 
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className={`absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-lg ${
                newComment.trim() ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-200 text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-6 pt-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                <img src={comment.avatar} alt={comment.user} className="w-12 h-12 rounded-2xl bg-muted ring-4 ring-gray-50 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-foreground text-sm">{comment.user}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{comment.time}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-gray-900 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 bg-muted rounded-2xl rounded-tl-none border border-border text-muted-foreground font-medium leading-relaxed">
                    {comment.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
