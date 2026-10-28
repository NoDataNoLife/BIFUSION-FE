import { useEffect, useRef, useState } from 'react';
import api from '../../../lib/axios';
import { requestMessage } from '../../../lib/liveData';
import { augmentationFields, augmentationRecipePayload, draftFromSettings, settingsFromDraft, type AugmentationDraft } from '../../../lib/augmentationRecipe';
import { LimitedInput, LimitedTextarea } from '../../common/LimitedTextField';
import ForkedRecipePicker from './ForkedRecipePicker';
import RecipeImageField from './RecipeImageField';
import { uploadTempFiles, type TempUploadedFile } from '../../../lib/fileUpload';
import { useCommunityStore } from '../../../store/useCommunityStore';

export default function AugmentationRecipeForm({ onClose, onCreated, context = 'COMMUNITY', initialSourceId, sourceJobId }: { onClose: () => void; onCreated?: () => void; context?: 'ASSET' | 'COMMUNITY'; initialSourceId?: number; sourceJobId?: number }) {
  const [meta, setMeta] = useState({ title: '', description: '', overview: '' });
  const [settings, setSettings] = useState<AugmentationDraft>({ numSamplesPerClass: '', strength: '', finetuneSteps: '', steps: '', seed: '' });
  const [image, setImage] = useState<File | null>(null);
  const cache = useRef(new Map<File, TempUploadedFile>());
  const [extras, setExtras] = useState<{ features?: string[]; recommendations?: string[] }>({});
  const [featureText, setFeatureText] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [picker, setPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [ready, setReady] = useState(initialSourceId == null && sourceJobId == null);
  const lock = useRef(false);
  const request = useRef<AbortController | null>(null);
  const dirty = useRef(false);
  const load = async (recipeId?: number) => {
    if (lock.current) return;
    if (dirty.current && !window.confirm('작성 중인 내용을 선택한 레시피로 바꿀까요?')) return;
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    lock.current = true; setLoading(true); setError(null);
    try {
      const response = await api.get(recipeId != null ? `/community/recipes/${recipeId}` : `/jobs/${sourceJobId}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const data = response.data?.data;
      if (response.data?.success === false || !data || (recipeId != null ? data.recipeId !== recipeId || data.isDeleted : Number(data.jobId) !== sourceJobId || data.type !== 'AUGMENTATION' || data.status !== 'SUCCESS')) throw new Error('불러올 원본 정보를 확인할 수 없습니다.');
      const next = draftFromSettings(data.augmentationSettings);
      setSettings(next); setReady(true); setPicker(false); setSource(recipeId != null ? data.title : `JOB-${sourceJobId}`);
      if (recipeId != null) { setMeta({ title: data.title ?? '', description: data.description ?? '', overview: data.overview?.content ?? '' }); setExtras({ features: data.overview?.features ?? [], recommendations: data.overview?.recommendations ?? [] }); }
      setImage(null); setFeatureText(''); setRecommendationText(''); dirty.current = false;
    } catch (e) { if (!controller.signal.aborted) setError(requestMessage(e)); }
    finally { if (request.current === controller) { lock.current = false; setLoading(false); } }
  };
  useEffect(() => {
    if (initialSourceId != null || sourceJobId != null) void load(initialSourceId);
    return () => { request.current?.abort(); lock.current = false; };
    // Initial source belongs to this mounted form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSourceId, sourceJobId]);
  return <form className="space-y-6 p-6 sm:p-8" onSubmit={async event => {
    event.preventDefault(); if (lock.current || !ready) return;
    setError(null);
    let payload;
    try { payload = { ...augmentationRecipePayload(meta, settingsFromDraft(settings), context !== 'ASSET', sourceJobId), ...extras }; }
    catch (e) { setError(requestMessage(e)); return; }
    lock.current = true; setBusy(true);
    try {
      const uploaded = image ? await uploadTempFiles([image], undefined, cache.current) : [];
      const response = await api.post('/community/recipes', { ...payload, ...(uploaded[0] ? { thumbnailFileId: uploaded[0].fileId } : {}) });
      if (response.data?.success === false) throw new Error(response.data.message || '레시피를 저장하지 못했습니다.');
      void useCommunityStore.getState().fetchRecipeList();
      (onCreated ?? onClose)();
    } catch (e) { setError(requestMessage(e)); } finally { lock.current = false; setBusy(false); }
  }}>
    <div className="flex justify-between gap-4"><h3 className="text-2xl font-black">{context === 'ASSET' ? '내 증강 레시피 저장' : '증강 레시피 공유'}</h3><button type="button" disabled={busy} onClick={onClose}>닫기</button></div>
    <p className="text-sm text-muted-foreground">증강 실행 설정을 저장합니다. 입력 이미지와 결과 파일은 복사하지 않습니다. {context === 'ASSET' ? '비공개로 저장됩니다.' : '공개로 공유됩니다.'}</p>
    {sourceJobId == null && <button type="button" disabled={loading || busy} onClick={() => setPicker(!picker)} className="rounded-xl border border-border p-3 text-primary">포크한 레시피 불러오기</button>}
    {picker && <ForkedRecipePicker busy={loading || busy} onSelect={id => void load(id)} onClose={() => setPicker(false)}/>}
    {source && <p role="status">불러온 설정: {source}</p>}
    {loading && <p role="status">실행 설정을 불러오는 중…</p>}
    {error && <p role="alert" className="text-red-500">{error}</p>}
    {!ready && !loading && <button type="button" onClick={() => void load(initialSourceId)}>다시 불러오기</button>}
    <fieldset disabled={loading || busy} className="space-y-5">
      <label className="block">레시피 제목<LimitedInput maxLength={100} required value={meta.title} onChange={e => { dirty.current = true; setMeta({ ...meta, title: e.target.value }); }} className="w-full rounded-xl border border-border bg-background p-3" /></label>
      <label className="block">설명<LimitedTextarea maxLength={2000} required value={meta.description} onChange={e => { dirty.current = true; setMeta({ ...meta, description: e.target.value }); }} className="w-full rounded-xl border border-border bg-background p-3" /></label>
      <label className="block">상세 본문<LimitedTextarea maxLength={2000} value={meta.overview} onChange={e => { dirty.current = true; setMeta({ ...meta, overview: e.target.value }); }} className="w-full rounded-xl border border-border bg-background p-3" /></label>
      <RecipeImageField file={image} onChange={file => { dirty.current = true; setImage(file); }} disabled={busy}/>
      {([{ key: 'features', label: '핵심 특징', value: featureText, set: setFeatureText }, { key: 'recommendations', label: '추천 사용 사례', value: recommendationText, set: setRecommendationText }] as const).map(item => <div key={item.key} className="space-y-2"><label className="block">{item.label} ({(extras[item.key] ?? []).length}/20개)<LimitedInput maxLength={200} value={item.value} disabled={(extras[item.key] ?? []).length >= 20} onChange={e => item.set(e.target.value)} onKeyDown={e => {
        if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
        e.preventDefault(); const text = item.value.trim(); const list = extras[item.key] ?? [];
        if (!text || list.length >= 20 || list.includes(text)) return;
        setExtras({ ...extras, [item.key]: [...list, text] }); item.set(''); dirty.current = true;
      }} placeholder="입력 후 Enter로 추가" className="w-full rounded-xl border border-border bg-background p-3" /></label><div className="flex flex-wrap gap-2">{(extras[item.key] ?? []).map((value, index) => <button type="button" key={`${index}-${value}`} onClick={() => { setExtras({ ...extras, [item.key]: (extras[item.key] ?? []).filter((_, i) => i !== index) }); dirty.current = true; }} className="rounded-lg border border-border p-2 text-sm" aria-label={`${value} 삭제`}>{value} ×</button>)}</div></div>)}
      {sourceJobId != null && <p className="text-sm text-muted-foreground">실제 실행한 설정을 그대로 저장합니다. 설정 변경은 저장한 레시피를 불러와 새 레시피로 작성해 주세요.</p>}
      <div className="grid gap-4 sm:grid-cols-2">{augmentationFields.map(field => <label key={field.key} className="block text-sm font-bold">{field.label}<input required type="number" min={field.min} max={field.max} step={field.key === 'strength' ? 'any' : field.step} readOnly={sourceJobId != null} value={settings[field.key]} onChange={e => { dirty.current = true; setSettings({ ...settings, [field.key]: e.target.value }); }} className="mt-2 w-full rounded-xl border border-border bg-background p-3" /></label>)}</div>
    </fieldset>
    <button disabled={busy || loading || !ready} className="rounded-xl bg-primary px-6 py-3 font-bold text-white disabled:opacity-50">{busy ? '저장 중…' : context === 'ASSET' ? '내 레시피로 저장' : '레시피 공유'}</button>
  </form>;
}
