import { create } from 'zustand';
import api from '../lib/axios';

export interface InspectionImageItem {
  imageId: number;
  imageUrl: string;
  comment?: string;
  label?: string;
}

export interface InspectionDetailResponse {
  requestId: number;
  title: string;
  targetType: 'RECIPE' | 'DATASET';
  targetId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requester: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
  rewardPoints: number;
  requestedAt: string;
  assignedExpert?: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
  draftComment?: string;
  finalComment?: string;
  images: InspectionImageItem[];
  parameters?: {
    imagesPerClass?: number;
    samplingSteps?: number;
    guidanceScale?: number;
  };
}

export interface InspectionListResponse {
  requestId: number;
  title: string;
  targetType: 'RECIPE' | 'DATASET';
  targetId: number;
  requester: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
  rewardPoints: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestedAt: string;
  thumbnailUrl?: string;
}

interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface ExpertStore {
  inspectionList: InspectionListResponse[];
  inspectionDetail: InspectionDetailResponse | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  fetchInspectionRequests: (status?: string) => Promise<void>;
  fetchInspectionDetail: (requestId: number) => Promise<void>;
  startInspection: (requestId: number) => Promise<void>;
  saveDraftComment: (requestId: number, draftComment: string) => Promise<void>;
  saveImageComment: (requestId: number, imageId: number, comment: string) => Promise<void>;
  submitInspectionResult: (requestId: number, status: 'COMPLETED' | 'REJECTED', finalComment: string) => Promise<void>;
}

export const useExpertStore = create<ExpertStore>((set) => ({
  inspectionList: [],
  inspectionDetail: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,

  fetchInspectionRequests: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ data: PageResponse<InspectionListResponse> }>('/inspections', {
        params: { status: status || undefined, page: 0, size: 20 }
      });
      set({ inspectionList: response.data.data.content, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || '검수 요청 목록을 불러오지 못했습니다.', isLoading: false });
    }
  },

  fetchInspectionDetail: async (requestId: number) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await api.get<{ data: InspectionDetailResponse }>(`/inspections/${requestId}`);
      set({ inspectionDetail: response.data.data, isLoadingDetail: false });
    } catch (error: any) {
      set({ error: error.message || '검수 상세 정보를 불러오지 못했습니다.', isLoadingDetail: false });
    }
  },

  startInspection: async (requestId: number) => {
    try {
      await api.post(`/inspections/${requestId}/start`);
    } catch (error: any) {
      set({ error: error.message || '검수 시작에 실패했습니다.' });
      throw error;
    }
  },

  saveDraftComment: async (requestId: number, draftComment: string) => {
    try {
      await api.post(`/inspections/${requestId}/draft-comment`, { draftComment });
    } catch (error: any) {
      set({ error: error.message || '최종 코멘트 임시저장에 실패했습니다.' });
      throw error;
    }
  },

  saveImageComment: async (requestId: number, imageId: number, comment: string) => {
    try {
      await api.post(`/inspections/${requestId}/images/${imageId}/comment`, { comment });
    } catch (error: any) {
      set({ error: error.message || '이미지 코멘트 저장에 실패했습니다.' });
      throw error;
    }
  },

  submitInspectionResult: async (requestId: number, status: 'COMPLETED' | 'REJECTED', finalComment: string) => {
    try {
      await api.post(`/inspections/${requestId}/result`, { status, finalComment });
    } catch (error: any) {
      set({ error: error.message || '검수 결과 제출에 실패했습니다.' });
      throw error;
    }
  },
}));
