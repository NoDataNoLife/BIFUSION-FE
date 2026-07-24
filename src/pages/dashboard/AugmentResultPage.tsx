import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Play, 
  MessageSquare, 
  ChevronRight,
  Clock,
  HardDrive,
  ImageIcon,
  CheckCircle2,
  MoreVertical,
  Heart,
  Send,
  Sparkles,
  Layers
} from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  time: string;
  content: string;
  avatar: string;
}

export default function AugmentResultPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'Normal' | 'Anomaly'>('Normal');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: '김성한',
      time: '2시간 전',
      content: '증강 품질이 훌륭합니다! 특히 Normal 데이터의 변동성이 자연스럽네요. 다음 단계 진행해도 좋을 것 같습니다.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim'
    }
  ]);

  const stats = {
    total: 40,
    normal: 20,
    anomaly: 20,
    duration: '3분 42초',
    fileSize: '12.4 MB'
  };

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
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                <span>Project</span>
                <ChevronRight className="w-3 h-3" />
                <span>Job {jobId}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-green-600 font-black italic">Completed</span>
              </nav>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                데이터 증강 결과 리포트 <CheckCircle2 className="w-6 h-6 text-green-500" />
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                <Download className="w-4 h-4" />
                NPZ 다운로드
              </button>
              <button 
                onClick={() => navigate(`/dashboard/projects/${projectId}/train/new-job/setup`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                모델 학습 시작 <Play className="w-4 h-4 fill-current ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: '생성 이미지 수', value: `${stats.total}장`, sub: `Normal ${stats.normal} / Anomaly ${stats.anomaly}`, icon: ImageIcon, color: 'blue' },
            { label: '총 소요 시간', value: stats.duration, sub: 'GPU 가속 모드 사용', icon: Clock, color: 'purple' },
            { label: '데이터셋 크기', value: stats.fileSize, sub: '압축된 NPZ 포맷', icon: HardDrive, color: 'green' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-${stat.color}-100 transition-colors duration-500`} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-gray-400">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Results Explorer */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Explorer Header & Tabs */}
          <div className="px-10 pt-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-10">
              {(['Normal', 'Anomaly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-8 text-lg font-black transition-all relative ${
                    activeTab === tab ? 'text-primary' : 'text-gray-300 hover:text-gray-500'
                  }`}
                >
                  {tab} Data
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-lg group-hover:bg-primary/10 transition-colors">
                    {tab === 'Normal' ? stats.normal : stats.anomaly}
                  </span>
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-full" />}
                </button>
              ))}
            </div>

            <div className="pb-8 flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Display:</span>
              <div className="flex p-1 bg-gray-50 rounded-xl">
                <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-xs font-black text-gray-900">Grid</button>
                <button className="px-3 py-1.5 text-xs font-black text-gray-400 hover:text-gray-600 transition-colors">List</button>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="p-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="group relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:border-primary/50 transition-all cursor-zoom-in"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 hover:fill-current" />
                </div>
                {/* Placeholder Image Visual */}
                <div className="w-full h-full flex items-center justify-center text-gray-200 group-hover:scale-110 transition-transform duration-700">
                  <Sparkles className="w-12 h-12 opacity-20" />
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  ID: {activeTab.slice(0, 1)}-{i + 101}
                </div>
              </div>
            ))}
            {/* View More Card */}
            <button className="aspect-square rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all group">
              <Layers className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">+ 5 More</span>
            </button>
          </div>
        </div>

        {/* Interaction Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Comments Area */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">팀 코멘트 <span className="text-primary ml-1">{comments.length}</span></h3>
              </div>
              <button className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">최신순 ↓</button>
            </div>

            {/* Comment Input */}
            <div className="relative group">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="결과에 대한 의견을 남겨주세요..."
                className="w-full p-6 bg-gray-50 border border-transparent rounded-4xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-medium resize-none text-gray-700 min-h-[120px]"
              />
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className={`absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
                  newComment.trim() ? 'bg-primary text-white shadow-primary/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-6 pt-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 group">
                  <img src={comment.avatar} alt={comment.user} className="w-12 h-12 rounded-2xl bg-gray-100 ring-4 ring-gray-50 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 text-sm">{comment.user}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{comment.time}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-900 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-2xl rounded-tl-none border border-gray-100 text-gray-600 font-medium leading-relaxed">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
              <div className="relative z-10 space-y-6">
                <h4 className="text-xl font-black italic tracking-tight">AI Quality Summary</h4>
                <div className="space-y-4">
                  {[
                    { label: '이미지 선명도', score: 98 },
                    { label: '클래스 다양성', score: 92 },
                    { label: '해부학적 일관성', score: 95 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-black uppercase tracking-tighter opacity-80">
                        <span>{item.label}</span>
                        <span>{item.score}%</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs font-bold leading-relaxed opacity-70 italic">
                    * BIFUSION의 자동 품질 검사 엔진에 의해 분석된 수치입니다. 전문가 검토가 권장됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="font-black text-gray-900 tracking-tight">최종 검수 완료</h4>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest italic">Ready for Training</p>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                생성된 데이터셋의 품질이 기준치를 통과했습니다. 즉시 모델 학습 단계로 진입할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
