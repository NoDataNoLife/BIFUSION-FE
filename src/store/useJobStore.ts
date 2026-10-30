import { snapshotFromJobResponse, type JobExecutionSnapshot } from '../lib/jobExecutionSnapshot';
import { create } from 'zustand';
import api from '../lib/axios';
import { useAuthStore } from './useAuthStore';
import { submitJobRequest, submitJobRetry } from '../lib/jobSubmission';
import { getJobErrorMessage } from '../lib/jobErrors';
export { getJobErrorMessage } from '../lib/jobErrors';

export type JobType = 'AUGMENTATION' | 'TRAINING' | 'INFERENCE';
export type JobStatus = 'PENDING' | 'STARTED' | 'RUNNING' | 'SUCCESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface JobDetail {
  executionSnapshot?: JobExecutionSnapshot | null;
  executionSeed?: string | number | null;
  jobId: string;
  projectId?: string | number;
  type: JobType;
  status: JobStatus;
  progress: number;
  currentStep?: string;
  seed?: string | number;
  result?: Record<string, unknown> | null;
  error?: string | null;
  retryable?: boolean;
  retryOfJobId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string | null;
  mlUnreachableSince?: string | null;
  chargedPoints?: number | null;
}

interface JobState {
  currentJob: JobDetail | null;
  isLoading: boolean;
  error: string | null;
  createJob: (projectId: string | number, type: JobType, payload: Record<string, unknown>) => Promise<JobDetail>;
  retryJob: (jobId: string) => Promise<JobDetail>;
  fetchJobStatus: (jobId: string) => Promise<JobDetail>;
  resetCurrentJob: () => void;
}

export function isSuccessfulJobStatus(status?: JobStatus): boolean {
  return status === 'SUCCESS' || status === 'COMPLETED';
}

export function isTerminalJobStatus(status?: JobStatus): boolean {
  return isSuccessfulJobStatus(status) || status === 'FAILED' || status === 'CANCELLED';
}

const statuses: JobStatus[] = ['PENDING', 'STARTED', 'RUNNING', 'SUCCESS', 'COMPLETED', 'FAILED', 'CANCELLED'];
const types: JobType[] = ['AUGMENTATION', 'TRAINING', 'INFERENCE'];

function parseJob(
  response: unknown,
  fallback: { projectId?: string | number; type: JobType; seed?: string | number },
  expectedId?: string,
): JobDetail {
  if (!response || typeof response !== 'object') {
    throw new Error('작업 응답을 확인할 수 없습니다.');
  }
  const envelope = response as Record<string, unknown>;
  const data = (envelope.data ?? envelope) as Record<string, unknown>;
  if (!data || typeof data !== 'object') throw new Error('작업 응답을 확인할 수 없습니다.');

  const id = data.jobId ?? data.job_id ?? data.id;
  const status = data.status === 'FAILURE' ? 'FAILED' : data.status;
  if ((typeof id !== 'string' && typeof id !== 'number') || String(id).trim() === '' ||
      !statuses.includes(status as JobStatus)) {
    throw new Error('서버에서 유효한 작업 번호와 상태를 받지 못했습니다.');
  }
  if (expectedId && String(id) !== expectedId) throw new Error('요청한 작업과 다른 응답을 받았습니다.');

  return {
    executionSnapshot: snapshotFromJobResponse(data, types.includes(data.type as JobType) ? data.type as JobType : fallback.type),
    executionSeed: (typeof data.seedNumber === 'number' && Number.isFinite(data.seedNumber)) || (typeof data.seedNumber === 'string' && data.seedNumber.trim() !== '') ? data.seedNumber as string | number : null,
    jobId: String(id),
    projectId: data.projectId as string | number | undefined ?? fallback.projectId,
    type: types.includes(data.type as JobType) ? data.type as JobType : fallback.type,
    status: status as JobStatus,
    progress: typeof data.progress === 'number' && Number.isFinite(data.progress) ? data.progress : 0,
    currentStep: typeof data.currentStep === 'string' ? data.currentStep : undefined,
    seed: data.seedNumber as string | number | undefined ?? data.seed as string | number | undefined ?? fallback.seed,
    result: data.result && typeof data.result === 'object' ? data.result as Record<string, unknown> : null,
    error: typeof data.error === 'string' ? data.error : null,
    retryable: typeof data.retryable === 'boolean' ? data.retryable : undefined,
    retryOfJobId: data.retryOfJobId as string | number | null | undefined,
    createdAt: data.createdAt as string | undefined,
    updatedAt: data.updatedAt as string | undefined,
    startedAt: data.startedAt as string | null | undefined,
    mlUnreachableSince: data.mlUnreachableSince as string | null | undefined,
    chargedPoints: data.chargedPoints as number | null | undefined,
  };
}

export const useJobStore = create<JobState>((set, get) => ({
  currentJob: null,
  isLoading: false,
  error: null,

  createJob: async (projectId, type, payload) => {
    if (get().isLoading) throw new Error('작업 시작 요청을 처리하고 있습니다.');
    set({ isLoading: true, error: null, currentJob: null });
    try {
      const { response, confirm } = await submitJobRequest(useAuthStore.getState().user?.userId, projectId, { ...payload, type });
      const job = parseJob(response.data, { projectId, type, seed: payload.seed as number | undefined });
      confirm();
      void useAuthStore.getState().fetchUser();
      set({ currentJob: job, isLoading: false });
      return job;
    } catch (error) {
      const message = getJobErrorMessage(error, '작업을 시작하지 못했습니다. 작업 목록에서 접수 여부를 확인해 주세요.');
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  retryJob: async (jobId) => {
    const previous = get().currentJob;
    if (get().isLoading || previous?.jobId !== jobId || previous.status !== 'FAILED' || !previous.retryable) throw new Error('이 작업은 다시 시도할 수 없습니다.');
    set({ isLoading: true, error: null });
    try {
      const { response, confirm } = await submitJobRetry(useAuthStore.getState().user?.userId, jobId);
      const job = parseJob(response.data, { projectId: previous.projectId, type: previous.type });
      confirm(); set({ currentJob: job, isLoading: false }); void useAuthStore.getState().fetchUser(); return job;
    } catch (error) { set({ isLoading: false, error: getJobErrorMessage(error, '재시도를 접수하지 못했습니다.') }); throw error; }
  },
  fetchJobStatus: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      const current = get().currentJob;
      const previous = current?.jobId === jobId ? current : null;
      const job = parseJob(response.data, {
        projectId: previous?.projectId,
        type: previous?.type ?? 'AUGMENTATION',
        seed: previous?.seed,
      }, jobId);
      set({ currentJob: job, error: null });
      if (isTerminalJobStatus(job.status) && previous?.status !== job.status) void useAuthStore.getState().fetchUser();
      return job;
    } catch (error) {
      const message = getJobErrorMessage(error, '작업 상태를 불러오지 못했습니다. 잠시 후 다시 확인합니다.');
      set({ error: message });
      throw error;
    }
  },

  resetCurrentJob: () => set({ currentJob: null, error: null, isLoading: false }),
}));
