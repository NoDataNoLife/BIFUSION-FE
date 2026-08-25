import { useState, useEffect } from 'react';
import { Star, GitFork, Eye, Search, Plus, Calendar, Download, Trash2 } from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import AssetDatasetDetail from '../../components/dashboard/AssetDatasetDetail';
import { useAssetStore } from '../../store/useAssetStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { ALL_RECIPES, type Recipe } from '../../store/mockData';
import CreateAssetModal from '../../components/dashboard/CreateAssetModal';

interface DatasetItem {
  id: string;
  name: string;
  type: 'uploaded' | 'augmented';
  size: string;
  fileCount: number;
  thumbnail: string;
  uploadedAt: string;
  format: string;
  description?: string;
  tags?: string[];
  verificationStatus?: 'NONE' | 'PENDING' | 'COMPLETED';
}

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'uploaded-recipes' | 'datasets' | 'augmented'>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { user } = useAuthStore();
  const { forkedRecipeIds, myDatasets, myRecipes, isLoading, fetchMyDatasets, fetchMyRecipes } = useAssetStore();
  const { deleteDataset, deleteRecipe } = useCommunityStore();

  useEffect(() => {
    if (activeTab === 'recipes') {
      fetchMyRecipes('FORKED');
    } else if (activeTab === 'uploaded-recipes') {
      fetchMyRecipes('MY');
    } else if (activeTab === 'datasets') {
      fetchMyDatasets('UPLOADED');
    } else if (activeTab === 'augmented') {
      fetchMyDatasets('AUGMENTED');
    }
  }, [activeTab, fetchMyDatasets, fetchMyRecipes]);

  // Map server myRecipes to Recipe format
  const serverRecipes: Recipe[] = myRecipes.map((r) => ({
    id: r.recipeId.toString(),
    title: r.title,
    description: r.description || '내 자산에 등록된 연구 파이프라인 레시피입니다.',
    author: r.author?.nickname || user?.name || '나',
    authorAvatar: r.author?.profileImageUrl || user?.profileImageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    thumbnailUrl: r.bannerUrl || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=80',
    createdAt: r.createdAt || new Date().toISOString(),
    rating: 4.9,
    reviewCount: 0,
    forkedCount: r.forkCount || 0,
    viewCount: 42,
    downloadCount: 15,
    isExpertVerified: r.isExpertVerified || false,
    isFavorited: false,
    overview: {
      content: '나만의 증강 파이프라인 레시피입니다.',
      features: ['정밀 복원', '노이즈 감소'],
      recommendations: ['맞춤형 질환 분류 모델'],
    },
    settings: {
      model: 'BIFUSION-Diffusion-v2.1',
      steps: 50,
      sampler: 'Euler a',
      cfgScale: 7.5,
      seed: '42',
      resolution: '512x512',
      batchSize: 4,
    },
  }));

  // Fallback mock recipes if server returns empty
  const fallbackFilteredRecipes = ALL_RECIPES.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'recipes') {
      return forkedRecipeIds.includes(r.id) && matchesSearch;
    } else if (activeTab === 'uploaded-recipes') {
      return (r.author === user?.name || r.id === '1' || r.id === '2') && matchesSearch;
    }
    return matchesSearch;
  });

  const displayRecipes =
    serverRecipes.length > 0
      ? serverRecipes.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : fallbackFilteredRecipes;

  // Map server myDatasets to DatasetItem format
  const serverDatasets: DatasetItem[] = myDatasets.map((d) => ({
    id: d.datasetId.toString(),
    name: d.title,
    type: activeTab === 'augmented' ? 'augmented' : 'uploaded',
    size: d.fileSize || '1.2 GB',
    fileCount: d.fileCount || 100,
    thumbnail: d.thumbnailUrl || 'https://images.unsplash.com/photo-1682706841289-9d7ddf5eb999?w=800&q=80',
    uploadedAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '2026-08-25',
    format: d.format || 'PNG, CSV',
    description: d.description,
    verificationStatus: d.isExpertVerified ? 'COMPLETED' : 'NONE',
  }));

  const displayDatasets = serverDatasets.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedRecipe) {
    return (
      <RecipeDetail 
        recipe={selectedRecipe} 
        onBack={() => setSelectedRecipe(null)} 
        isAuthor={selectedRecipe.author === user?.name || activeTab === 'uploaded-recipes'}
        onDelete={async () => {
          if (confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
            const numericId = Number(selectedRecipe.id.replace(/\D/g, ''));
            if (numericId) {
              await deleteRecipe(numericId);
            }
            alert('레시피가 삭제되었습니다.');
            setSelectedRecipe(null);
            fetchMyRecipes(activeTab === 'recipes' ? 'FORKED' : 'MY');
          }
        }}
      />
    );
  }

  if (selectedDataset) {
    return (
      <AssetDatasetDetail 
        dataset={selectedDataset} 
        onBack={() => setSelectedDataset(null)} 
        onDelete={async () => {
          if (confirm('정말로 이 데이터셋을 삭제하시겠습니까?')) {
            const numericId = Number(selectedDataset.id.replace(/\D/g, ''));
            if (numericId) {
              await deleteDataset(numericId);
            }
            alert('데이터셋이 삭제되었습니다.');
            setSelectedDataset(null);
            fetchMyDatasets(activeTab === 'datasets' ? 'UPLOADED' : 'AUGMENTED');
          }
        }} 
      />
    );
  }

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-1 font-medium">내가 보유한 레시피와 데이터셋을 안전하게 관리하세요</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ASSET 검색..."
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
      <div className="flex gap-2 p-1 bg-card border border-border rounded-[1.25rem] w-fit shadow-xs">
        {(['recipes', 'uploaded-recipes', 'datasets', 'augmented'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all cursor-pointer ${
              activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-gray-600 hover:bg-muted'
            }`}
          >
            {tab === 'recipes' ? 'Fork한 레시피' : tab === 'uploaded-recipes' ? '내 레시피' : tab === 'datasets' ? '업로드 데이터' : '증강 데이터'}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="min-h-80">
        {isLoading ? (
          <div className="py-20 text-center font-bold text-muted-foreground">자산 데이터를 불러오는 중...</div>
        ) : activeTab.includes('recipe') ? (
          displayRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRecipes.map(recipe => (
                <div 
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="group bg-card rounded-4xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <ImageWithFallback src={recipe.thumbnailUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  onClick={() => setSelectedDataset(dataset)}
                  className="group bg-card rounded-4xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted p-4 flex items-center justify-center">
                    <img src={dataset.thumbnail} alt={dataset.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button className="p-3 bg-card rounded-xl hover:bg-primary hover:text-white transition-all text-foreground cursor-pointer"><Download size={20} /></button>
                      <button className="p-3 bg-card rounded-xl hover:bg-red-500 hover:text-white transition-all text-red-500 cursor-pointer"><Trash2 size={20} /></button>
                    </div>
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
                        <p className="text-sm font-bold text-foreground">{dataset.fileCount.toLocaleString()}</p>
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
      
      <CreateAssetModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
