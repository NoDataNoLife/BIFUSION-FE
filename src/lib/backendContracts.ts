import api from './axios';
import type { ActivityItem, InspectionResult } from './liveData';

export interface ResourceUsage {
  storageUsedBytes: number | null;
  storageLimitBytes: number | null;
  storageUnmeasuredFileCount: number | null;
  monthlyAugmentations: number | null;
  monthlyAugmentationLimit: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  timezone: string | null;
}

export function usagePercent(used: number | null | undefined, limit: number | null | undefined) {
  return used != null && limit != null && limit > 0
    ? Math.min(100, Math.max(0, used / limit * 100)) : null;
}

export function activityVisible(item: Pick<ActivityItem, 'isPublic' | 'isMyPageVisible'>) {
  return item.isPublic && item.isMyPageVisible === true;
}

export interface InspectionTarget {
  targetType: 'AUGMENTED_DATA' | 'RECIPE' | 'UPLOADED_DATA';
  targetId: number;
  inspectionRequestId: number | null;
  canRequest: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | null;
  result: InspectionResult | null;
  minRewardPoints?: number;
  maxRewardPoints?: number;
}

export interface AugmentedDataset {
  datasetId: number;
  jobCode: string;
  totalSampleCount: number;
  generatedCount: number;
  previewUrl: string | null;
  finishedAt: string | null;
  inspectionTarget: InspectionTarget | null;
}

interface InspectionResponse {
  inspectionRequestId: number;
  status: NonNullable<InspectionTarget['status']>;
}

export async function requestInspection(target: InspectionTarget, reason: string, rewardPoints: number) {
  if (!target.canRequest) {
    throw new Error('지금은 이 자산의 검수를 신청할 수 없습니다.');
  }
  if (!Number.isInteger(rewardPoints) || rewardPoints < (target.minRewardPoints ?? 100) || rewardPoints > (target.maxRewardPoints ?? Number.MAX_SAFE_INTEGER)) throw new Error("안내된 검수 보상 범위 안에서 정수로 입력해 주세요.");
  const response = await api.post<{ data: InspectionResponse }>('/inspections', {
    targetType: target.targetType, targetId: target.targetId, reason, rewardPoints,
  });
  return response.data.data;
}

export async function cancelInspection(inspectionRequestId: number) {
  const response = await api.patch<{ data: InspectionResponse }>(
    `/inspections/requests/${inspectionRequestId}/cancel`,
  );
  return response.data.data;
}
