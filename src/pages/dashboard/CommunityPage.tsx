import { useState } from 'react';
import { Search, GitFork, MessageCircle, Trophy, Users, Database, ArrowUpDown, Plus, LayoutGrid, List, Award, Heart, CheckCircle, Clock, Building2, Download, Filter, HardDrive } from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import QnaDetail from '../../components/dashboard/QnaDetail';
import RecruitmentDetail from '../../components/dashboard/RecruitmentDetail';
import CommunityDatasetDetail from '../../components/dashboard/CommunityDatasetDetail';
import { useAuthStore } from '../../store/useAuthStore';
import { ALL_RECIPES, type Recipe } from '../../store/mockData';

// --- Types ---
interface ShowcasePost extends Recipe {
  likeCount: number;
}

interface QAPost {
  id: string; title: string; author: string; authorAvatar: string;
  status: string; tags: string[]; commentCount: number; hasExpertReply: boolean;
}

interface RecruitmentPost {
  id: string; title: string; organization: string; tags: string[];
  memberCount: string; deadline: string;
}

interface DatasetPost {
  id: string; title: string; description: string; author: string; authorAvatar: string;
  tags: string[]; fileSize: string; fileCount: number; downloadCount: number;
  upvotes: number; uploadDate: string; license: string; isExpertVerified?: boolean;
}

// --- Mock Data ---
const mockShowcasePosts: ShowcasePost[] = ALL_RECIPES.map(r => ({
  ...r,
  likeCount: r.forkedCount * 3
}));

const mockQAPosts: QAPost[] = [
  { id: 'QA-001', title: 'Diffusion 모델 학습 시 메모리 부족 오류 해결 방법은?', author: '연구자A', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=userA', status: 'Solved', tags: ['#Error', '#Diffusion'], commentCount: 12, hasExpertReply: true },
  { id: 'QA-002', title: 'HIPAA 규정 준수를 위한 데이터 익명화 베스트 프랙티스', author: '연구자B', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=userB', status: 'Expert Answered', tags: ['#HIPAA', '#Privacy'], commentCount: 8, hasExpertReply: true },
];

const mockRecruitmentPosts: RecruitmentPost[] = [
  { id: 'RC-001', title: '심혈관 질환 AI 연구 팀원 모집', organization: '서울대학교병원', tags: ['#Cardiology', '#Research'], memberCount: '3/5', deadline: '2026-02-15' },
  { id: 'RC-002', title: '병리학 이미지 분석 프로젝트 참여자 모집', organization: '연세대학교 의과대학', tags: ['#Pathology', '#ImageAnalysis'], memberCount: '2/4', deadline: '2026-02-20' },
];

const mockDatasetPosts: DatasetPost[] = [
  { id: 'DS-001', title: 'Chest X-Ray Images (Pneumonia)', description: '폐렴 진단을 위한 고해상도 흉부 X-Ray 이미지 데이터셋.', author: '김성한', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim', tags: ['X-Ray', 'Pneumonia'], fileSize: '2.3 GB', fileCount: 5856, downloadCount: 1243, upvotes: 567, uploadDate: '2026-01-10', license: 'CC BY 4.0', isExpertVerified: true },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'qa' | 'recruitment' | 'datasets'>('showcase');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuthStore();

  // --- Sub-page Rendering Logic ---
  if (selectedId) {
    if (activeTab === 'showcase') {
      const post = mockShowcasePosts.find(p => p.id === selectedId);
      if (post) return <RecipeDetail recipe={post} onBack={() => setSelectedId(null)} isAuthor={post.author === user?.name} />;
    }
    if (activeTab === 'qa') {
      const post = mockQAPosts.find(p => p.id === selectedId);
      if (post) return <QnaDetail qaPost={post} onBack={() => setSelectedId(null)} />;
    }
    if (activeTab === 'recruitment') {
      const post = mockRecruitmentPosts.find(p => p.id === selectedId);
      if (post) return <RecruitmentDetail recruitmentPost={post} onBack={() => setSelectedId(null)} />;
    }
    if (activeTab === 'datasets') {
      const post = mockDatasetPosts.find(p => p.id === selectedId);
      if (post) return <CommunityDatasetDetail datasetPost={post} onBack={() => setSelectedId(null)} />;
    }
  }

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header & Main Search */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Research Hub</h1>
            <p className="text-gray-500 font-medium">전 세계 연구자들과 지식과 자산을 공유하세요</p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95">
            <Plus size={20} /> 새로운 게시글 작성
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="레시피, 질문, 데이터셋, 팀 모집 공고를 검색하세요..."
            className="w-full pl-16 pr-6 py-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
          />
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-2">
        <div className="flex gap-10 overflow-x-auto no-scrollbar">
          {(['showcase', 'qa', 'recruitment', 'datasets'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedId(null); }}
              className={`pb-6 text-lg font-black transition-all relative whitespace-nowrap ${
                activeTab === tab ? 'text-primary' : 'text-gray-300 hover:text-gray-500'
              }`}
            >
              {tab === 'showcase' ? '쇼케이스' : tab === 'qa' ? '전문가 Q&A' : tab === 'recruitment' ? '팀원 모집' : '데이터셋'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all uppercase tracking-widest">
            <ArrowUpDown size={14} /> 최신순
          </button>
          <button className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="min-h-[400px]">
        {activeTab === 'showcase' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockShowcasePosts.map(post => (
              <div key={post.id} onClick={() => setSelectedId(post.id)} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative">
                <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                  <ImageWithFallback src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {post.isExpertVerified && (
                    <div className="absolute top-6 right-6 px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-1.5">
                      <Award size={14} /> Expert
                    </div>
                  )}
                </div>
                <div className="p-8 space-y-6">
                  <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                      <span className="text-sm font-bold text-gray-600">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-300 font-black text-[10px] uppercase tracking-widest">
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
            {mockQAPosts.map(post => (
              <div key={post.id} onClick={() => setSelectedId(post.id)} className="group bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        post.status === 'Solved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>{post.status}</span>
                      {post.hasExpertReply && <span className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14} /> Expert Answer</span>}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex gap-2">
                      {post.tags.map(tag => <span key={tag} className="text-xs font-bold text-gray-400">#{tag.replace('#','')}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 px-8 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Answers</p>
                      <p className="text-lg font-black text-gray-900">{post.commentCount}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-3">
                      <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-xl" />
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">{post.author}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">2h ago</p>
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
            {mockRecruitmentPosts.map(post => (
              <div key={post.id} onClick={() => setSelectedId(post.id)} className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Users size={32} className="text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Building2 size={14} /> {post.organization}</span>
                      <span className="flex items-center gap-1.5 text-primary"><Clock size={14} /> {post.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">모집 인원</p>
                      <p className="text-lg font-black text-gray-900">{post.memberCount}</p>
                    </div>
                    <button className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-primary transition-all">지원하기</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="space-y-4">
            {mockDatasetPosts.map(dataset => (
              <div key={dataset.id} onClick={() => setSelectedId(dataset.id)} className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-3 transition-transform">
                    <Database size={32} className="text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{dataset.title}</h3>
                      {dataset.isExpertVerified && <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded uppercase tracking-widest">Expert Verified</span>}
                    </div>
                    <p className="text-gray-500 font-medium text-sm line-clamp-1">{dataset.description}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg"><HardDrive size={12} /> {dataset.fileSize}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg"><Download size={12} /> {dataset.downloadCount}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-primary"><Trophy size={12} /> {dataset.upvotes}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-center pt-4 md:pt-0">
                    <div className="flex items-center gap-2">
                      <img src={dataset.authorAvatar} alt={dataset.author} className="w-8 h-8 rounded-full border border-gray-100" />
                      <span className="text-sm font-bold text-gray-600">{dataset.author}</span>
                    </div>
                    <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
