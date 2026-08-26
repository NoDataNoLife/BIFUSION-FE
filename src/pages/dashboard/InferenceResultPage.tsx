import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  MessageSquare, 
  ChevronRight,
  Send,
  MoreVertical,
  CheckCircle2,
  PieChart,
  Box
} from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  time: string;
  content: string;
  avatar: string;
}

export default function InferenceResultPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const totalImages = location.state?.totalImages || 50;
  
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: '염승빈',
      time: '방금 전',
      content: '정확도가 꽤 괜찮네요! Normal 클래스 예측이 매우 안정적인 것 같습니다.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom'
    }
  ]);

  const mockResults = [
    { id: '1', filename: 'img_heart_001.jpg', predicted: 'Normal', confidence: 95.3, actual: 'Normal', correct: true },
    { id: '2', filename: 'img_heart_002.jpg', predicted: 'Anomaly', confidence: 78.2, actual: 'Anomaly', correct: true },
    { id: '3', filename: 'img_heart_003.jpg', predicted: 'Normal', confidence: 89.1, actual: 'Normal', correct: true },
    { id: '4', filename: 'img_heart_004.jpg', predicted: 'Anomaly', confidence: 64.5, actual: 'Normal', correct: false },
    { id: '5', filename: 'img_heart_005.jpg', predicted: 'Normal', confidence: 92.3, actual: 'Normal', correct: true },
  ];

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: '사용자',
        time: '방금 전',
        content: newComment.trim(),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                <span className="text-emerald-500 font-black italic">Completed</span>
              </nav>
              <h1 className="text-2xl font-black text-foreground tracking-tight italic flex items-center gap-2">
                추론 완료 리포트 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-muted text-muted-foreground hover:text-foreground border border-border rounded-2xl font-black text-sm transition-all shadow-sm active:scale-95 cursor-pointer">
              <Download size={18} />
              JSON 결과 다운로드
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-10">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-4xl p-8 border border-emerald-500/30 bg-emerald-500/5 text-center">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">정확도</p>
            <p className="text-4xl font-black text-emerald-500 italic">88%</p>
          </div>
          <div className="bg-card rounded-4xl p-8 border border-border shadow-sm text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Normal 예측</p>
            <p className="text-4xl font-black text-foreground italic">32장</p>
          </div>
          <div className="bg-card rounded-4xl p-8 border border-border shadow-sm text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Anomaly 예측</p>
            <p className="text-4xl font-black text-foreground italic">18장</p>
          </div>
          <div className="bg-card rounded-4xl p-8 border border-border shadow-sm text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">평균 Confidence</p>
            <p className="text-4xl font-black text-foreground italic">0.84</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-4xl p-10 border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> 클래스 분포
            </h3>
            <div className="aspect-video bg-muted/40 rounded-3xl border border-border flex items-center justify-center text-muted-foreground italic font-bold">
              [클래스 비율 파이 차트 시각화]
            </div>
          </div>
          <div className="bg-card rounded-4xl p-10 border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Box className="w-5 h-5 text-primary" /> 임베딩 공간 (UMAP)
            </h3>
            <div className="aspect-video bg-muted/40 rounded-3xl border border-border flex items-center justify-center text-muted-foreground italic font-bold">
              [2D 고차원 임베딩 시각화]
            </div>
          </div>
        </div>

        {/* Confidence Filter */}
        <div className="bg-card rounded-4xl p-10 border border-border shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-foreground tracking-tight">결과 필터링</h3>
            <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-xs uppercase tracking-widest">
              Range: {confidenceThreshold.toFixed(2)} — 1.00
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Results Table */}
        <div className="bg-card rounded-4xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">이미지</th>
                <th className="px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">예측 클래스</th>
                <th className="px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Confidence</th>
                <th className="px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">실제 라벨</th>
                <th className="px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-right">Top-3 Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockResults.map((item) => (
                <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-muted rounded-2xl border border-border group-hover:scale-105 transition-transform shadow-sm" />
                      <span className="font-bold text-foreground text-sm">{item.filename}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      item.predicted === 'Normal' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {item.predicted}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[100px] h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-primary rounded-full shadow-lg" style={{ width: `${item.confidence}%` }} />
                      </div>
                      <span className="text-xs font-black text-foreground italic tabular-nums">{item.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-sm font-black ${item.correct ? 'text-emerald-400' : 'text-red-400'} italic`}>
                      {item.actual} {item.correct ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 bg-muted rounded-lg border border-border" />)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comments Section */}
        <div className="bg-card rounded-4xl p-10 border border-border shadow-sm space-y-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted text-muted-foreground rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">팀 코멘트</h3>
          </div>

          <div className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="추론 결과에 대한 분석 의견을 남겨주세요..."
              className="w-full p-6 bg-muted/50 border border-border rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-foreground min-h-[120px]"
            />
            <button 
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className={`absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer ${
                newComment.trim() ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 pt-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-5 group">
                <img src={c.avatar} alt={c.user} className="w-12 h-12 rounded-2xl bg-muted ring-2 ring-border shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-foreground text-sm">{c.user}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{c.time}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-6 bg-muted/40 rounded-3xl rounded-tl-none border border-border text-muted-foreground font-medium leading-relaxed">
                    {c.content}
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
