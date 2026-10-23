import { isAxiosError } from 'axios';

export function requestMessage(error: unknown, fallback = '정보를 불러오지 못했습니다. 다시 시도해 주세요.'): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (error.response?.status === 403) return '접근 권한이 없습니다.';
    if (error.response?.status === 404) return '요청한 정보를 찾을 수 없습니다.';
    if (!error.response) return '서버에 연결하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.';
  }
  return error instanceof Error ? error.message : fallback;
}

export function formatBytes(bytes?: number | null): string {
  if (bytes == null || !Number.isFinite(bytes)) return '정보 없음';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export interface InspectionResult {
  reviewerName: string | null;
  score: number | null;
  comment: string | null;
  verifiedAt: string | null;
}

export interface ActivityItem {
  activityId: number;
  type: 'RECIPE' | 'DATASET' | 'QNA' | 'RECRUITMENT';
  title: string;
  description?: string;
  isPublic: boolean;
  isMyPageVisible?: boolean;
  createdAt: string;
  likeCount?: number;
  downloadCount?: number;
  commentCount?: number;
}
export interface ActivityPage { items: ActivityItem[]; hasNext: boolean; nextCursor: string | null }
