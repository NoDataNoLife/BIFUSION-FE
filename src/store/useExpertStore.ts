import { create } from 'zustand';
import api from '../lib/axios';

export interface InspectionImageItem {
  imageId: number;
  imageUrl: string;
  comment?: string;
  label?: string;
}

export interface InspectionDetailResponse {
  inspectionId: number;
  targetType: 'RECIPE' | 'UPLOADED_DATA' | 'AUGMENTED_DATA';
  targetId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requester: {
    userId: number;
    nickname: string;
    email: string;
    profileImageUrl?: string;
  };
  rewardPoints: number;
  requestedAt: string;
  expertComment?: string;
  sampleImages?: {
    images: InspectionImageItem[];
  };
  images?: InspectionImageItem[];
  parameters?: {
    imagesPerClass?: number;
    samplingSteps?: number;
    guidanceScale?: number;
  };
}

export interface ExpertTaskSummaryItem {
  reviewCode: string;
  status: string;
  reviewResult?: 'APPROVED' | 'REJECTED' | null;
  requester: {
    userId: number;
    nickname: string;
    email: string;
  };
  projectName: string;
  requestedAt?: string;
  updatedAt?: string;
}

export interface ExpertTaskGroupedResponse {
  PENDING: ExpertTaskSummaryItem[];
  IN_PROGRESS: ExpertTaskSummaryItem[];
  COMPLETED: ExpertTaskSummaryItem[];
}

interface ExpertStore {
  groupedTasks: ExpertTaskGroupedResponse;
  inspectionDetail: InspectionDetailResponse | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  fetchMyTasks: () => Promise<void>;
  fetchInspectionDetail: (inspectionId: number) => Promise<void>;
  startInspectionTask: (taskId: number) => Promise<void>;
  saveDraftComment: (inspectionId: number, draftComment: string) => Promise<void>;
  saveImageComment: (inspectionId: number, imageId: number, comment: string) => Promise<void>;
  approveInspection: (inspectionId: number, finalComment: string) => Promise<void>;
  rejectInspection: (inspectionId: number, rejectionReason: string) => Promise<void>;
}

export const useExpertStore = create<ExpertStore>((set) => ({
  groupedTasks: {
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  },
  inspectionDetail: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,

  fetchMyTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ data: ExpertTaskGroupedResponse }>('/experts/me/tasks');
      set({ groupedTasks: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        groupedTasks: { PENDING: [], IN_PROGRESS: [], COMPLETED: [] },
        error: error.message || '검수 요청 목록을 불러오지 못했습니다.', 
        isLoading: false 
      });
    }
  },

  fetchInspectionDetail: async (inspectionId: number) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await api.get<{ data: InspectionDetailResponse }>(`/inspections/${inspectionId}`);
      const data = response.data.data;
      if (data.sampleImages?.images && !data.images) {
        data.images = data.sampleImages.images;
      }
      set({ inspectionDetail: data, isLoadingDetail: false });
    } catch (error: any) {
      set({ error: error.message || '검수 상세 정보를 불러오지 못했습니다.', isLoadingDetail: false });
    }
  },

  startInspectionTask: async (taskId: number) => {
    try {
      await api.patch(`/experts/me/tasks/${taskId}/start`);
    } catch (error: any) {
      set({ error: error.message || '검수 시작에 실패했습니다.' });
      throw error;
    }
  },

  saveDraftComment: async (inspectionId: number, draftComment: string) => {
    try {
      await api.patch(`/inspections/${inspectionId}/draft`, { expertComment: draftComment });
    } catch (error: any) {
      set({ error: error.message || '최종 코멘트 임시저장에 실패했습니다.' });
      throw error;
    }
  },

  saveImageComment: async (inspectionId: number, imageId: number, comment: string) => {
    try {
      await api.patch(`/inspections/${inspectionId}/images/${imageId}/comment`, { comment });
    } catch (error: any) {
      set({ error: error.message || '이미지 코멘트 저장에 실패했습니다.' });
      throw error;
    }
  },

  approveInspection: async (inspectionId: number, finalComment: string) => {
    try {
      await api.post(`/inspections/${inspectionId}/approve`, { finalComment });
    } catch (error: any) {
      set({ error: error.message || '검수 승인 처리에 실패했습니다.' });
      throw error;
    }
  },

  rejectInspection: async (inspectionId: number, rejectionReason: string) => {
    try {
      await api.post(`/inspections/${inspectionId}/reject`, { rejectionReason });
    } catch (error: any) {
      set({ error: error.message || '검수 반려 처리에 실패했습니다.' });
      throw error;
    }
  },
}));
