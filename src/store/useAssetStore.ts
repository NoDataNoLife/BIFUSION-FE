import type { InspectionTarget } from '../lib/backendContracts';
import { create } from 'zustand';
import api from '../lib/axios';

export interface MyDatasetListResponse {
  inspectionTarget?: InspectionTarget | null;
  datasetId: number;
  name: string;
  expertVerified: boolean;
  bannerImageUrl: string | null;
  totalSize: number | null;
  fileCount: number | null;
  uploadedAt: string | null;
  fileFormats: string[];
}

export interface MyRecipeListResponse {
  inspectionTarget?: InspectionTarget | null;
  forkedFrom?: { recipeId: number; title: string; authorNickname: string; isDeleted: boolean } | null;
  recipeId: number;
  title: string;
  description: string;
  expertVerified: boolean;
  rating: number | null;
  forkCount: number | null;
  viewCount: number | null;
  bannerImageUrl: string | null;
  isDeleted: boolean;
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
  myDatasets: MyDatasetListResponse[];
  myRecipes: MyRecipeListResponse[];
  isLoading: boolean;
  error: string | null;

  fetchMyDatasets: (type: 'UPLOADED' | 'AUGMENTED', page?: number, size?: number) => Promise<void>;
  fetchMyRecipes: (type: 'MY' | 'FORKED', page?: number, size?: number) => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set) => ({
  myDatasets: [],
  myRecipes: [],
  isLoading: false,
  error: null,

  fetchMyDatasets: async (type: 'UPLOADED' | 'AUGMENTED', page = 0, size = 20) => {
    set({ myDatasets: [], myRecipes: [], isLoading: true, error: null });
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
    set({ myDatasets: [], myRecipes: [], isLoading: true, error: null });
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
