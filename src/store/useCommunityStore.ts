import { create } from 'zustand';
import api from '../lib/axios';

export interface AuthorInfo {
  userId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface ExpertQnAListResponse {
  qnaId: number;
  title: string;
  tags: string[];
  status: string;
  isExpertAnswered: boolean;
  author: AuthorInfo;
  answerCount: number;
  createdAt: string;
}

export interface RecruitmentResponse {
  recruitmentId: number;
  jobTitle: string;
  organization: string;
  deadline: string;
  tags: string[];
  createdAt: string;
}

export interface DatasetListResponse {
  datasetId: number;
  title: string;
  description: string;
  isExpertVerified: boolean;
  tags: string[];
  fileSize: string;
  fileCount: number;
  downloadCount: number;
  author: AuthorInfo;
  license: string;
  createdAt: string;
}

export interface DatasetDetailResponse extends DatasetListResponse {
  usageExample?: string;
  verificationStatus?: string;
  thumbnail?: string;
  fileId?: number;
  fileName?: string;
}

export interface RecipeListResponse {
  recipeId: number;
  title: string;
  bannerUrl?: string;
  author: AuthorInfo;
  forkCount: number;
  likeCount: number;
  isExpertVerified: boolean;
}

export interface RecipeDetailResponse {
  recipeId: number;
  title: string;
  description: string;
  bannerUrl?: string;
  isExpertVerified: boolean;
  author: AuthorInfo;
  createdAt: string;
  rating: number;
  reviewCount: number;
  forkCount: number;
  viewCount: number;
  downloadCount: number;
  overview?: {
    content?: string;
    features?: string[];
    recommendations?: string[];
  };
  settings?: {
    model: string;
    steps: number;
    sampler: string;
    cfgScale: number;
    seed: string;
    resolution: string;
    batchSize: number;
  };
  inspectionStatus?: string;
  inspectionResult?: any;
}

export interface ApplicationResponse {
  applicationId: number;
  applicant: AuthorInfo;
  status: string;
  message: string;
  createdAt: string;
}

export interface RecruitmentDetailResponse extends RecruitmentResponse {
  content?: string;
  description?: string;
  author: AuthorInfo;
  applications: ApplicationResponse[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
}

export interface QnaAnswerResponse {
  answerId: number;
  author: AuthorInfo;
  content: string;
  isExpert: boolean;
  createdAt: string;
}

export interface ExpertQnADetailResponse extends ExpertQnAListResponse {
  content: string;
  answers: QnaAnswerResponse[];
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface CommunityStore {
  // States
  qnaList: ExpertQnAListResponse[];
  recruitmentList: RecruitmentResponse[];
  datasetList: DatasetListResponse[];
  recipeList: RecipeListResponse[];

  qnaDetail: ExpertQnADetailResponse | null;
  recruitmentDetail: RecruitmentDetailResponse | null;
  datasetDetail: DatasetDetailResponse | null;
  recipeDetail: RecipeDetailResponse | null;
  
  isLoadingQna: boolean;
  isLoadingRecruitment: boolean;
  isLoadingDataset: boolean;
  isLoadingRecipe: boolean;
  isLoadingDetail: boolean;
  
  error: string | null;

  // Actions
  fetchQnaList: (page?: number, size?: number, sort?: string, keyword?: string) => Promise<void>;
  fetchRecruitmentList: (page?: number, size?: number, sort?: string, keyword?: string) => Promise<void>;
  fetchDatasetList: (page?: number, size?: number, sort?: string, keyword?: string) => Promise<void>;
  fetchRecipeList: (page?: number, size?: number, sort?: string, keyword?: string) => Promise<void>;
  
  fetchQnaDetail: (qnaId: number) => Promise<void>;
  createQnaAnswer: (qnaId: number, content: string) => Promise<void>;
  deleteQna: (qnaId: number) => Promise<void>;
  
  fetchRecruitmentDetail: (recruitmentId: number) => Promise<void>;
  updateApplicationStatus: (recruitmentId: number, applicationId: number, status: string) => Promise<void>;
  deleteRecruitment: (recruitmentId: number) => Promise<void>;
  
  fetchDatasetDetail: (datasetId: number) => Promise<void>;
  deleteDataset: (datasetId: number) => Promise<void>;
  updateDataset: (datasetId: number, payload: { title?: string; description?: string; category?: string; license?: string; tags?: string[]; isPublic?: boolean }) => Promise<void>;
  
  fetchRecipeDetail: (recipeId: number) => Promise<void>;
  forkRecipe: (recipeId: number) => Promise<void>;
  deleteRecipe: (recipeId: number) => Promise<void>;
  
  requestExpertVerification: (targetType: 'RECIPE' | 'DATASET', targetId: number | string, reason: string, reward: number) => Promise<void>;
  deleteRecipeReview: (recipeId: number, reviewId: number) => Promise<void>;
  getDatasetDownloadUrl: (fileId: number) => Promise<string>;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  qnaList: [],
  recruitmentList: [],
  datasetList: [],
  recipeList: [],

  qnaDetail: null,
  recruitmentDetail: null,
  datasetDetail: null,
  recipeDetail: null,

  isLoadingQna: false,
  isLoadingRecruitment: false,
  isLoadingDataset: false,
  isLoadingRecipe: false,
  isLoadingDetail: false,

  error: null,

  fetchQnaList: async (page = 0, size = 10, sort = 'LATEST', keyword = '') => {
    set({ isLoadingQna: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<ExpertQnAListResponse> }>('/community/qna', {
        params: { page, size, sort, keyword: keyword || undefined }
      });
      set({ qnaList: response.data.data.content, isLoadingQna: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch QnA list', isLoadingQna: false });
    }
  },

  fetchRecruitmentList: async (page = 0, size = 10, sort = 'LATEST', keyword = '') => {
    set({ isLoadingRecruitment: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<RecruitmentResponse> }>('/community/recruitments', {
        params: { page, size, sort, keyword: keyword || undefined }
      });
      set({ recruitmentList: response.data.data.content, isLoadingRecruitment: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Recruitment list', isLoadingRecruitment: false });
    }
  },

  fetchDatasetList: async (page = 0, size = 10, sort = 'LATEST', keyword = '') => {
    set({ isLoadingDataset: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<DatasetListResponse> }>('/community/datasets', {
        params: { page, size, sort, keyword: keyword || undefined }
      });
      set({ datasetList: response.data.data.content, isLoadingDataset: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Dataset list', isLoadingDataset: false });
    }
  },

  fetchRecipeList: async (page = 0, size = 10, sort = 'LATEST', keyword = '') => {
    set({ isLoadingRecipe: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<RecipeListResponse> }>('/community/recipes', {
        params: { page, size, sort, keyword: keyword || undefined }
      });
      set({ recipeList: response.data.data.content, isLoadingRecipe: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Recipe list', isLoadingRecipe: false });
    }
  },

  fetchQnaDetail: async (qnaId: number) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await api.get<{ data: ExpertQnADetailResponse }>(`/community/qna/${qnaId}`);
      set({ qnaDetail: response.data.data, isLoadingDetail: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch QnA detail', isLoadingDetail: false });
    }
  },

  createQnaAnswer: async (qnaId: number, content: string) => {
    try {
      await api.post(`/community/qna/${qnaId}/answers`, { content });
      const store = useCommunityStore.getState();
      await store.fetchQnaDetail(qnaId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to create QnA answer' });
      throw error;
    }
  },

  deleteQna: async (qnaId: number) => {
    try {
      await api.delete(`/community/qna/${qnaId}`);
      const store = useCommunityStore.getState();
      await store.fetchQnaList();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete QnA' });
      throw error;
    }
  },

  fetchRecruitmentDetail: async (recruitmentId: number) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await api.get<{ data: RecruitmentDetailResponse }>(`/community/recruitments/${recruitmentId}`);
      set({ recruitmentDetail: response.data.data, isLoadingDetail: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Recruitment detail', isLoadingDetail: false });
    }
  },

  updateApplicationStatus: async (recruitmentId: number, applicationId: number, status: string) => {
    try {
      await api.patch(`/community/recruitments/${recruitmentId}/applications/${applicationId}/status`, { status });
      const store = useCommunityStore.getState();
      await store.fetchRecruitmentDetail(recruitmentId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to update application status' });
      throw error;
    }
  },

  deleteRecruitment: async (recruitmentId: number) => {
    try {
      await api.delete(`/community/recruitments/${recruitmentId}`);
      const store = useCommunityStore.getState();
      await store.fetchRecruitmentList();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete recruitment' });
      throw error;
    }
  },

  fetchDatasetDetail: async (datasetId: number) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await api.get<{ data: DatasetDetailResponse }>(`/datasets/${datasetId}`);
      set({ datasetDetail: response.data.data, isLoadingDetail: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Dataset detail', isLoadingDetail: false });
    }
  },

  deleteDataset: async (datasetId: number) => {
    try {
      await api.delete(`/datasets/${datasetId}`);
      const store = useCommunityStore.getState();
      await store.fetchDatasetList();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete dataset' });
      throw error;
    }
  },

  updateDataset: async (datasetId: number, payload: { title?: string; description?: string; category?: string; license?: string; tags?: string[]; isPublic?: boolean }) => {
    try {
      await api.patch(`/datasets/${datasetId}`, payload);
      const store = useCommunityStore.getState();
      await store.fetchDatasetDetail(datasetId);
      await store.fetchDatasetList();
    } catch (error: any) {
      set({ error: error.message || 'Failed to update dataset' });
      throw error;
    }
  },

  fetchRecipeDetail: async (recipeId: number) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await api.get<{ data: RecipeDetailResponse }>(`/community/recipes/${recipeId}`);
      set({ recipeDetail: response.data.data, isLoadingDetail: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Recipe detail', isLoadingDetail: false });
    }
  },

  deleteRecipe: async (recipeId: number) => {
    try {
      await api.delete(`/community/recipes/${recipeId}`);
      const store = useCommunityStore.getState();
      await store.fetchRecipeList();
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete recipe' });
      throw error;
    }
  },

  forkRecipe: async (recipeId: number) => {
    try {
      await api.post(`/community/recipes/${recipeId}/fork`);
      const store = useCommunityStore.getState();
      await store.fetchRecipeDetail(recipeId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to fork recipe' });
      throw error;
    }
  },

  requestExpertVerification: async (targetType: 'RECIPE' | 'DATASET', targetId: number | string, reason: string, reward: number) => {
    try {
      await api.post('/inspections', { targetType, targetId, reason, reward });
    } catch (error: any) {
      set({ error: error.message || 'Failed to request expert verification' });
      throw error;
    }
  },

  deleteRecipeReview: async (recipeId: number, reviewId: number) => {
    try {
      await api.delete(`/community/recipes/${recipeId}/reviews/${reviewId}`);
    } catch (error: any) {
      set({ error: '댓글 삭제 중 오류가 발생했습니다.' });
      throw error;
    }
  },

  getDatasetDownloadUrl: async (fileId: number) => {
    try {
      const response = await api.post(`/files/${fileId}/download`);
      return response.data.data.presignedUrl;
    } catch (error) {
      console.error('Failed to get download URL:', error);
      throw error;
    }
  },
}));
