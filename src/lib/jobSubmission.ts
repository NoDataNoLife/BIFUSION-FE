import api from './axios';
import { isAxiosError } from 'axios';
import { apiErrorCode } from './apiErrorCode';

// Retain one unresolved request per payload. A confirmed response ends that intent.
const pending = new Map<string, string>();

async function submitIntent(
  userId: number | undefined,
  path: string,
  payload: Record<string, unknown>,
) {
  const signature = JSON.stringify([userId, path, payload]);
  const storageKey = `bifusion:pending-job:${signature}`;
  let saved: string | null = null;
  try { saved = sessionStorage.getItem(storageKey); } catch { /* Memory fallback. */ }
  const key = pending.get(signature) ?? saved ?? crypto.randomUUID();
  pending.set(signature, key);
  try { sessionStorage.setItem(storageKey, key); } catch { /* Memory fallback. */ }
  let response;
  try { response = await api.post(path, payload, {
    headers: { 'Idempotency-Key': key },
  }); } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const code = apiErrorCode(error);
      const rejected = status != null && ((status >= 400 && status < 500 && status !== 408 && status !== 429) || (status === 503 && ['ML001', 'ML006'].includes(code ?? '')));
      if (rejected) { pending.delete(signature); try { sessionStorage.removeItem(storageKey); } catch { /* Memory fallback. */ } }
    }
    throw error;
  }
  // Never automatically retry a POST. Ambiguous failures retain the same key;
  // definite rejections release it so a later explicit execution can start anew.
  return { response, confirm: () => {
    pending.delete(signature);
    try { sessionStorage.removeItem(storageKey); } catch { /* Memory fallback. */ }
  } };
}

export function submitJobRequest(userId: number | undefined, projectId: string | number, payload: Record<string, unknown>) {
  return submitIntent(userId, `/projects/${projectId}/jobs`, payload);
}
export function submitJobRetry(userId: number | undefined, jobId: string) {
  return submitIntent(userId, `/jobs/${jobId}/retry`, {});
}
