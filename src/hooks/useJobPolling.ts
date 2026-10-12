import { useEffect, useRef, useState } from 'react';
import { useJobStore, getJobErrorMessage, isSuccessfulJobStatus, isTerminalJobStatus, type JobDetail } from '../store/useJobStore';

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
  const { currentJob, fetchJobStatus } = useJobStore();
  const [queryError, setQueryError] = useState<{ jobId: string; message: string } | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!jobId || !enabled) return;

    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const job = await fetchJobStatus(jobId);
        if (disposed) return;
        setQueryError(null);
        if (isSuccessfulJobStatus(job.status)) {
          onCompleteRef.current?.(job);
          return;
        }
        if (job.status === 'FAILED' || job.status === 'CANCELLED') {
          onErrorRef.current?.(job.error || '작업이 중단되었습니다.');
          return;
        }
      } catch (error) {
        if (disposed) return;
        setQueryError({ jobId, message: getJobErrorMessage(error, '작업 상태를 확인하지 못했습니다.') });
      }
      if (!disposed) timer = setTimeout(() => { void poll(); }, intervalMs);
    };

    void poll();
    return () => {
      disposed = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [jobId, intervalMs, enabled, fetchJobStatus]);

  const job = currentJob?.jobId === jobId ? currentJob : null;
  const error = queryError && queryError.jobId === jobId ? queryError.message : null;
  return {
    job,
    status: job?.status,
    currentStep: job?.currentStep,
    error,
    isPolling: Boolean(jobId && enabled && !error && !isTerminalJobStatus(job?.status)),
  };
}
