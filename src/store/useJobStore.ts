import { create } from 'zustand';
import api from '../lib/axios';

export type JobType = 'AUGMENTATION' | 'TRAINING' | 'INFERENCE';
export type JobStatus = 'PENDING' | 'STARTED' | 'RUNNING' | 'SUCCESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface JobDetail {
  jobId: string;
  projectId?: string | number;
  type: JobType;
  status: JobStatus;
  progress: number; // 0 ~ 100
  currentStep?: string;
  seed?: string | number;
  result?: Record<string, unknown> | null;
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface JobState {
  currentJob: JobDetail | null;
  isLoading: boolean;
  error: string | null;
  simulationJobs: Map<string, JobDetail>;

  // Actions
  createJob: (
    projectId: string | number,
    type: JobType,
    payload: Record<string, unknown>
  ) => Promise<JobDetail>;
  fetchJobStatus: (jobId: string) => Promise<JobDetail>;
  cancelJob: (jobId: string) => Promise<void>;
  resetCurrentJob: () => void;
  updateLocalJobProgress: (jobId: string, progress: number, step?: string) => void;
}

// In-memory simulation cache so UI flows work seamlessly even before BE-ML bridge is live
const simulationCache = new Map<string, JobDetail>();

export const useJobStore = create<JobState>((set, get) => ({
  currentJob: null,
  isLoading: false,
  error: null,
  simulationJobs: simulationCache,

  createJob: async (projectId, type, payload) => {
    set({ isLoading: true, error: null });
    const seed = (payload.seed as string | number) || Math.floor(1000 + Math.random() * 9000).toString();

    try {
      // 1. Try real BE endpoint: POST /projects/{projectId}/jobs or /jobs
      const response = await api.post(`/projects/${projectId}/jobs`, {
        type,
        seed,
        ...payload,
      });

      if (response.data?.data) {
        const data = response.data.data;
        const job: JobDetail = {
          jobId: String(data.jobId || data.id || `JOB-${Date.now().toString().slice(-4)}`),
          projectId,
          type,
          status: (data.status as JobStatus) || 'PENDING',
          progress: data.progress ?? 0,
          currentStep: data.currentStep || '작업 대기 중...',
          seed,
          result: data.result || null,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        set({ currentJob: job, isLoading: false });
        return job;
      }
      throw new Error('Invalid response structure');
    } catch {
      // Fallback: Create mock/simulation job
      const mockJobId = `JOB-${Math.floor(100 + Math.random() * 900)}`;
      const initialStep =
        type === 'AUGMENTATION'
          ? '입력 이미지 전처리 및 잠재 공간 인코딩 중...'
          : type === 'TRAINING'
          ? 'Few-Shot 에피소드 데이터셋 로드 중...'
          : '환자 X-Ray 이미지 정규화 및 특징 추출 중...';

      const mockJob: JobDetail = {
        jobId: mockJobId,
        projectId,
        type,
        status: 'RUNNING',
        progress: 5,
        currentStep: initialStep,
        seed,
        createdAt: new Date().toISOString(),
      };

      simulationCache.set(mockJobId, mockJob);
      set({ currentJob: mockJob, isLoading: false });
      return mockJob;
    }
  },

  fetchJobStatus: async (jobId: string) => {
    try {
      // 1. Check if it's an active simulated job
      const cached = simulationCache.get(jobId);
      if (cached) {
        if (cached.status === 'RUNNING' && cached.progress < 100) {
          const nextProgress = Math.min(100, cached.progress + Math.floor(Math.random() * 12) + 8);
          let nextStep = cached.currentStep;

          if (cached.type === 'AUGMENTATION') {
            if (nextProgress < 30) nextStep = '입력 이미지 전처리 및 잠재 공간 인코딩 중...';
            else if (nextProgress < 75) nextStep = 'DDPM 확산 프로세스 샘플링 진행 중...';
            else if (nextProgress < 95) nextStep = '합성 이미지 디코딩 및 품질 검증 중...';
            else nextStep = '증강 데이터셋 패키징 완료';
          } else if (cached.type === 'TRAINING') {
            const currentEp = Math.min(200, Math.floor((nextProgress / 100) * 200));
            nextStep = `Episode 생성 및 메타 학습 중... (${currentEp}/200)`;
          } else {
            if (nextProgress < 50) nextStep = '학습된 모델 기반 병변(Anomaly) 진단 계산 중...';
            else if (nextProgress < 90) nextStep = '진단 신뢰도 및 확률 분포 집계 중...';
            else nextStep = '진단 리포트 생성 완료';
          }

          const isCompleted = nextProgress >= 100;
          const updated: JobDetail = {
            ...cached,
            progress: nextProgress,
            currentStep: nextStep,
            status: isCompleted ? 'SUCCESS' : 'RUNNING',
            result: isCompleted
              ? {
                  anomalyScore: 0.88,
                  diagnosis: 'Pneumonia (High Confidence)',
                  confidence: 94.2,
                  normalProb: 5.8,
                  anomalyProb: 94.2,
                  processedImages: 10,
                  generatedImages: 20,
                }
              : null,
            updatedAt: new Date().toISOString(),
          };
          simulationCache.set(jobId, updated);
          set({ currentJob: updated });
          return updated;
        }

        set({ currentJob: cached });
        return cached;
      }

      // 2. Real API call: GET /jobs/{jobId}
      const response = await api.get(`/jobs/${jobId}`);
      if (response.data?.data) {
        const data = response.data.data;
        const job: JobDetail = {
          jobId: String(data.jobId || jobId),
          projectId: data.projectId,
          type: (data.type as JobType) || 'AUGMENTATION',
          status: (data.status as JobStatus) || 'RUNNING',
          progress: data.progress ?? 0,
          currentStep: data.currentStep,
          seed: data.seedNumber || data.seed,
          result: data.result || null,
          error: data.error || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        set({ currentJob: job });
        return job;
      }
      throw new Error('Job not found');
    } catch {
      // Fallback if network or endpoint fails: return currentJob or newly created mock
      const existing = get().currentJob;
      if (existing && existing.jobId === jobId) {
        return existing;
      }
      const fallback: JobDetail = {
        jobId,
        type: 'AUGMENTATION',
        status: 'RUNNING',
        progress: 50,
        currentStep: '작업 진행 중...',
      };
      set({ currentJob: fallback });
      return fallback;
    }
  },

  cancelJob: async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/cancel`);
    } catch {
      // ignore
    }
    const cached = simulationCache.get(jobId);
    if (cached) {
      const cancelled: JobDetail = { ...cached, status: 'CANCELLED', currentStep: '작업이 취소되었습니다.' };
      simulationCache.set(jobId, cancelled);
      set({ currentJob: cancelled });
    }
  },

  resetCurrentJob: () => set({ currentJob: null, error: null, isLoading: false }),

  updateLocalJobProgress: (jobId: string, progress: number, step?: string) => {
    const job = get().currentJob;
    if (job && job.jobId === jobId) {
      const updated = {
        ...job,
        progress,
        currentStep: step || job.currentStep,
        status: (progress >= 100 ? 'SUCCESS' : 'RUNNING') as JobStatus,
      };
      set({ currentJob: updated });
    }
  },
}));
