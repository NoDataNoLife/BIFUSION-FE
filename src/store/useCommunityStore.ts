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

export interface ApplicationResponse {
  applicationId: number;
  applicant: AuthorInfo;
  status: string;
  message: string;
  createdAt: string;
}

export interface RecruitmentDetailResponse extends RecruitmentResponse {
  content: string;
  author: AuthorInfo;
  applications: ApplicationResponse[];
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

  qnaDetail: ExpertQnADetailResponse | null;
  recruitmentDetail: RecruitmentDetailResponse | null;
  
  isLoadingQna: boolean;
  isLoadingRecruitment: boolean;
  isLoadingDataset: boolean;
  isLoadingDetail: boolean;
  
  error: string | null;

  // Actions
  fetchQnaList: (page?: number, size?: number, sort?: string) => Promise<void>;
  fetchRecruitmentList: (page?: number, size?: number, sort?: string) => Promise<void>;
  fetchDatasetList: (page?: number, size?: number, sort?: string) => Promise<void>;
  
  fetchQnaDetail: (qnaId: number) => Promise<void>;
  createQnaAnswer: (qnaId: number, content: string) => Promise<void>;
  
  fetchRecruitmentDetail: (recruitmentId: number) => Promise<void>;
  updateApplicationStatus: (recruitmentId: number, applicationId: number, status: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  qnaList: [],
  recruitmentList: [],
  datasetList: [],

  qnaDetail: null,
  recruitmentDetail: null,

  isLoadingQna: false,
  isLoadingRecruitment: false,
  isLoadingDataset: false,
  isLoadingDetail: false,

  error: null,

  fetchQnaList: async (page = 0, size = 10, sort = 'LATEST') => {
    set({ isLoadingQna: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<ExpertQnAListResponse> }>('/community/qna', {
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
      const response = await api.get<{ data: PageResponse<RecruitmentResponse> }>('/community/recruitments', {
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
      const response = await api.get<{ data: PageResponse<DatasetListResponse> }>('/community/datasets', {
        params: { page, size, sort }
      });
      set({ datasetList: response.data.data.content, isLoadingDataset: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Dataset list', isLoadingDataset: false });
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
      // 답변 달고 나면 상세 정보를 다시 불러와서 최신 상태로 갱신
      const store = useCommunityStore.getState();
      await store.fetchQnaDetail(qnaId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to create QnA answer' });
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
      // 상태 변경 후 상세 정보 갱신
      const store = useCommunityStore.getState();
      await store.fetchRecruitmentDetail(recruitmentId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to update application status' });
      throw error;
    }
  }
}));
