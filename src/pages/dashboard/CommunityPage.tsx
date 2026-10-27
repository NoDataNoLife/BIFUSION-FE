import RecipeOrigin from '../../components/community/RecipeOrigin';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useApiQuery } from '../../hooks/useApiQuery';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import DatasetDetailView from '../../components/dashboard/DatasetDetailView';
import QnaDetail from '../../components/dashboard/QnaDetail';
import RecruitmentDetail from '../../components/dashboard/RecruitmentDetail';
import CreatePostModal from '../../components/community/CreatePostModal';

import { Search, GitFork, Users, Database, Plus, Award, CheckCircle, Clock, Building2, Download, HardDrive, RefreshCw } from 'lucide-react';
import { AssetCover, DataState, Pagination } from '../../components/dashboard/DataView';
import type { RecipeListResponse, DatasetListResponse, ExpertQnAListResponse, RecruitmentResponse } from '../../store/useCommunityStore';
type Tab = 'showcase' | 'qa' | 'datasets' | 'recruitment';
const config = { showcase: { label: '레시피', endpoint: 'recipes', key: 'recipeId' }, qa: { label: 'Q&A', endpoint: 'qna', key: 'qnaId' }, datasets: { label: '데이터셋', endpoint: 'datasets', key: 'datasetId' }, recruitment: { label: '팀 모집', endpoint: 'recruitments', key: 'recruitmentId' } };
type Item = RecipeListResponse | DatasetListResponse | ExpertQnAListResponse | RecruitmentResponse;
interface Page { content: Item[]; totalPages: number; totalElements: number }
export default function CommunityPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => (Object.keys(config) as Tab[]).find((key) => params.has(config[key].key)) ?? 'showcase');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [create, setCreate] = useState(false);
  const [sort, setSort] = useState('LATEST');
  const selection = (Object.keys(config) as Tab[]).find((key) => params.has(config[key].key));
  const selectedId = selection ? params.get(config[selection].key) : null;
  const active = config[tab];
  const { data, error, loading, reload } = useApiQuery<Page>(`/community/${active.endpoint}`, { page, size: 12, sort, keyword: keyword || undefined });
  useEffect(() => { const timer = setTimeout(() => { setKeyword(search.trim()); setPage(0); }, 300); return () => clearTimeout(timer); }, [search]);
  const back = () => { setParams({}); reload(); };
  const remove = async (endpoint: string, id: number) => {
    if (!confirm('게시물을 삭제하시겠습니까?')) return;
    try { await api.delete(endpoint === 'datasets' ? `/datasets/${id}` : `/community/${endpoint}/${id}`); back(); }
    catch (err) { alert(requestMessage(err, '게시물을 삭제하지 못했습니다.')); }
  };
  if (selectedId && selection) {
    const id = Number(selectedId);
    if (!Number.isSafeInteger(id) || id <= 0) return <div className="p-8"><p>올바른 게시물 번호가 아닙니다.</p><button onClick={back}>목록으로</button></div>;
    if (selection === 'showcase') return <RecipeDetail key={id} recipe={{ id: selectedId }} onBack={back}/>;
    if (selection === 'datasets') return <DatasetDetailView key={id} datasetId={id} onBack={back}/>;
    if (selection === 'qa') return <QnaDetail key={id} qnaId={id} onBack={back} onDelete={() => remove('qna', id)}/>;
    return <RecruitmentDetail key={id} recruitmentId={id} onBack={back} onDelete={() => remove('recruitments', id)}/>;
  }
  const activeTab = tab;
  const searchQuery = search;
  const setSearchQuery = setSearch;
  const isCreateModalOpen = create;
  const setIsCreateModalOpen = setCreate;
  const setActiveTab = (value: Tab) => { setTab(value); setPage(0); setSort('LATEST'); };
  const setSelectedId = (id: string | null) => setParams(id ? { [active.key]: id } : {});
  const recipeList = tab === 'showcase' ? (data?.content ?? []) as RecipeListResponse[] : [];
  const qnaList = tab === 'qa' ? (data?.content ?? []) as ExpertQnAListResponse[] : [];
  const datasetList = tab === 'datasets' ? (data?.content ?? []) as DatasetListResponse[] : [];
  const recruitmentList = tab === 'recruitment' ? (data?.content ?? []) as RecruitmentResponse[] : [];
  const isLoadingRecipe = loading, isLoadingQna = loading, isLoadingDataset = loading, isLoadingRecruitment = loading;
  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header & Main Search */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-foreground tracking-tight">Research Hub</h1>
            <p className="text-muted-foreground font-medium">전 세계 연구자들과 지식과 자산을 공유하세요</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-3xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={20} /> 새로운 게시글 작성
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            aria-label="게시물 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="레시피, 질문, 데이터셋, 팀 모집 공고를 검색하세요..."
            className="w-full pl-16 pr-6 py-5 bg-card border border-border rounded-3xl shadow-sm text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
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
              className={`pb-4 text-base font-black transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'showcase' ? '쇼케이스 (레시피)' : tab === 'qa' ? '전문가 Q&A' : tab === 'recruitment' ? '팀원 모집' : '데이터셋'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {tab === 'showcase' && <select aria-label="레시피 정렬" value={sort} onChange={e => { setSort(e.target.value); setPage(0); }} className="px-4 py-2.5 bg-card border border-border rounded-xl font-bold text-xs"><option value="LATEST">최신순</option><option value="MOST_FORKED">Fork순</option></select>}
          <button aria-label="새로고침" onClick={reload} disabled={loading} className="p-2.5 bg-card border border-border text-muted-foreground hover:text-primary rounded-xl"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="min-h-100">
        {error && <DataState error={error} onRetry={reload} />}
        {!error && activeTab === 'showcase' && (
          <div className="space-y-6">
            {isLoadingRecipe ? (
              <div className="text-center py-10 font-bold text-muted-foreground">레시피 목록을 불러오는 중...</div>
            ) : recipeList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipeList.map(post => (
                  <div key={post.recipeId} onClick={() => setSelectedId(post.recipeId.toString())} role="button" tabIndex={0} aria-label={`${post.title} 상세 보기`} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setSelectedId(post.recipeId.toString()); } }} className="group bg-card rounded-[2.5rem] border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative">
                    <div className="aspect-4/3 overflow-hidden bg-muted">
                      <AssetCover
                        src={post.bannerUrl}
                        title={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {post.isExpertVerified && (
                        <div className="absolute top-6 right-6 px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-1.5">
                          <Award size={14} /> Expert
                        </div>
                      )}
                    </div>
                    <div className="p-8 space-y-6">
                      <h3 className="text-xl font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <div className="mb-3" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}><RecipeOrigin origin={post.forkedFrom}/></div>
                      <div className="flex items-center justify-between pt-6 border-t border-border">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar src={post.author?.profileImageUrl || '/defaultUserProfile.png'} alt={post.author?.nickname || '탈퇴한 사용자'} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                          <span className="text-sm font-bold text-muted-foreground">{post.author?.nickname || '탈퇴한 사용자'}</span>
                        </div>

                        <div className="flex items-center gap-4 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><GitFork size={14} /> {post.forkCount ?? '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DataState title="아직 등록된 레시피가 없습니다" description="첫 연구 레시피를 공유해 보세요." />
            )}
          </div>
        )}

        {!error && activeTab === 'qa' && (
          <div className="space-y-4">
            {isLoadingQna ? (
              <div className="text-center py-10 font-bold text-muted-foreground">불러오는 중...</div>
            ) : qnaList.length === 0 ? (
              <div className="text-center py-10 font-bold text-muted-foreground">등록된 전문가 Q&A가 없습니다.</div>
            ) : qnaList.map(post => (
              <div key={post.qnaId} onClick={() => setSelectedId(post.qnaId.toString())} role="button" tabIndex={0} aria-label={`${post.title} 상세 보기`} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setSelectedId(post.qnaId.toString()); } }} className="group bg-card rounded-3xl border border-border p-7 hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        post.status === 'SOLVED'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>{post.status}</span>
                      {post.isExpertAnswered && <span className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14} /> Expert Answer</span>}
                    </div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex gap-2">
                      {post.tags?.map(tag => <span key={tag} className="text-xs font-bold text-muted-foreground">#{tag.replace('#','')}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 px-8 py-4 bg-muted/40 rounded-2xl border border-border">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Answers</p>
                      <p className="text-lg font-black text-foreground">{post.answerCount ?? '—'}</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.author?.userId) navigate(`/dashboard/profile/${post.author.userId}`);
                      }}
                      className="flex items-center gap-3 hover:opacity-80 cursor-pointer group/author"
                      title="작성자 프로필 보기"
                    >
                      <ProfileAvatar src={post.author?.profileImageUrl || '/defaultUserProfile.png'} alt={post.author?.nickname || '탈퇴한 사용자'} className="w-10 h-10 rounded-xl bg-card border border-border group-hover/author:ring-2 group-hover/author:ring-primary transition-all" />
                      <div className="text-left">
                        <p className="font-bold text-foreground text-sm group-hover/author:text-primary transition-colors">{post.author?.nickname || '탈퇴한 사용자'}</p>
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

        {!error && activeTab === 'recruitment' && (
          <div className="space-y-4">
            {isLoadingRecruitment ? (
              <div className="text-center py-10 font-bold text-muted-foreground">불러오는 중...</div>
            ) : recruitmentList.length === 0 ? (
              <div className="text-center py-10 font-bold text-muted-foreground">등록된 팀원 모집 공고가 없습니다.</div>
            ) : recruitmentList.map(post => (
              <div key={post.recruitmentId} onClick={() => setSelectedId(post.recruitmentId.toString())} role="button" tabIndex={0} aria-label={`${post.jobTitle} 상세 보기`} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setSelectedId(post.recruitmentId.toString()); } }} className="bg-card rounded-4xl border border-border p-8 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group">
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
                    <div className="text-center bg-muted/40 px-6 py-3 rounded-2xl border border-border">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">모집 마감일</p>
                      <p className="text-sm font-black text-foreground">{post.deadline}</p>
                    </div>
                    <button className="px-6 py-3.5 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all cursor-pointer">자세히 보기</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && activeTab === 'datasets' && (
          <div className="space-y-4">
            {isLoadingDataset ? (
              <div className="text-center py-10 font-bold text-muted-foreground">불러오는 중...</div>
            ) : datasetList.length === 0 ? (
              <div className="text-center py-10 font-bold text-muted-foreground">등록된 데이터셋이 없습니다.</div>
            ) : datasetList.map(dataset => (
              <div key={dataset.datasetId} onClick={() => setSelectedId(dataset.datasetId.toString())} role="button" tabIndex={0} aria-label={`${dataset.title} 상세 보기`} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setSelectedId(dataset.datasetId.toString()); } }} className="bg-card rounded-3xl border border-border p-8 hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-20 h-20 overflow-hidden [&>div]:min-h-0 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform">
                    <AssetCover src={dataset.bannerImageUrl} title={dataset.title} dataset/>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{dataset.title}</h3>
                      {dataset.isExpertVerified && <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-[9px] font-black rounded-md uppercase tracking-widest">Expert Verified</span>}
                    </div>
                    <p className="text-muted-foreground font-medium text-sm line-clamp-1">{dataset.description}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest pt-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-muted/60 border border-border/50 rounded-lg"><HardDrive size={12} /> {dataset.fileSize || 'N/A'}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-muted/60 border border-border/50 rounded-lg"><Download size={12} /> {dataset.downloadCount ?? '—'}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-muted/60 border border-border/50 rounded-lg text-primary"><Database size={12} /> {dataset.fileCount ?? '—'} Files</span>
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dataset.author?.userId) navigate(`/dashboard/profile/${dataset.author.userId}`);
                    }}
                    className="flex items-center gap-4 border-l border-border pl-8 hover:opacity-80 cursor-pointer group/author"
                    title="작성자 프로필 보기"
                  >
                    <ProfileAvatar src={dataset.author?.profileImageUrl || '/defaultUserProfile.png'} alt={dataset.author?.nickname || '탈퇴한 사용자'} className="w-12 h-12 rounded-xl border border-border group-hover/author:ring-2 group-hover/author:ring-primary transition-all" />
                    <div>
                      <p className="font-bold text-foreground text-sm group-hover/author:text-primary transition-colors">{dataset.author?.nickname || '탈퇴한 사용자'}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{dataset.license || '라이선스 미등록'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && !error && <Pagination page={page} totalPages={data?.totalPages} totalElements={data?.totalElements} onChange={setPage} />}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); reload(); }}
      />
    </div>
  );
}
