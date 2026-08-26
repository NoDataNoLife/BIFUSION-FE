import { create } from 'zustand';
import api from '../lib/axios';

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

// Fallback initial data in case of offline/demo
const initialMockNotifications: NotificationItem[] = [
  {
    notificationId: 1,
    type: 'AUGMENTATION_SUCCESS',
    title: '데이터 증강 작업 완료',
    content: 'Lung Cancer Detection 프로젝트의 증강 작업 10개가 성공적으로 완료되었습니다.',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    isRead: false,
    targetType: 'JOB',
    targetId: 1,
  },
  {
    notificationId: 2,
    type: 'PROJECT_INVITATION',
    title: '새로운 팀 초대',
    content: '조현희님이 "Brain MRI Analysis" 프로젝트에 초대했습니다.',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isRead: false,
    targetType: 'PROJECT',
    targetId: 2,
  },
  {
    notificationId: 3,
    type: 'EXPERT_APPROVED',
    title: '전문가 인증 승인 완료',
    content: '제출하신 전문가 인증이 검수 완료되어 승인되었습니다.',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    notificationId: 4,
    type: 'RECIPE_REVIEW',
    title: '새로운 레시피 리뷰',
    content: '김성한님이 "High-Res Enhancement" 레시피에 댓글을 남겼습니다.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    notificationId: 5,
    type: 'AUGMENTATION_FAILED',
    title: '증강 작업 실패',
    content: 'CT Scan 프로젝트의 증강 작업 2개가 실패했습니다. 로그를 확인해주세요.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialMockNotifications,
  unreadCount: initialMockNotifications.filter((n) => !n.isRead).length,
  totalElements: initialMockNotifications.length,
  totalPages: 1,
  currentPage: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications', { params });
      if (response.data?.success && response.data?.data) {
        const pageData = response.data.data;
        const items: NotificationItem[] = pageData.content || [];
        set({
          notifications: items,
          totalElements: pageData.totalElements ?? items.length,
          totalPages: pageData.totalPages ?? 1,
          currentPage: pageData.number ?? 0,
          unreadCount: items.filter((n) => !n.isRead).length,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      // Fallback gracefully on network/auth error while keeping UI functional
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch {
      // ignore error
    }
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
    return true;
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // ignore error
    }
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    });
    return true;
  },

  softDeleteNotification: async (notificationId: number) => {
    try {
      await api.delete('/notifications/popup', {
        params: { notificationId },
      });
    } catch {
      // ignore error
    }
    set((state) => {
      const updated = state.notifications.filter((n) => n.notificationId !== notificationId);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
        totalElements: Math.max(0, state.totalElements - 1),
      };
    });
    return true;
  },

  softDeleteAllNotifications: async () => {
    try {
      await api.delete('/notifications/popup');
    } catch {
      // ignore error
    }
    set({
      notifications: [],
      unreadCount: 0,
      totalElements: 0,
    });
    return true;
  },

  hardDeleteNotification: async (notificationId: number) => {
    try {
      await api.delete('/notifications', {
        params: { notificationId },
      });
    } catch {
      // ignore error
    }
    set((state) => {
      const updated = state.notifications.filter((n) => n.notificationId !== notificationId);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
        totalElements: Math.max(0, state.totalElements - 1),
      };
    });
    return true;
  },

  hardDeleteAllNotifications: async () => {
    try {
      await api.delete('/notifications');
    } catch {
      // ignore error
    }
    set({
      notifications: [],
      unreadCount: 0,
      totalElements: 0,
    });
    return true;
  },
}));
