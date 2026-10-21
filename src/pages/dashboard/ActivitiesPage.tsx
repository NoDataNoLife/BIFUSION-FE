import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const labels = { RECIPE: '레시피', DATASET: '데이터셋', QNA: 'Q&A', RECRUITMENT: '팀 모집' };
  const filtered = items.filter((item) => (type === 'ALL' || item.type === type) && `${item.title} ${item.description ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const destination = (item: ActivityItem) => `/dashboard/community?${item.type === 'RECIPE' ? 'recipeId' : item.type === 'DATASET' ? 'datasetId' : item.type === 'QNA' ? 'qnaId' : 'recruitmentId'}=${item.activityId}`;
  return <main className="p-8 max-w-5xl mx-auto space-y-6">
    <h1 className="text-3xl font-bold">내 활동</h1><p className="text-muted-foreground">작성한 레시피·데이터셋·질문·팀 모집 내역입니다.</p>
    <div className="flex flex-wrap gap-3"><input aria-label="불러온 활동 검색" placeholder="불러온 활동에서 검색" value={search} onChange={(event) => setSearch(event.target.value)} className="p-3 border border-border rounded-xl bg-card"/><select aria-label="활동 종류" value={type} onChange={(event) => setType(event.target.value)}><option value="ALL">전체</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button disabled={loading} onClick={() => { setCursor(null); setVersion((value) => value + 1); }}>새로고침</button></div>
    {error && <p role="alert" className="text-red-500">{error} <button onClick={() => setVersion((value) => value + 1)}>다시 시도</button></p>}
    {filtered.map((item) => <article key={`${item.type}-${item.activityId}`} className="p-6 border border-border bg-card rounded-2xl space-y-2"><p className="text-sm text-muted-foreground">{labels[item.type]} · {new Date(item.createdAt).toLocaleString()} · {item.isPublic ? '공개' : '비공개'}</p><Link to={destination(item)} className="font-bold text-lg text-primary">{item.title}</Link><p>{item.description}</p></article>)}
    {loading ? <p>활동을 불러오는 중…</p> : !error && filtered.length === 0 && <p>표시할 활동이 없습니다.</p>}
    {hasNext && nextCursor && <button disabled={loading} onClick={() => setCursor(nextCursor)} className="px-5 py-3 rounded-xl bg-muted">이전 활동 더 보기</button>}
  </main>;
}