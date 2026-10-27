import api from './axios';
import { useAuthStore } from '../store/useAuthStore';

// Refresh only the balance. A temporary read failure must not log the user out
// or turn a successfully completed mutation into a retryable failure.
export async function refreshCurrentPoints() {
  const userId = useAuthStore.getState().user?.userId;
  if (userId == null) return false;
  try {
    const response = await api.get('/users/me');
    const data = response.data?.data ?? response.data;
    const current = useAuthStore.getState().user;
    if (response.data?.success === false || !current || current.userId !== userId || data?.userId !== userId || !Number.isFinite(data?.points) || data.points < 0) return false;
    useAuthStore.getState().updateUser({ ...current, points: data.points });
    return true;
  } catch { return false; }
}
export async function refreshPointsAfter<T>(action: () => Promise<T>) {
  const result = await action();
  const balanceRefreshed = await refreshCurrentPoints();
  return { result, balanceRefreshed };
}
export function forkRecipe(recipeId: string | number) {
  return refreshPointsAfter(() => api.post(`/community/recipes/${recipeId}/fork`));
}
export function createQuestion(payload: { title: string; content: string; tags: string[] }) {
  return refreshPointsAfter(() => api.post('/community/qna', payload));
}
export function deleteDatasetWithRefund(datasetId: number) {
  return refreshPointsAfter(() => api.delete(`/datasets/${datasetId}`));
}
