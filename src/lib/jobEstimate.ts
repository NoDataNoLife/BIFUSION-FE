import api from './axios';
export interface JobEstimate { type: string; cost: number; currentPoints: number; affordable: boolean }
export async function estimateJobCost(payload: Record<string, unknown>, signal?: AbortSignal): Promise<JobEstimate> {
  const response = await api.post('/jobs/cost-estimate', payload, { signal });
  const data = response.data?.data;
  if (!Number.isFinite(data?.cost) || data.cost < 0 || !Number.isFinite(data?.currentPoints) || typeof data?.affordable !== 'boolean') throw new Error('예상 비용 응답을 확인할 수 없습니다.');
  return data;
}
