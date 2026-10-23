import { useState } from 'react';
import { Star, GitFork, Eye, Search, Plus, Calendar, RefreshCw } from 'lucide-react';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import DatasetDetailView from '../../components/dashboard/DatasetDetailView';
import AugmentedAssetsView from '../../components/dashboard/AugmentedAssetsView';
import CreateAssetModal from '../../components/dashboard/CreateAssetModal';
import { AssetCover, DataState, Pagination } from '../../components/dashboard/DataView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatBytes } from '../../lib/liveData';
import type { MyDatasetListResponse, MyRecipeListResponse } from '../../store/useAssetStore';
type Tab = 'recipes' | 'uploaded-recipes' | 'datasets' | 'augmented';
interface Page { content: (MyRecipeListResponse | MyDatasetListResponse)[]; totalPages: number; totalElements: number }
export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<{ id: number; type: 'recipe' | 'dataset' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const recipeTab = activeTab === 'recipes' || activeTab === 'uploaded-recipes';
  const types = { recipes: 'FORKED', 'uploaded-recipes': 'MINE', datasets: 'UPLOADED', augmented: 'AUGMENTED' };
  const { data, error, loading: isLoading, reload } = useApiQuery<Page>(recipeTab ? '/assets/recipes' : '/assets/datasets', { type: types[activeTab], page, size: 12 });
  const back = () => { setSelected(null); reload(); };
  if (selected?.type === 'recipe') return <RecipeDetail key={selected.id} recipe={{ id: String(selected.id) }} onBack={back} />;
  if (selected?.type === 'dataset') return <DatasetDetailView key={selected.id} datasetId={selected.id} onBack={back} />;
  const displayRecipes = (recipeTab ? data?.content ?? [] : []).filter((r): r is MyRecipeListResponse => 'recipeId' in r).filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map(r => ({ id: r.recipeId, title: r.title, description: r.description, thumbnailUrl: r.bannerImageUrl, isExpertVerified: r.expertVerified, rating: r.rating ?? '—', forkedCount: r.forkCount ?? '—', viewCount: r.viewCount ?? '—' }));
  const displayDatasets = (!recipeTab ? data?.content ?? [] : []).filter((d): d is MyDatasetListResponse => 'datasetId' in d).filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map(d => ({ id: d.datasetId, name: d.name, thumbnail: d.bannerImageUrl, size: formatBytes(d.totalSize), fileCount: d.fileCount, uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('ko-KR') : '날짜 미등록', format: d.fileFormats?.join(', ') || '형식 미등록' }));
  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-1 font-medium">내가 보유한 레시피와 데이터셋을 안전하게 관리하세요</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="현재 페이지 자산 검색" placeholder="현재 페이지에서 자산 검색..."
              className="w-64 pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} /> 새 자산 추가
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex max-w-full overflow-x-auto gap-2 p-1 bg-card border border-border rounded-[1.25rem] w-fit shadow-xs">
        {(['recipes', 'uploaded-recipes', 'datasets', 'augmented'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
            className={`px-6 py-2.5 whitespace-nowrap rounded-2xl text-sm font-black transition-all cursor-pointer ${
              activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-gray-600 hover:bg-muted'
            }`}
          >
            {tab === 'recipes' ? 'Fork한 레시피' : tab === 'uploaded-recipes' ? '내 레시피' : tab === 'datasets' ? '업로드 데이터' : '증강 데이터'}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="min-h-80">
        {activeTab === 'augmented' ? <AugmentedAssetsView searchQuery={searchQuery} /> : error ? <DataState error={error} onRetry={reload} /> : isLoading ? (
          <div className="py-20 text-center font-bold text-muted-foreground">자산 데이터를 불러오는 중...</div>
        ) : activeTab.includes('recipe') ? (
          displayRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => setSelected({ id: recipe.id, type: 'recipe' })}
                  role="button" tabIndex={0} aria-label={`${recipe.title} 상세 보기`}
                  onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelected({ id: recipe.id, type: 'recipe' }); } }}
                  className="group bg-card rounded-4xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <AssetCover src={recipe.thumbnailUrl} title={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {recipe.isExpertVerified && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest">
                        Expert
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-lg font-black text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{recipe.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-6">{recipe.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-black text-foreground">{recipe.rating}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><GitFork size={14} /> {recipe.forkedCount}</span>
                        <span className="flex items-center gap-1.5"><Eye size={14} /> {recipe.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <p className="text-foreground font-black text-lg">보유 중인 레시피가 없습니다.</p>
              <p className="text-muted-foreground text-sm font-medium">커뮤니티에서 관심 있는 레시피를 Fork하거나 새로운 레시피를 만들어보세요.</p>
            </div>
          )
        ) : (
          displayDatasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayDatasets.map(dataset => (
                <div
                  key={dataset.id}
                  onClick={() => setSelected({ id: dataset.id, type: 'dataset' })}
                  role="button" tabIndex={0} aria-label={`${dataset.name} 상세 보기`}
                  onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelected({ id: dataset.id, type: 'dataset' }); } }}
                  className="group bg-card rounded-4xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted p-4 flex items-center justify-center">
                    <AssetCover dataset src={dataset.thumbnail} title={dataset.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black text-foreground line-clamp-1 flex-1">{dataset.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Size</p>
                        <p className="text-sm font-bold text-foreground">{dataset.size}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Files</p>
                        <p className="text-sm font-bold text-foreground">{dataset.fileCount?.toLocaleString() ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={12} /> {dataset.uploadedAt}
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{dataset.format}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <p className="text-foreground font-black text-lg">보유 중인 데이터셋이 없습니다.</p>
              <p className="text-muted-foreground text-sm font-medium">새로운 의료 이미지 데이터를 업로드하거나 증강 작업을 실행해 보세요.</p>
            </div>
          )
        )}
      </div>

      {activeTab !== 'augmented' && !isLoading && !error && <Pagination page={page} totalPages={data?.totalPages} totalElements={data?.totalElements} onChange={setPage} />}
      {activeTab !== 'augmented' && <button onClick={reload} disabled={isLoading} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><RefreshCw size={16} />새로고침</button>}
      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); reload(); }}
      />
    </div>
  );
}
