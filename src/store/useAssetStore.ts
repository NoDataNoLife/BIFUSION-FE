import { create } from 'zustand';
import api from '../lib/axios';

export interface MyDatasetListResponse {
  datasetId: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  fileSize?: string;
  fileCount?: number;
  format?: string;
  category?: string;
  license?: string;
  isPublic?: boolean;
  isExpertVerified?: boolean;
  createdAt: string;
}

export interface MyRecipeListResponse {
  recipeId: number;
  title: string;
  description: string;
  bannerUrl?: string;
  author?: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
  forkCount?: number;
  likeCount?: number;
  isExpertVerified?: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface AssetStore {
  forkedRecipeIds: string[];
  myDatasets: MyDatasetListResponse[];
  myRecipes: MyRecipeListResponse[];
  isLoading: boolean;
  error: string | null;

  toggleFork: (recipeId: string) => void;
  isForked: (recipeId: string) => boolean;

  fetchMyDatasets: (type: 'UPLOADED' | 'AUGMENTED', page?: number, size?: number) => Promise<void>;
  fetchMyRecipes: (type: 'MY' | 'FORKED', page?: number, size?: number) => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  forkedRecipeIds: [],
  myDatasets: [],
  myRecipes: [],
  isLoading: false,
  error: null,

  toggleFork: (recipeId: string) => {
    const { forkedRecipeIds } = get();
    const isAlreadyForked = forkedRecipeIds.includes(recipeId);
    
    if (isAlreadyForked) {
      set({
        forkedRecipeIds: forkedRecipeIds.filter(id => id !== recipeId)
      });
    } else {
      set({
        forkedRecipeIds: [...forkedRecipeIds, recipeId]
      });
    }
  },

  isForked: (recipeId: string) => {
    return get().forkedRecipeIds.includes(recipeId);
  },

  fetchMyDatasets: async (type: 'UPLOADED' | 'AUGMENTED', page = 0, size = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<MyDatasetListResponse> }>('/assets/datasets', {
        params: { type, page, size }
      });
      set({ myDatasets: response.data.data.content, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || '내 데이터셋 목록 조회 실패', isLoading: false });
    }
  },

  fetchMyRecipes: async (type: 'MY' | 'FORKED', page = 0, size = 20) => {
    set({ isLoading: true, error: null });
    try {
      const serverType = type === 'MY' ? 'MINE' : 'FORKED';
      const response = await api.get<{ data: PageResponse<MyRecipeListResponse> }>('/assets/recipes', {
        params: { type: serverType, page, size }
      });
      set({ myRecipes: response.data.data.content, isLoading: false });
    } catch (error: any) {
      set({ myRecipes: [], error: error.message || '내 레시피 목록 조회 실패', isLoading: false });
    }
  },
}));
