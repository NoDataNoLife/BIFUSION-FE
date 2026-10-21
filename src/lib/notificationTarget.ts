import api from './axios';
import type { NotificationItem } from '../store/useNotificationStore';

export async function notificationTarget(item: NotificationItem): Promise<string> {
  if (item.targetType === 'JOB' && item.targetId) {
    const response = await api.get(`/jobs/${item.targetId}`);
    const job = response.data.data;
    if (!job?.projectId || !job.jobId) throw new Error('작업의 프로젝트 정보를 확인할 수 없습니다.');
    const section = job.type === 'TRAINING' ? 'train' : job.type === 'INFERENCE' ? 'inference' : 'jobs';
    return `/dashboard/projects/${job.projectId}/${section}/${job.jobId}/${job.status === 'SUCCESS' ? 'result' : 'progress'}`;
  }
  if (item.targetType === 'PROJECT' && item.targetId) return `/dashboard/projects/${item.targetId}`;
  if (item.type === 'EXPERT_APPROVED' || item.type === 'EXPERT_REJECTED') return '/dashboard/profile';
  if (item.targetType === 'RECIPE' && item.targetId) return `/dashboard/community?recipeId=${item.targetId}`;
  if (item.targetType === 'DATASET' && item.targetId) return `/dashboard/community?datasetId=${item.targetId}`;
  if (item.targetType === 'QNA' && item.targetId) return `/dashboard/community?qnaId=${item.targetId}`;
  if (item.targetType === 'RECRUITMENT' && item.targetId) return `/dashboard/community?recruitmentId=${item.targetId}`;
  if (item.type.includes('INSPECTION') || item.type.startsWith('RECIPE_REVIEW_')) return '/dashboard/expert';
  return '/dashboard/notifications';
}
