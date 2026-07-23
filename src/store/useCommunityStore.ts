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
  
  isLoadingQna: boolean;
  isLoadingRecruitment: boolean;
  isLoadingDataset: boolean;
  
  error: string | null;

  // Actions
  fetchQnaList: (page?: number, size?: number, sort?: string) => Promise<void>;
  fetchRecruitmentList: (page?: number, size?: number, sort?: string) => Promise<void>;
  fetchDatasetList: (page?: number, size?: number, sort?: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  qnaList: [],
  recruitmentList: [],
  datasetList: [],

  isLoadingQna: false,
  isLoadingRecruitment: false,
  isLoadingDataset: false,

  error: null,

  fetchQnaList: async (page = 0, size = 10, sort = 'LATEST') => {
    set({ isLoadingQna: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<ExpertQnAListResponse> }>('/api/v1/community/qna', {
        params: { page, size, sort }
      });
      set({ qnaList: response.data.data.content, isLoadingQna: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch QnA list', isLoadingQna: false });
    }
  },

  fetchRecruitmentList: async (page = 0, size = 10, sort = 'LATEST') => {
    set({ isLoadingRecruitment: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<RecruitmentResponse> }>('/api/v1/community/recruitments', {
        params: { page, size, sort }
      });
      set({ recruitmentList: response.data.data.content, isLoadingRecruitment: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Recruitment list', isLoadingRecruitment: false });
    }
  },

  fetchDatasetList: async (page = 0, size = 10, sort = 'LATEST') => {
    set({ isLoadingDataset: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<DatasetListResponse> }>('/api/v1/community/datasets', {
        params: { page, size, sort }
      });
      set({ datasetList: response.data.data.content, isLoadingDataset: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Dataset list', isLoadingDataset: false });
    }
  }
}));
