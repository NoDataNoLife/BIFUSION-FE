import { useState } from 'react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatBytes } from '../../lib/liveData';
import type { MyDatasetListResponse, MyRecipeListResponse } from '../../store/useAssetStore';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import DatasetDetailView from '../../components/dashboard/DatasetDetailView';
import CreateAssetModal from '../../components/dashboard/CreateAssetModal';

type Tab = 'FORKED' | 'MINE' | 'UPLOADED' | 'AUGMENTED';
interface Page { content: (MyDatasetListResponse | MyRecipeListResponse)[]; totalPages: number; totalElements: number }
export default function AssetsPage() {
  const [tab, setTab] = useState<Tab>('FORKED');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [create, setCreate] = useState(false);
  const [selected, setSelected] = useState<{ id: number; type: 'recipe' | 'dataset' } | null>(null);
  const recipes = tab === 'FORKED' || tab === 'MINE';
  const { data, loading, error, reload } = useApiQuery<Page>(recipes ? '/assets/recipes' : '/assets/datasets', { type: tab, page, size: 20 });
  const back = () => { setSelected(null); reload(); };
  if (selected?.type === 'recipe') return <RecipeDetail key={selected.id} recipe={{ id: String(selected.id) }} onBack={back}/>;
  if (selected?.type === 'dataset') return <DatasetDetailView key={selected.id} datasetId={selected.id} onBack={back}/>;
  const items = (data?.content ?? []).filter((item) => ('title' in item ? item.title : item.name).toLowerCase().includes(search.toLowerCase()));
  return <main className="p-8 max-w-7xl mx-auto space-y-6">
    <div className="flex justify-between gap-4"><div><h1 className="text-3xl font-bold">내 자산</h1><p className="text-muted-foreground mt-2">내 레시피와 데이터셋을 관리하세요.</p></div><button onClick={() => setCreate(true)} className="px-5 py-2 bg-primary text-white rounded-xl">새 자산 추가</button></div>
    <div className="flex flex-wrap gap-3">{([['FORKED','Fork한 레시피'],['MINE','내 레시피'],['UPLOADED','업로드 데이터'],['AUGMENTED','증강 데이터']] as const).map(([value,label]) => <button key={value} onClick={() => { setTab(value); setPage(0); }} className={`px-5 py-3 rounded-xl ${tab === value ? 'bg-primary text-white' : 'bg-card border border-border'}`}>{label}</button>)}</div>
    <div className="flex gap-3"><input aria-label="현재 페이지 자산 검색" placeholder="현재 페이지에서 제목 검색" value={search} onChange={(event) => setSearch(event.target.value)} className="p-3 bg-card border border-border rounded-xl"/><button onClick={reload} disabled={loading}>새로고침</button></div>
    {loading ? <p>자산을 불러오는 중…</p> : error ? <p role="alert" className="text-red-500">{error}</p> : items.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{items.map((item) => {
      const recipe = 'recipeId' in item;
      const id = recipe ? item.recipeId : item.datasetId;
      const name = recipe ? item.title : item.name;
      return <button key={id} onClick={() => setSelected({ id, type: recipe ? 'recipe' : 'dataset' })} className="text-left p-6 space-y-4 border border-border bg-card rounded-3xl hover:border-primary">
        {item.bannerImageUrl && <img src={item.bannerImageUrl} alt={name} className="w-full h-40 rounded-xl object-cover"/>}
        <h2 className="text-xl font-bold">{name}</h2>
        {recipe ? <><p>{item.description}</p><p className="text-sm text-muted-foreground">평점 {item.rating ?? '정보 없음'} · Fork {item.forkCount ?? '정보 없음'} · 조회 {item.viewCount ?? '정보 없음'}</p></> : <><p>{formatBytes(item.totalSize)} · 파일 {item.fileCount ?? '정보 없음'}개</p><p className="text-sm text-muted-foreground">{item.fileFormats?.join(', ') || '형식 정보 없음'} · {item.uploadedAt || '날짜 정보 없음'}</p></>}
        {item.expertVerified && <p className="text-primary">전문가 검증 완료</p>}
      </button>;
    })}</div> : <p>표시할 자산이 없습니다.</p>}
    {!error && !loading && <div className="flex gap-5 items-center"><button disabled={page === 0} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page + 1} / {Math.max(1, data?.totalPages ?? 0)} 페이지 · 총 {data?.totalElements ?? 0}개</span><button disabled={page + 1 >= (data?.totalPages ?? 0)} onClick={() => setPage((value) => value + 1)}>다음</button></div>}
    <CreateAssetModal isOpen={create} onClose={() => { setCreate(false); reload(); }}/>
  </main>;
}