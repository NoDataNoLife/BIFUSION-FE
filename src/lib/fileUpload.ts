import api from './axios';

export interface TempUploadedFile {
  fileId: number;
  fileUrl: string;
  originalFileName?: string;
}

export const MAX_TOTAL_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFiles(
  files: File[],
  options?: {
    minCount?: number;
    maxCount?: number;
    maxTotalBytes?: number;
  }
): FileValidationResult {
  const minCount = options?.minCount ?? 1;
  const maxCount = options?.maxCount ?? 10;
  const maxTotalBytes = options?.maxTotalBytes ?? MAX_TOTAL_IMAGE_SIZE_BYTES;

  if (files.length < minCount) {
    return { valid: false, error: `최소 ${minCount}장의 이미지가 필요합니다.` };
  }

  if (files.length > maxCount) {
    return { valid: false, error: `최대 ${maxCount}장까지 업로드할 수 있습니다.` };
  }

  let totalSize = 0;
  for (const file of files) {
    totalSize += file.size;
    const isMimeValid = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
    const isExtValid = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isMimeValid && !isExtValid) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식이 포함되어 있습니다 (${file.name}). JPG 또는 PNG 파일만 지원합니다.`,
      };
    }
  }

  if (totalSize > maxTotalBytes) {
    const mbLimit = Math.round(maxTotalBytes / (1024 * 1024));
    const currentMb = (totalSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `이미지 총 용량이 ${mbLimit}MB를 초과했습니다 (현재 ${currentMb}MB). 용량을 줄여주세요.`,
    };
  }

  return { valid: true };
}

export async function uploadTempFiles(
  files: File[],
  onProgress?: (progressPercent: number) => void
): Promise<TempUploadedFile[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/files/temp', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  const rawData = response.data?.data ?? response.data;
  if (!Array.isArray(rawData)) {
    throw new Error('파일 업로드 응답 형식이 올바르지 않습니다.');
  }

  return rawData.map((item: any) => ({
    fileId: Number(item.fileId ?? item.id),
    fileUrl: String(item.fileUrl ?? item.url ?? ''),
    originalFileName: item.originalFileName ?? item.fileName,
  }));
}
