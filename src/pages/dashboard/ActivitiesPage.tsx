import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Search, ChevronRight, RefreshCw, BookOpen, Database, MessageCircle, Users } from 'lucide-react';
import { DataState } from '../../components/dashboard/DataView';
import api from '../../lib/axios';
import { requestMessage, type ActivityItem, type ActivityPage } from '../../lib/liveData';

export default function ActivitiesPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [version, setVersion] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const refresh = () => {
    setLoading(true); setError(null); setCursor(null); setVersion(value => value + 1);
  };
  useEffect(() => {
    const controller = new AbortController();
    api.get('/mypage/activities', { params: { size: 20, cursor: cursor || undefined }, signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        const data = res.data.data as ActivityPage;
        if (!Array.isArray(data.items)) throw new Error('활동 목록 응답을 확인할 수 없습니다.');
        setItems((previous) => cursor ? [...previous, ...data.items] : data.items);
        setHasNext(data.hasNext); setNextCursor(data.nextCursor);
      }).catch((err) => { if (!controller.signal.aborted) setError(requestMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [cursor, version]);
  const labels = { RECIPE: '레시피', DATASET: '데이터셋', QNA: 'Q&A', RECRUITMENT: '팀 모집' };
  const filtered = items.filter((item) => (type === 'ALL' || item.type === type) && `${item.title} ${item.description ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const destination = (item: ActivityItem) => `/dashboard/community?${item.type === 'RECIPE' ? 'recipeId' : item.type === 'DATASET' ? 'datasetId' : item.type === 'QNA' ? 'qnaId' : 'recruitmentId'}=${item.activityId}`;
  const groups = filtered.reduce<Record<string, ActivityItem[]>>((result, item) => {
    const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : '날짜 미등록';
    (result[date] ??= []).push(item); return result;
  }, {});
  const icons = { RECIPE: BookOpen, DATASET: Database, QNA: MessageCircle, RECRUITMENT: Users };
  return <main className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div><nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1"><span>Dashboard</span><ChevronRight size={12}/><span className="text-primary">Activities</span></nav><h1 className="text-3xl font-black tracking-tight">최근 활동 현황</h1><p className="text-muted-foreground mt-1 font-medium">내가 공유한 연구와 커뮤니티 활동을 한눈에 확인하세요</p></div>
      <div className="flex gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16}/><input aria-label="불러온 활동 검색" placeholder="불러온 활동에서 검색…" value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"/></div><button aria-label="새로고침" disabled={loading} onClick={refresh} className="p-3 bg-card border border-border rounded-xl text-muted-foreground"><RefreshCw size={16}/></button></div>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">{[['ALL', '전체 활동'], ...Object.entries(labels)].map(([value,label]) => <button key={value} onClick={() => setType(value)} className={`px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap border transition-colors ${type === value ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-card text-muted-foreground border-border hover:text-primary'}`}>{label}</button>)}</div>
    {error && <DataState error={error} onRetry={refresh} />}
    <div className="space-y-10">{Object.entries(groups).map(([date, activities]) => <section key={date}>
      <div className="mb-6"><span className="px-4 py-1.5 bg-card border border-border text-xs font-black rounded-full shadow-sm">{date}</span></div>
      <div className="space-y-4 ml-2 border-l-2 border-border pl-6 sm:pl-8">{activities.map(item => { const Icon = icons[item.type] ?? Activity; return <Link to={destination(item)} key={`${item.type}-${item.activityId}`} className="block relative group bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
        <span className="absolute -left-[33px] sm:-left-[41px] top-8 w-4 h-4 rounded-full border-4 border-card bg-primary/40 group-hover:bg-primary"/>
        <div className="flex items-start gap-4"><span className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl"><Icon size={20}/></span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2 mb-2"><span className="text-xs font-bold text-primary">{labels[item.type]}</span><span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.isPublic ? '공개' : '비공개'}</span></div><h2 className="font-black group-hover:text-primary transition-colors">{item.title}</h2><p className="text-muted-foreground text-sm mt-2 line-clamp-2">{item.description}</p></div><ChevronRight className="text-muted-foreground shrink-0" size={18}/></div>
      </Link>; })}</div>
    </section>)}</div>
    {loading ? <DataState loading/> : !error && !filtered.length && <DataState title="활동 기록이 없습니다" description="작성한 글이 없다면 커뮤니티에서 첫 연구 이야기를 공유해 보세요."/>}
    {hasNext && nextCursor && <button disabled={loading} onClick={() => { setLoading(true); setError(null); setCursor(nextCursor); }} className="w-full py-3 rounded-xl border border-border bg-card text-muted-foreground font-bold hover:bg-muted">이전 활동 더 보기</button>}
  </main>;
}
