import { useState } from 'react';
import { Search, GitFork, Users, Database, ArrowUpDown, Plus, Award, Heart, CheckCircle, Clock, Building2, Download, Filter, HardDrive } from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import QnaDetail from '../../components/dashboard/QnaDetail';
import RecruitmentDetail from '../../components/dashboard/RecruitmentDetail';
import CommunityDatasetDetail from '../../components/dashboard/CommunityDatasetDetail';
import { useAuthStore } from '../../store/useAuthStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { ALL_RECIPES, type Recipe } from '../../store/mockData';
import CreatePostModal from '../../components/community/CreatePostModal';
import { useEffect } from 'react';

// --- Types ---
interface ShowcasePost extends Recipe {
  likeCount: number;
}

interface QAPost {
  id: string; title: string; author: string; authorAvatar: string;
  status: string; tags: string[]; commentCount: number; hasExpertReply: boolean;
}


// --- Mock Data (데이터셋 제외 - 실제 API 연동 완료) ---
const mockShowcasePosts: ShowcasePost[] = ALL_RECIPES.map(r => ({
  ...r,
  likeCount: r.forkedCount * 3
}));

const mockQAPosts: QAPost[] = [
  { id: 'QA-001', title: 'Diffusion 모델 학습 시 메모리 부족 오류 해결 방법은?', author: '연구자A', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=userA', status: 'Solved', tags: ['#Error', '#Diffusion'], commentCount: 12, hasExpertReply: true },
];


export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'qa' | 'recruitment' | 'datasets'>('showcase');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { 
    qnaList, datasetList, recruitmentList, 
    fetchQnaList, fetchDatasetList, fetchRecruitmentList, 
    isLoadingQna, isLoadingDataset, isLoadingRecruitment 
  } = useCommunityStore();

  useEffect(() => {
    if (activeTab === 'qa') {
      fetchQnaList();
    } else if (activeTab === 'datasets') {
      fetchDatasetList();
    } else if (activeTab === 'recruitment') {
      fetchRecruitmentList();
    }
  }, [activeTab, fetchQnaList, fetchDatasetList, fetchRecruitmentList]);

  // --- Sub-page Rendering Logic ---
  if (selectedId) {
    if (activeTab === 'showcase') {
      const post = mockShowcasePosts.find(p => p.id === selectedId);
      if (post) return <RecipeDetail recipe={post} onBack={() => setSelectedId(null)} isAuthor={post.author === user?.name} />;
    }
    if (activeTab === 'qa') {
      return <QnaDetail 
        qnaId={Number(selectedId)} 
        onBack={() => setSelectedId(null)} 
        onDelete={() => {
          if (confirm('정말로 이 질문을 삭제하시겠습니까?')) {
            alert('삭제되었습니다. (Mock)');
            setSelectedId(null);
          }
        }}
      />;
    }
    if (activeTab === 'recruitment') {
      return <RecruitmentDetail 
        recruitmentId={Number(selectedId)} 
        onBack={() => setSelectedId(null)}
        onDelete={() => {
          if (confirm('정말로 이 채용 공고를 삭제하시겠습니까?')) {
            alert('삭제되었습니다. (Mock)');
            setSelectedId(null);
          }
        }}
      />;
    }
    if (activeTab === 'datasets') {
      const post = datasetList.find(p => p.datasetId.toString() === selectedId);
      if (post) return <CommunityDatasetDetail 
        datasetId={Number(selectedId)} 
        onBack={() => setSelectedId(null)} 
        onDelete={() => {
          if (confirm('정말로 이 데이터셋을 삭제하시겠습니까?')) {
            alert('삭제되었습니다. (Mock)');
            setSelectedId(null);
          }
        }}
      />;
    }
  }

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header & Main Search */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-foreground tracking-tight">Research Hub</h1>
            <p className="text-muted-foreground font-medium">전 세계 연구자들과 지식과 자산을 공유하세요</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-3xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            <Plus size={20} /> 새로운 게시글 작성
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="레시피, 질문, 데이터셋, 팀 모집 공고를 검색하세요..."
            className="w-full pl-16 pr-6 py-6 bg-card border border-border rounded-4xl shadow-sm text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
          />
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-2">
        <div className="flex gap-10 overflow-x-auto no-scrollbar">
          {(['showcase', 'qa', 'recruitment', 'datasets'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedId(null); }}
              className={`pb-6 text-lg font-black transition-all relative whitespace-nowrap ${
                activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-gray-500'
              }`}
            >
              {tab === 'showcase' ? '쇼케이스' : tab === 'qa' ? '전문가 Q&A' : tab === 'recruitment' ? '팀원 모집' : '데이터셋'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-xl font-bold text-xs hover:bg-muted transition-all uppercase tracking-widest">
            <ArrowUpDown size={14} /> 최신순
          </button>
          <button className="p-2 bg-muted text-muted-foreground rounded-xl hover:bg-muted transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="min-h-100">
        {activeTab === 'showcase' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockShowcasePosts.map(post => (
              <div key={post.id} onClick={() => setSelectedId(post.id)} className="group bg-card rounded-[2.5rem] border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative">
                <div className="aspect-4/3 overflow-hidden bg-muted">
                  <ImageWithFallback src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {post.isExpertVerified && (
                    <div className="absolute top-6 right-6 px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-1.5">
                      <Award size={14} /> Expert
                    </div>
                  )}
                </div>
                <div className="p-8 space-y-6">
                  <h3 className="text-xl font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                      <span className="text-sm font-bold text-muted-foreground">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><GitFork size={14} /> {post.forkedCount}</span>
                      <span className="flex items-center gap-1.5"><Heart size={14} /> {post.likeCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-4">
            {/* UI 테스트용 Mock 데이터 */}
            {mockQAPosts.map(post => (
              <div key={post.id} onClick={() => setSelectedId(post.id)} className="group bg-blue-50/50 rounded-4xl border-2 border-blue-100 p-8 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">UI Test Mock</div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600`}>
                        {post.status}
                      </span>
                      {post.hasExpertReply && <span className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14} /> Expert Answer</span>}
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex gap-2">
                      {post.tags?.map(tag => <span key={tag} className="text-xs font-bold text-muted-foreground">{tag}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 px-8 py-4 bg-card rounded-2xl border border-blue-100">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Answers</p>
                      <p className="text-lg font-black text-blue-600">{post.commentCount}</p>
                    </div>
                    <div className="w-px h-8 bg-blue-100" />
                    <div className="flex items-center gap-3">
                      <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-xl bg-blue-50" />
                      <div className="text-left">
                        <p className="font-bold text-foreground text-sm">{post.author}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Mock User</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 실제 백엔드 API 데이터 */}
            {isLoadingQna ? (
              <div className="text-center py-10 font-bold text-muted-foreground">불러오는 중...</div>
            ) : qnaList.length === 0 ? (
              <div className="text-center py-10 font-bold text-muted-foreground">등록된 전문가 Q&A가 없습니다.</div>
            ) : qnaList.map(post => (
              <div key={post.qnaId} onClick={() => setSelectedId(post.qnaId.toString())} className="group bg-card rounded-4xl border border-border p-8 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        post.status === 'SOLVED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>{post.status}</span>
                      {post.isExpertAnswered && <span className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14} /> Expert Answer</span>}
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex gap-2">
                      {post.tags?.map(tag => <span key={tag} className="text-xs font-bold text-muted-foreground">#{tag.replace('#','')}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 px-8 py-4 bg-muted rounded-2xl border border-border">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Answers</p>
                      <p className="text-lg font-black text-foreground">{post.answerCount || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-3">
                      <img src={post.author?.profileImageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt={post.author?.nickname || 'Unknown'} className="w-10 h-10 rounded-xl" />
                      <div className="text-left">
                        <p className="font-bold text-foreground text-sm">{post.author?.nickname || 'Unknown'}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recruitment' && (
          <div className="space-y-4">
            {isLoadingRecruitment ? (
              <div className="text-center py-10 font-bold text-muted-foreground">불러오는 중...</div>
            ) : recruitmentList.length === 0 ? (
              <div className="text-center py-10 font-bold text-muted-foreground">등록된 팀원 모집 공고가 없습니다.</div>
            ) : recruitmentList.map(post => (
              <div key={post.recruitmentId} onClick={() => setSelectedId(post.recruitmentId.toString())} className="bg-card rounded-4xl border border-border p-8 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Users size={32} className="text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{post.jobTitle}</h3>
                    <div className="flex items-center gap-4 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Building2 size={14} /> {post.organization}</span>
                      <span className="flex items-center gap-1.5 text-primary"><Clock size={14} /> {post.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center bg-muted px-6 py-3 rounded-2xl border border-border">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">모집 마감일</p>
                      <p className="text-sm font-black text-foreground">{post.deadline}</p>
                    </div>
                    <button className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-primary transition-all">자세히 보기</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="space-y-4">
            {isLoadingDataset ? (
              <div className="text-center py-10 font-bold text-muted-foreground">불러오는 중...</div>
            ) : datasetList.length === 0 ? (
              <div className="text-center py-10 font-bold text-muted-foreground">등록된 데이터셋이 없습니다.</div>
            ) : datasetList.map(dataset => (
              <div key={dataset.datasetId} onClick={() => setSelectedId(dataset.datasetId.toString())} className="bg-card rounded-4xl border border-border p-8 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-20 h-20 bg-linear-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform">
                    <Database size={32} className="text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{dataset.title}</h3>
                      {dataset.isExpertVerified && <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded uppercase tracking-widest">Expert Verified</span>}
                    </div>
                    <p className="text-muted-foreground font-medium text-sm line-clamp-1">{dataset.description}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest pt-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-lg"><HardDrive size={12} /> {dataset.fileSize || 'N/A'}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-lg"><Download size={12} /> {dataset.downloadCount || 0}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-lg text-primary"><Database size={12} /> {dataset.fileCount || 0} Files</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-l border-border pl-8">
                    <img src={dataset.author?.profileImageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt={dataset.author?.nickname || 'Unknown'} className="w-12 h-12 rounded-xl" />
                    <div>
                      <p className="font-bold text-foreground text-sm">{dataset.author?.nickname || 'Unknown'}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{dataset.license || 'Custom License'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
