import { useCallback, useEffect, useRef, useState } from 'react';
import { isCancel } from 'axios';
import { fetchProjectJobPages, type ProjectJobItem } from '../lib/projectJobs';
export type { ProjectJobItem } from '../lib/projectJobs';
import { getJobErrorMessage, shouldRetryJobQuery } from '../lib/jobErrors';

export function useProjectJobs(projectId: string | undefined, type?: string, status?: string, keyword = '') {
  const [jobs, setJobs] = useState<ProjectJobItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [canPoll, setCanPoll] = useState(true);
  const [refreshNumber, setRefreshNumber] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState(keyword.trim());
  const generation = useRef(0);
  const query = JSON.stringify([projectId, type, status, search]);
  const previousQuery = useRef(query);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const controller = new AbortController();
    const requestGeneration = ++generation.current;
    const changed = previousQuery.current !== query;
    previousQuery.current = query;
    const pages = changed ? 1 : pageCount;
    if (changed) {
      setPageCount(1);
      setJobs([]);
      setStatusCounts({});
      setHasNext(false);
    }
    if (!projectId) { setLoadingJobs(false); return; }

    const load = async () => {
      setLoadingJobs(true);
      setJobsError(null);
      try {
        const { items, statusCounts: counts, hasNext: more } = await fetchProjectJobPages(
          projectId, { type, status, keyword: search }, pages, controller.signal,
        );
        if (requestGeneration !== generation.current || controller.signal.aborted) return;
        setJobs(items);
        setStatusCounts(counts);
        setHasNext(more);
        setCanPoll(true);
      } catch (error) {
        if (isCancel(error) || requestGeneration !== generation.current) return;
        setJobsError(getJobErrorMessage(error, '작업 목록을 불러오지 못했습니다.'));
        setCanPoll(shouldRetryJobQuery(error));
      } finally {
        if (requestGeneration === generation.current && !controller.signal.aborted) setLoadingJobs(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [projectId, type, status, search, query, pageCount, refreshNumber]);

  const hasActiveJob = (statusCounts.PENDING ?? 0) + (statusCounts.RUNNING ?? 0) > 0;
  useEffect(() => {
    if (!hasActiveJob || loadingJobs || !canPoll) return;
    const timer = setTimeout(() => setRefreshNumber((value) => value + 1), 4000);
    return () => clearTimeout(timer);
  }, [hasActiveJob, loadingJobs, canPoll, refreshNumber]);

  const fetchJobs = useCallback(() => setRefreshNumber((value) => value + 1), []);
  const loadMoreJobs = () => { if (!loadingJobs && hasNext) setPageCount((count) => count + 1); };
  return { jobs, statusCounts, loadingJobs, jobsError, hasNext, fetchJobs, loadMoreJobs };
}
