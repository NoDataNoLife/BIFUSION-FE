import { isAxiosError } from 'axios';

export function getJobErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    const detail = typeof message === 'string' && message.trim() ? message : fallback;
    if (!error.response) return '서버 응답을 받지 못했습니다. 작업 목록에서 접수 여부를 확인하거나 같은 설정으로 다시 확인해 주세요.';
    if (error.response.status === 403) return '이 작업 또는 프로젝트에 접근할 권한이 없습니다.';
    if (error.response.status === 404) return typeof message === 'string' ? message : '요청한 작업이나 파일을 찾을 수 없습니다.';
    if (error.response.status === 503) return `${detail} 프로젝트 작업 목록에서 실패 기록을 확인해 주세요.`;
    return detail;
  }
  return error instanceof Error ? error.message : fallback;
}

export function shouldRetryJobQuery(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === undefined || status === 408 || status === 429 || status >= 500;
}
