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

export interface NotificationParams {
  category?: NotificationCategory;
  isRead?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
}
interface NotificationState {
  notifications: NotificationItem[];
  popupNotifications: NotificationItem[];
  unreadCount: number;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  popupLoading: boolean;
  error: string | null;
  popupError: string | null;
  fetchNotifications: (params?: NotificationParams) => Promise<void>;
  fetchPopupNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  softDeleteNotification: (id: number) => Promise<boolean>;
  softDeleteAllNotifications: () => Promise<boolean>;
  hardDeleteNotification: (id: number) => Promise<boolean>;
  hardDeleteAllNotifications: () => Promise<boolean>;
}

/** Older deployments exclude hidden notifications on /notifications already.
 * Only route-not-installed responses fall back; authentication/server errors stay visible.
 */
export async function getPopupNotifications(params: NotificationParams = {}) {
  try { return await api.get('/notifications/popup', { params }); }
  catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status !== 404 && status !== 405) throw error;
    return api.get('/notifications', { params });
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  let lastParams: NotificationParams = {};
  let historyQuery = 0;
  let popupQuery = 0;
  let unreadQuery = 0;
  let historyLoaded = false;
  let popupLoaded = false;
  const mutate = async (method: 'patch' | 'delete', url: string, notificationId?: number) => {
    set({ error: null, popupError: null });
    try {
      await api.request({ method, url, ...(notificationId === undefined ? {} : { params: { notificationId } }) });
      await Promise.all([
        historyLoaded ? get().fetchNotifications(lastParams) : Promise.resolve(),
        popupLoaded ? get().fetchPopupNotifications() : Promise.resolve(),
        get().refreshUnreadCount(),
      ]);
      return true;
    } catch (error) {
      const message = requestMessage(error, '알림을 변경하지 못했습니다.');
      set({ error: message, popupError: message });
      return false;
    }
  };
  return {
    notifications: [], popupNotifications: [], unreadCount: 0,
    totalElements: 0, totalPages: 0, currentPage: 0,
    isLoading: false, popupLoading: false, error: null, popupError: null,
    refreshUnreadCount: async () => {
      const query = ++unreadQuery;
      // Preserve the last known badge on transient errors. List queries show errors separately.
      try {
        const response = await getPopupNotifications({ isRead: false, size: 1 });
        if (query === unreadQuery) set({ unreadCount: response.data?.data?.totalElements ?? 0 });
      } catch { /* Retry on next visible poll or list refresh. */ }
    },
    fetchNotifications: async (params = {}) => {
      const query = ++historyQuery;
      historyLoaded = true;
      lastParams = params;
      set({ isLoading: true, error: null });
      try {
        const [response] = await Promise.all([api.get('/notifications', { params }), get().refreshUnreadCount()]);
        if (query !== historyQuery) return;
        const data = response.data?.data;
        if (!Array.isArray(data?.content)) throw new Error('알림 목록 응답을 확인할 수 없습니다.');
        set({ notifications: data.content, totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0, currentPage: data.pageNumber ?? 0, isLoading: false });
      } catch (error) {
        if (query === historyQuery) set({ notifications: [], totalElements: 0, totalPages: 0, isLoading: false, error: requestMessage(error) });
      }
    },
    fetchPopupNotifications: async () => {
      const query = ++popupQuery;
      popupLoaded = true;
      set({ popupLoading: true, popupError: null });
      try {
        const [response] = await Promise.all([getPopupNotifications({ page: 0, size: 10 }), get().refreshUnreadCount()]);
        if (query !== popupQuery) return;
        const data = response.data?.data;
        if (!Array.isArray(data?.content)) throw new Error('알림 목록 응답을 확인할 수 없습니다.');
        set({ popupNotifications: data.content, popupLoading: false });
      } catch (error) {
        if (query === popupQuery) set({ popupNotifications: [], popupLoading: false, popupError: requestMessage(error) });
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
