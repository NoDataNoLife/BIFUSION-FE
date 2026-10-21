import api from './axios';

// Retain one unresolved request per payload. A confirmed response ends that intent.
const pending = new Map<string, string>();

export async function submitJobRequest(
  userId: number | undefined,
  projectId: string | number,
  payload: Record<string, unknown>,
) {
  const signature = JSON.stringify([userId, projectId, payload]);
  const storageKey = `bifusion:pending-job:${signature}`;
  let saved: string | null = null;
  try { saved = sessionStorage.getItem(storageKey); } catch { /* Memory fallback. */ }
  const key = pending.get(signature) ?? saved ?? crypto.randomUUID();
  pending.set(signature, key);
  try { sessionStorage.setItem(storageKey, key); } catch { /* Memory fallback. */ }
  const response = await api.post(`/projects/${projectId}/jobs`, payload, {
    headers: { 'Idempotency-Key': key },
  });
  // No automatic POST retries. An explicit repeat resolves the same request,
  // including a 503 that may have left a failed job with attached input files.
  return { response, confirm: () => {
    pending.delete(signature);
    try { sessionStorage.removeItem(storageKey); } catch { /* Memory fallback. */ }
  } };
}
