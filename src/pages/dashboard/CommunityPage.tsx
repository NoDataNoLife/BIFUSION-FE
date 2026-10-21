import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useApiQuery } from '../../hooks/useApiQuery';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import DatasetDetailView from '../../components/dashboard/DatasetDetailView';
import QnaDetail from '../../components/dashboard/QnaDetail';
import RecruitmentDetail from '../../components/dashboard/RecruitmentDetail';
import CreatePostModal from '../../components/community/CreatePostModal';

type Tab = 'showcase' | 'qa' | 'datasets' | 'recruitment';
const config = { showcase: { label: '레시피', endpoint: 'recipes', key: 'recipeId' }, qa: { label: 'Q&A', endpoint: 'qna', key: 'qnaId' }, datasets: { label: '데이터셋', endpoint: 'datasets', key: 'datasetId' }, recruitment: { label: '팀 모집', endpoint: 'recruitments', key: 'recruitmentId' } };
interface Item { recipeId?: number; qnaId?: number; datasetId?: number; recruitmentId?: number; title?: string; jobTitle?: string; description?: string; organization?: string; author?: { nickname: string }; forkCount?: number; likeCount?: number; answerCount?: number; bannerUrl?: string; isExpertVerified?: boolean }
interface Page { content: Item[]; totalPages: number; totalElements: number }
export default function CommunityPage() {
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
  return <main className="p-8 max-w-7xl mx-auto space-y-6">
    <div className="flex justify-between gap-4"><div><h1 className="text-3xl font-bold">커뮤니티</h1><p className="mt-2 text-muted-foreground">연구 레시피와 데이터셋을 공유하고 함께 연구할 팀을 찾아보세요.</p></div><button onClick={() => setCreate(true)} className="px-5 py-3 rounded-xl bg-primary text-white">새 글 작성</button></div>
    <div className="flex flex-wrap gap-3">{(Object.keys(config) as Tab[]).map((value) => <button key={value} onClick={() => { setTab(value); setPage(0); setSort('LATEST'); setParams({}); }} className={`px-5 py-3 rounded-xl ${tab === value ? 'bg-primary text-white' : 'bg-card border border-border'}`}>{config[value].label}</button>)}</div>
    <div className="flex gap-3"><input aria-label="게시물 검색" placeholder="게시물 검색" value={search} onChange={(event) => setSearch(event.target.value)} className="p-3 border border-border rounded-xl bg-card"/>{tab === 'showcase' && <select aria-label="레시피 정렬" value={sort} onChange={(event) => { setSort(event.target.value); setPage(0); }}><option value="LATEST">최신순</option><option value="MOST_POPULAR">좋아요순</option><option value="MOST_FORKED">Fork순</option></select>}<button disabled={loading} onClick={reload}>새로고침</button></div>
    {loading ? <p>게시물을 불러오는 중…</p> : error ? <p role="alert" className="text-red-500">{error}</p> : data?.content.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{data.content.map((item) => {
      const id = item.recipeId ?? item.qnaId ?? item.datasetId ?? item.recruitmentId;
      return <button key={id} onClick={() => { if (id) setParams({ [active.key]: String(id) }); }} className="text-left p-6 space-y-4 bg-card border border-border rounded-3xl hover:border-primary">
        {item.bannerUrl && <img src={item.bannerUrl} alt={item.title || ''} className="h-40 w-full object-cover rounded-xl"/>}
        <h2 className="text-xl font-bold">{item.title ?? item.jobTitle}</h2><p className="text-muted-foreground line-clamp-3">{item.description ?? item.organization}</p>
        {item.author && <p>{item.author.nickname || '탈퇴한 사용자'}</p>}
        <div className="flex gap-3 text-sm text-muted-foreground">{item.forkCount != null && <span>Fork {item.forkCount}</span>}{item.likeCount != null && <span>좋아요 {item.likeCount}</span>}{item.answerCount != null && <span>답변 {item.answerCount}</span>}</div>
        {item.isExpertVerified && <p className="text-primary">전문가 검증 완료</p>}
      </button>;
    })}</div> : <p>조건에 맞는 게시물이 없습니다.</p>}
    {!loading && !error && <div className="flex gap-5"><button disabled={page === 0} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page + 1} / {Math.max(1, data?.totalPages ?? 0)} 페이지 · 총 {data?.totalElements ?? 0}개</span><button disabled={page + 1 >= (data?.totalPages ?? 0)} onClick={() => setPage((value) => value + 1)}>다음</button></div>}
    <CreatePostModal isOpen={create} onClose={() => { setCreate(false); reload(); }}/>
  </main>;
}