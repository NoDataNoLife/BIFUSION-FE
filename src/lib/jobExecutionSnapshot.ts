export type ExecutionType = 'AUGMENTATION' | 'TRAINING' | 'INFERENCE';
export interface ExecutionFile { fileId: number | null; fileName: string | null; imageUrl: string | null; group: 'NORMAL' | 'ANOMALY' | 'INPUT'; deleted: boolean }
export interface JobExecutionSnapshot {
  type: ExecutionType;
  parameters: Record<string, number> | null;
  inputs: { augmentationJobId: number | null; trainingJobId?: number | null; modelId: number | null; files: ExecutionFile[] | null } | null;
}
export const executionFields = {
  AUGMENTATION: [['numSamplesPerClass', '클래스별 생성 장수'], ['strength', '증강 강도'], ['finetuneSteps', '파인튜닝 스텝'], ['steps', '샘플링 스텝'], ['seed', '실제 시드']],
  TRAINING: [['kShot', 'K-shot'], ['epochs', 'Epoch'], ['qQuery', 'Q-query'], ['episodesPerEpoch', '에포크당 에피소드 수'], ['seed', '실제 시드']],
  INFERENCE: [],
} as const;
const object = (value: unknown): Record<string, unknown> | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const id = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : null;
const imageUrl = (value: unknown) => {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? value : null; } catch { return null; }
};
/** 화면 내부 모델을 검증한다. 실제 API 응답은 snapshotFromJobResponse에서 변환한다. */
export function parseExecutionSnapshot(value: unknown, type: ExecutionType): JobExecutionSnapshot | null {
  const data = object(value);
  if (!data || data.type !== type) return null;
  const rawParameters = object(data.parameters);
  const parameters: Record<string, number> = {};
  for (const [key] of executionFields[type]) {
    const v = rawParameters?.[key];
    if (typeof v === 'number' && Number.isFinite(v)) parameters[key] = v;
  }
  const rawInputs = object(data.inputs);
  const files: ExecutionFile[] | null = Array.isArray(rawInputs?.files) ? rawInputs.files.flatMap(value => {
    const file = object(value); if (!file) return [];
    return [{ fileId: id(file.fileId), fileName: text(file.fileName), imageUrl: file.deleted === true ? null : imageUrl(file.imageUrl), group: file.group === 'NORMAL' || file.group === 'ANOMALY' ? file.group : 'INPUT', deleted: file.deleted === true } as ExecutionFile];
  }) : null;
  return { type, parameters: rawParameters ? parameters : null, inputs: rawInputs ? { augmentationJobId: id(rawInputs.augmentationJobId), modelId: id(rawInputs.modelId), files } : null };
}

/** 배포된 JobResponse 최상위 값을 화면 내부 모델로 변환한다. */
export function snapshotFromJobResponse(data: Record<string, unknown>, type: ExecutionType): JobExecutionSnapshot | null {
  const hasRecord = executionFields[type].some(([key]) => data[key] != null) || data.augmentationJobId != null || data.trainingJobId != null || data.inputImages != null;
  if (!hasRecord) return null;
  const snapshot = parseExecutionSnapshot({ type, parameters: data, inputs: {
    augmentationJobId: data.augmentationJobId,
    files: Array.isArray(data.inputImages) ? data.inputImages.map(value => {
      const file = object(value);
      return { fileId: file?.fileId, fileName: file?.fileName, imageUrl: file?.url, group: 'INPUT' };
    }) : null,
  } }, type);
  if (snapshot?.inputs) snapshot.inputs.trainingJobId = id(data.trainingJobId);
  return snapshot;
}
