import { create } from 'zustand';
import api from '../lib/axios';
import { requestMessage } from '../lib/liveData';

export type NotificationType =
  | 'AUGMENTATION_SUCCESS'
  | 'AUGMENTATION_FAILED'
  | 'PROJECT_INVITATION'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_REJECTED'
  | 'EXPERT_APPROVED'
  | 'EXPERT_REJECTED'
  | 'RECIPE_REVIEW_REQUESTED'
  | 'RECIPE_REVIEW_ACCEPTED'
  | 'RECIPE_APPROVED'
  | 'RECIPE_REJECTED'
  | 'DATASET_VERIFIED'
  | 'DATASET_VERIFY_REJECTED'
  | 'AUGMENTATION_INSPECTION_APPROVED'
  | 'AUGMENTATION_INSPECTION_REJECTED'
  | 'QNA_ANSWERED'
  | 'RECIPE_REVIEW'
  | 'RECRUITMENT_APPLY'
  | 'RECRUITMENT_ACCEPTED'
  | 'RECRUITMENT_REJECTED';

export type NotificationCategory = 'EXPERT_INSPECTION' | 'AUGMENTATION' | 'PROJECT' | 'COMMUNITY';

export interface NotificationItem {
  notificationId: number;
  type: NotificationType;
  title: string;
  content: string;
  targetType?: string;
  targetId?: number;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (params?: {
    category?: NotificationCategory;
    isRead?: boolean;
    keyword?: string;
    page?: number;
    size?: number;
  }) => Promise<void>;
  
  markAsRead: (notificationId: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  softDeleteNotification: (notificationId: number) => Promise<boolean>;
  softDeleteAllNotifications: () => Promise<boolean>;
  hardDeleteNotification: (notificationId: number) => Promise<boolean>;
  hardDeleteAllNotifications: () => Promise<boolean>;
}

type Params = Parameters<NotificationState['fetchNotifications']>[0];
let lastParams: Params = {};
let latestQuery = 0;
export const useNotificationStore = create<NotificationState>((set, get) => {
  const mutate = async (method: 'patch' | 'delete', url: string, notificationId?: number) => {
    set({ error: null });
    try {
      await api.request({ method, url, ...(notificationId === undefined ? {} : { params: { notificationId } }) });
      await get().fetchNotifications(lastParams);
      return true;
    } catch (error) {
      set({ error: requestMessage(error, '알림을 변경하지 못했습니다.') });
      return false;
    }
  };
  return {
    notifications: [], unreadCount: 0, totalElements: 0, totalPages: 0, currentPage: 0,
    isLoading: false, error: null,
    fetchNotifications: async (params = {}) => {
      const query = ++latestQuery;
      lastParams = params;
      set({ isLoading: true, error: null, notifications: [] });
      try {
        const [response, unread] = await Promise.all([
          api.get('/notifications', { params }),
          api.get('/notifications', { params: { isRead: false, size: 1 } }),
        ]);
        if (query !== latestQuery) return;
        const data = response.data?.data;
        if (!Array.isArray(data?.content)) throw new Error('알림 목록 응답을 확인할 수 없습니다.');
        set({ notifications: data.content, totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0, currentPage: data.pageNumber ?? 0,
          unreadCount: unread.data?.data?.totalElements ?? 0, isLoading: false });
      } catch (error) {
        if (query === latestQuery) set({ notifications: [], unreadCount: 0, totalElements: 0, totalPages: 0, isLoading: false, error: requestMessage(error) });
      }
    },
    markAsRead: (id) => mutate('patch', `/notifications/${id}/read`),
    markAllAsRead: () => mutate('patch', '/notifications/read-all'),
    softDeleteNotification: (id) => mutate('delete', '/notifications/popup', id),
    softDeleteAllNotifications: () => mutate('delete', '/notifications/popup'),
    hardDeleteNotification: (id) => mutate('delete', '/notifications', id),
    hardDeleteAllNotifications: () => mutate('delete', '/notifications'),
  };
});
