import { useEffect, useRef, useCallback } from 'react';
import { useJobStore, type JobDetail } from '../store/useJobStore';

interface UseJobPollingOptions {
  jobId?: string;
  intervalMs?: number;
  enabled?: boolean;
  onComplete?: (job: JobDetail) => void;
  onError?: (error: string) => void;
}

export function useJobPolling({
  jobId,
  intervalMs = 1500,
  enabled = true,
  onComplete,
  onError,
}: UseJobPollingOptions) {
  const { currentJob, fetchJobStatus, cancelJob } = useJobStore();
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  });

  const isPolling = Boolean(
    jobId &&
    enabled &&
    (!currentJob || currentJob.status === 'RUNNING' || currentJob.status === 'PENDING') &&
    (currentJob?.progress ?? 0) < 100
  );

  useEffect(() => {
    if (!jobId || !enabled) {
      return;
    }

    // Initial fetch
    fetchJobStatus(jobId);

    const timer = setInterval(async () => {
      try {
        const job = await fetchJobStatus(jobId);
        if (job.status === 'SUCCESS' || job.status === 'COMPLETED' || job.progress >= 100) {
          clearInterval(timer);
          onCompleteRef.current?.(job);
        } else if (job.status === 'FAILED' || job.status === 'CANCELLED') {
          clearInterval(timer);
          onErrorRef.current?.(job.error || '작업이 중단되었습니다.');
        }
      } catch (err) {
        console.warn('Job polling warning:', err);
      }
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [jobId, intervalMs, enabled, fetchJobStatus]);

  const handleCancel = useCallback(async () => {
    if (jobId) {
      await cancelJob(jobId);
    }
  }, [jobId, cancelJob]);

  return {
    job: currentJob,
    progress: currentJob?.progress ?? 0,
    status: currentJob?.status ?? 'RUNNING',
    currentStep: currentJob?.currentStep ?? '작업 준비 중...',
    isPolling,
    cancel: handleCancel,
  };
}
