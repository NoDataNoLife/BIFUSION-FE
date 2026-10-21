import api from './axios';

export interface ProjectJobItem {
  jobId: number | string;
  jobCode?: string;
  type: string;
  status: string;
  seedNumber?: number | string;
  createdBy?: { userId?: number | null; nickname?: string | null; email?: string | null } | null;
  createdAt: string;
  finishedAt?: string | null;
  currentStep?: string | null;
  error?: string | null;
  retryable?: boolean;
  retryOfJobId?: number | string | null;
}

interface JobPage {
  items: ProjectJobItem[];
  hasNext: boolean;
  nextCursor: string | null;
  statusCounts: Record<string, number> | null;
}

export async function fetchProjectJobPages(
  projectId: string,
  filters: { type?: string; status?: string; keyword?: string },
  pages: number,
  signal?: AbortSignal,
) {
  const items: ProjectJobItem[] = [];
  let cursor: string | undefined;
  let lastPage: JobPage | undefined;
  let statusCounts: Record<string, number> = {};
  for (let page = 0; page < pages; page++) {
    const res = await api.get(`/projects/${projectId}/jobs`, {
      params: { ...filters, keyword: filters.keyword || undefined, cursor, size: 20 },
      signal,
    });
    const data = (res.data?.data ?? res.data) as JobPage;
    if (!Array.isArray(data.items)) throw new Error('작업 목록 응답을 확인할 수 없습니다.');
    if (page === 0) statusCounts = data.statusCounts ?? {};
    items.push(...data.items);
    lastPage = data;
    if (!data.hasNext || !data.nextCursor) break;
    cursor = data.nextCursor;
  }
  return {
    items: [...new Map(items.map((item) => [String(item.jobId), item])).values()],
    statusCounts,
    hasNext: Boolean(lastPage?.hasNext && lastPage.nextCursor),
  };
}
