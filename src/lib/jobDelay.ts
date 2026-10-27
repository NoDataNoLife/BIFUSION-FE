import { kstDate } from './kstDate';
export function jobDelay(job: { status: string; startedAt?: string | null; mlUnreachableSince?: string | null }, now: number) {
  if (!['PENDING','STARTED','RUNNING'].includes(job.status)) return null;
  const elapsed = (date?: string | null) => date ? now - kstDate(date).getTime() >= 60_000 : false;
  if (elapsed(job.mlUnreachableSince)) return 'AI 서버 연결이 1분 이상 지연되고 있습니다. 서버 상태를 확인 중입니다.';
  return job.status === 'PENDING' && elapsed(job.startedAt) ? '작업이 1분 이상 대기 중입니다. AI 서버의 실행 순서를 확인 중입니다.' : null;
}
