import { useAuthStore } from '../store/useAuthStore';
import type { TempUploadedFile } from './fileUpload';

export interface InferenceInput {
  fileId: number;
  originalFileName: string;
}

const memory = new Map<string, InferenceInput[]>();
function storageKey(projectId: string, jobId: string) {
  return `bifusion:inference-inputs:${useAuthStore.getState().user?.userId ?? 'anonymous'}:${projectId}:${jobId}`;
}

export function saveInferenceInputs(projectId: string, jobId: string, files: TempUploadedFile[]) {
  const key = storageKey(projectId, jobId);
  const inputs = files.map((file) => ({ fileId: file.fileId, originalFileName: file.originalFileName ?? `File #${file.fileId}` }));
  memory.set(key, inputs);
  // Store names and IDs only; presigned URLs are requested again when needed.
  try { sessionStorage.setItem(key, JSON.stringify(inputs)); } catch { /* Memory fallback. */ }
}

export function readInferenceInputs(projectId: string, jobId: string): InferenceInput[] {
  const key = storageKey(projectId, jobId);
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    if (Array.isArray(data)) return data.filter((item): item is InferenceInput =>
      item !== null && typeof item === 'object' && Number.isSafeInteger(item.fileId) && typeof item.originalFileName === 'string');
  } catch { /* Memory fallback. */ }
  return memory.get(key) ?? [];
}
