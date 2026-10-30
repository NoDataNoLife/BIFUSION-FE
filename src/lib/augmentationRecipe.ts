export interface AugmentationSettings {
  numSamplesPerClass: number; strength: number; finetuneSteps: number; steps: number; seed: number | null;
}
export const augmentationFields = [
  { key: 'numSamplesPerClass', label: '클래스별 생성 장수', min: 1, max: 100, step: 1 },
  { key: 'strength', label: '증강 강도', min: 0, max: 1, step: 0.01 },
  { key: 'finetuneSteps', label: '파인튜닝 스텝', min: 1, max: 1000, step: 1 },
  { key: 'steps', label: '샘플링 스텝', min: 1, max: 200, step: 1 },
  { key: 'seed', label: '시드', min: 0, max: 4294967295, step: 1 },
] as const;
export type AugmentationDraft = Record<keyof AugmentationSettings, string>;
export function readAugmentationSettings(value: unknown): AugmentationSettings {
  if (!value || typeof value !== 'object') throw new Error('이 항목에는 실제 증강 설정 기록이 없습니다.');
  const result = {} as AugmentationSettings;
  for (const field of augmentationFields) {
    const v = (value as Record<string, unknown>)[field.key];
    if (field.key === 'seed' && v == null) { result.seed = null; continue; }
    if (typeof v !== 'number' || !Number.isFinite(v) || v < field.min || v > field.max || (field.step === 1 && !Number.isInteger(v))) throw new Error(`${field.label} 기록을 확인할 수 없습니다.`);
    result[field.key] = v;
  }
  return result;
}
export function settingsFromDraft(draft: AugmentationDraft) {
  if (Object.entries(draft).some(([key, value]) => key !== 'seed' && !value.trim())) throw new Error('증강 설정을 모두 입력해 주세요.');
  return readAugmentationSettings(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, key === 'seed' && !value.trim() ? null : Number(value)])));
}
export function draftFromSettings(value: unknown): AugmentationDraft {
  const settings = readAugmentationSettings(value);
  return Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, value == null ? '' : String(value)])) as AugmentationDraft;
}
export function augmentationJobParameters(settings: AugmentationSettings) {
  const s = readAugmentationSettings(settings);
  return { num_samples_per_class: s.numSamplesPerClass, strength: s.strength, finetune_steps: s.finetuneSteps, steps: s.steps, ...(s.seed != null ? { seed: s.seed } : {}) };
}
export function augmentationRecipePayload(meta: { title: string; description: string; overview: string }, settings: AugmentationSettings, isPublic: boolean, sourceJobId?: number) {
  if (!meta.title.trim() || !meta.description.trim()) throw new Error('제목과 설명을 입력해 주세요.');
  const validated = readAugmentationSettings(settings);
  if (sourceJobId != null && (!Number.isSafeInteger(sourceJobId) || sourceJobId <= 0)) throw new Error('원본 작업 번호를 확인해 주세요.');
  return { title: meta.title.trim(), description: meta.description.trim(), overview: meta.overview.trim() || undefined, isPublic,
    ...(sourceJobId != null ? { sourceJobId } : { augmentationSettings: validated }) };
}
