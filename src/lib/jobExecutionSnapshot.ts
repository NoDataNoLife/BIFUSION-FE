export type ExecutionType = 'AUGMENTATION' | 'TRAINING' | 'INFERENCE';
export interface ExecutionFile { fileId: number | null; fileName: string | null; imageUrl: string | null; group: 'NORMAL' | 'ANOMALY' | 'INPUT'; deleted: boolean }
export interface JobExecutionSnapshot {
  type: ExecutionType;
  parameters: Record<string, number> | null;
  inputs: { augmentationJobId: number | null; modelId: number | null; files: ExecutionFile[] | null } | null;
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
/**
 * FE 내부 표시 모델용 임시 어댑터. executionSnapshot은 확정 BE 응답 계약이 아니다.
 * TODO(FE integration): #259의 최상위 실행 파라미터·입력 참조 응답을 이 모델에 매핑한다.
 * BE에 중첩 executionSnapshot을 추가 요청할 필요는 없다. 누락된 과거 기록은 null 유지.
 */
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
