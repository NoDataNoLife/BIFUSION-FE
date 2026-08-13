import { useState } from 'react';
import { Star, GitFork, Eye, Award, Search, Plus, Database, Calendar, Download, Trash2, MoreVertical } from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecipeDetail from '../../components/dashboard/RecipeDetail';
import AssetDatasetDetail from '../../components/dashboard/AssetDatasetDetail';
import { useAssetStore } from '../../store/useAssetStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ALL_RECIPES, type Recipe } from '../../store/mockData';

interface Dataset {
  id: string;
  name: string;
  type: 'uploaded' | 'augmented';
  size: string;
  fileCount: number;
  thumbnail: string;
  uploadedAt: string;
  format: string;
  verificationStatus?: 'none' | 'pending' | 'verified';
}

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'uploaded-recipes' | 'datasets' | 'augmented'>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { forkedRecipeIds } = useAssetStore();
  const { user } = useAuthStore();

  const datasets: Dataset[] = [
    {
      id: 'd1',
      name: 'ECG_Raw_Dataset_2024',
      type: 'uploaded',
      size: '2.3 GB',
      fileCount: 5420,
      thumbnail: 'https://images.unsplash.com/photo-1682706841289-9d7ddf5eb999?w=800&q=80',
      uploadedAt: '2025-01-28',
      format: 'PNG, CSV',
      verificationStatus: 'verified',
    },
    {
      id: 'a1',
      name: 'ECG_Augmented_v2',
      type: 'augmented',
      size: '8.9 GB',
      fileCount: 18240,
      thumbnail: 'https://images.unsplash.com/photo-1682706841289-9d7ddf5eb999?w=800&q=80',
      uploadedAt: '2025-01-30',
      format: 'PNG, CSV',
      verificationStatus: 'verified',
    },
  ];

  const filteredRecipes = ALL_RECIPES.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'recipes') {
      return forkedRecipeIds.includes(r.id) && matchesSearch;
    } else if (activeTab === 'uploaded-recipes') {
      return r.author === user?.name && matchesSearch;
    }
    return matchesSearch;
  });

  const filteredDatasets = datasets.filter(d => 
    (activeTab === 'datasets' ? d.type === 'uploaded' : d.type === 'augmented') &&
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedRecipe) {
    return <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} isAuthor={selectedRecipe.author === user?.name} />;
  }

  if (selectedDataset) {
    return <AssetDatasetDetail dataset={selectedDataset} onBack={() => setSelectedDataset(null)} onDelete={() => setSelectedDataset(null)} />;
  }

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-1 font-medium">내가 보유한 레시피와 데이터셋을 관리하세요</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ASSET 검색..."
              className="w-64 pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm whitespace-nowrap">
            <Plus size={18} /> 새 자산 추가
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-card border border-border rounded-[1.25rem] w-fit shadow-sm">
        {(['recipes', 'uploaded-recipes', 'datasets', 'augmented'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-gray-600 hover:bg-muted'
            }`}
          >
            {tab === 'recipes' ? 'Fork한 레시피' : tab === 'uploaded-recipes' ? '내 레시피' : tab === 'datasets' ? '업로드 데이터' : '증강 데이터'}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeTab.includes('recipe') ? (
          filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
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
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
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
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground font-bold">표시할 레시피가 없습니다.</p>
            </div>
          )
        ) : (
          filteredDatasets.map(dataset => (
            <div 
              key={dataset.id}
              onClick={() => setSelectedDataset(dataset)}
              className="group bg-card rounded-4xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
            >
              <div className="aspect-video relative overflow-hidden bg-muted p-4 flex items-center justify-center">
                <img src={dataset.thumbnail} alt={dataset.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-3 bg-card rounded-xl hover:bg-primary hover:text-white transition-all text-foreground"><Download size={20} /></button>
                  <button className="p-3 bg-card rounded-xl hover:bg-red-500 hover:text-white transition-all text-red-500"><Trash2 size={20} /></button>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-foreground line-clamp-1 flex-1">{dataset.name}</h3>
                  <button className="p-1 hover:bg-muted rounded-lg"><MoreVertical size={16} className="text-muted-foreground" /></button>
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
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} /> {dataset.uploadedAt}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{dataset.format}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
