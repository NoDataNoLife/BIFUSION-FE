import React, { useState, useEffect, useRef } from 'react';
import { isCancel } from 'axios';
import { requestMessage } from '../../../lib/liveData';
import { newRecipeDraft, draftFromRecipe, recipeRegistrationPayload, type RecipeDraft } from '../../../lib/recipeDraft';
import type { RecipeDetailResponse } from '../../../store/useCommunityStore';
import ForkedRecipePicker from './ForkedRecipePicker';
import RecipeImageField from './RecipeImageField';
import api from '../../../lib/axios';
import { uploadTempFiles, type TempUploadedFile } from '../../../lib/fileUpload';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { Sparkles, Layers, Sliders, Cpu, X, ArrowRight } from 'lucide-react';

interface ShowcaseCreateFormProps {
  onClose: () => void;
  context?: 'COMMUNITY' | 'ASSET';
  initialSourceId?: number;
  onCreated?: () => void;
}

export default function ShowcaseCreateForm({ onClose, context = 'COMMUNITY', initialSourceId, onCreated }: ShowcaseCreateFormProps) {
  const isAsset = context === 'ASSET';
  const { fetchRecipeList } = useCommunityStore();

  const [draft, setDraft] = useState(newRecipeDraft);
  const { title, description, overview, modelName, steps, sampler, cfgScale, seed, resolution, batchSize, features, recommendations } = draft;
  const [recipeImage, setRecipeImage] = useState<File | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [recommendationInput, setRecommendationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const baseline = useRef(JSON.stringify(newRecipeDraft()));
  const controller = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const submitRef = useRef(false);
  const imageCache = useRef(new Map<File, TempUploadedFile>());
  const updateDraft = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => setDraft(previous => ({ ...previous, [key]: value }));
  const loadSource = async (id: number) => {
    if (loadingRef.current || submitRef.current) return;
    if ((JSON.stringify(draft) !== baseline.current || recipeImage || featureInput.trim() || recommendationInput.trim()) && !window.confirm('작성 중인 내용을 선택한 레시피의 내용과 설정으로 바꿀까요?')) return;
    controller.current?.abort();
    const request = new AbortController(); controller.current = request;
    loadingRef.current = true; setSourceLoading(true); setSourceError(null);
    try {
      const response = await api.get(`/community/recipes/${id}`, { signal: request.signal });
      if (request.signal.aborted) return;
      const data = response.data?.data as RecipeDetailResponse | undefined;
      if (response.data?.success === false || !data || data.recipeId !== id) throw new Error('레시피 정보를 확인할 수 없습니다.');
      const next = draftFromRecipe(data);
      setDraft(next); baseline.current = JSON.stringify(next); setSourceName(data.title);
      setRecipeImage(null); setFeatureInput(''); setRecommendationInput(''); setShowPicker(false); setSubmitError(null);
    } catch (error) {
      if (!isCancel(error) && !request.signal.aborted) setSourceError(requestMessage(error, '레시피를 불러오지 못했습니다.'));
    } finally {
      if (controller.current === request) { loadingRef.current = false; setSourceLoading(false); }
    }
  };
  useEffect(() => {
    if (initialSourceId != null) void loadSource(initialSourceId);
    return () => { controller.current?.abort(); loadingRef.current = false; };
    // Initial source is scoped to this form instance; manual imports use loadSource.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSourceId]);

  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      updateDraft('features', [...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (item: string) => {
    updateDraft('features', features.filter((f) => f !== item));
  };

  const handleAddRecommendation = () => {
    if (recommendationInput.trim() && !recommendations.includes(recommendationInput.trim())) {
      updateDraft('recommendations', [...recommendations, recommendationInput.trim()]);
      setRecommendationInput('');
    }
  };

  const handleRemoveRecommendation = (item: string) => {
    updateDraft('recommendations', recommendations.filter((r) => r !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current || sourceLoading || loadingRef.current) return;
    setSubmitError(null);
    if (initialSourceId != null && !sourceName) { setSubmitError('불러오기를 완료한 뒤 저장해 주세요.'); return; }
    const isPublic = !isAsset;
    let payload;
    try { payload = recipeRegistrationPayload(draft, isPublic); }
    catch (error) { setSubmitError(requestMessage(error)); return; }
    submitRef.current = true;
    setIsSubmitting(true);
    try {
      const uploaded = recipeImage ? await uploadTempFiles([recipeImage], undefined, imageCache.current) : [];
      const response = await api.post('/community/recipes', { ...payload, ...(uploaded[0] ? { thumbnailFileId: uploaded[0].fileId } : {}) });
      if (response.data?.success === false) throw new Error(response.data.message || '레시피 등록에 실패했습니다.');

      alert(
        isPublic
          ? '연구 쇼케이스(레시피)가 커뮤니티에 성공적으로 공유되었습니다!'
          : '나만의 레시피가 내 자산에 안전하게 저장되었습니다!'
      );
      void fetchRecipeList();
      if (onCreated) onCreated(); else onClose();
    } catch (error) {
      setSubmitError(requestMessage(error, '레시피 등록에 실패했습니다.'));
    } finally {
      submitRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="text-primary w-6 h-6" />
          {isAsset ? '새 파이프라인 레시피 생성' : '연구 쇼케이스(레시피) 등록'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
          <X size={20} className="text-muted-foreground" />
        </button>
      </div>

      <p className="text-muted-foreground mb-8 font-medium text-sm leading-relaxed">
        {isAsset
          ? '개인 작업실에서 사용할 맞춤형 증강 파이프라인 파라미터를 레시피로 안전하게 등록합니다. (비공개)'
          : '검증된 고성능 데이터 생성 파라미터와 노하우를 커뮤니티 연구자들과 공유해 보세요. (공개)'}
      </p>

      <div className="mb-6 space-y-3">
        <button type="button" disabled={isSubmitting || sourceLoading} onClick={() => setShowPicker(value => !value)} className="rounded-xl border border-border bg-primary/5 px-4 py-3 text-sm font-bold text-primary disabled:opacity-50">포크한 레시피 불러오기</button>
        <p className="text-xs leading-6 text-muted-foreground">저장한 레시피의 내용과 설정을 가져와 수정할 수 있습니다. 원본은 그대로 두고 새 레시피로 저장합니다.</p>
        {sourceLoading && <p role="status" className="text-sm text-primary">레시피를 불러오는 중…</p>}
        {sourceError && <p role="alert" className="text-sm text-red-500">{sourceError} {initialSourceId != null && <button type="button" disabled={sourceLoading} onClick={() => void loadSource(initialSourceId)} className="underline">다시 시도</button>}</p>}
        {sourceName && <p role="status" className="rounded-xl bg-primary/10 p-3 text-sm text-primary">불러온 레시피: {sourceName}. 비어 있는 필수 설정은 직접 입력해 주세요.</p>}
        {showPicker && <ForkedRecipePicker onSelect={id => void loadSource(id)} onClose={() => setShowPicker(false)} busy={isSubmitting || sourceLoading}/>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {submitError && <p role="alert" className="text-sm text-red-500">{submitError}</p>}
        <fieldset disabled={isSubmitting || sourceLoading} className="space-y-8 disabled:opacity-60">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-primary" /> 기본 정보
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                레시피 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => updateDraft('title', e.target.value)}
                placeholder="예: 흉부 CT 노이즈 감소 및 결절 증강 파이프라인"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                한 줄 요약 설명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => updateDraft('description', e.target.value)}
                placeholder="예: 미세 병변의 형태학적 특성을 유지하며 배경 잡음을 효과적으로 증강합니다."
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                상세 본문 / 연구 배경 (선택)
              </label>
              <textarea
                value={overview}
                onChange={(e) => updateDraft('overview', e.target.value)}
                placeholder="데이터셋 및 모델에 대한 상세한 설명, 사용 방법, 검증 결과 등을 자유롭게 작성하세요."
                className="w-full h-24 px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all font-medium text-sm resize-none"
              />
            </div>
          </div>
        </div>

        <RecipeImageField file={recipeImage} onChange={setRecipeImage} disabled={isSubmitting}/>

        {/* Section 2: Generation Hyperparameters */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Sliders size={16} className="text-primary" /> 파이프라인 하이퍼파라미터
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                <Cpu size={14} className="text-muted-foreground" /> 생성 모델명 *
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => updateDraft('modelName', e.target.value)}
                placeholder="예: BIFUSION-v2.1"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                샘플링 스텝 (Steps) *
              </label>
              <input
                type="number"
                value={steps}
                onChange={(e) => updateDraft('steps', e.target.value)}
                min={1}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                샘플러 (Sampler) *
              </label>
              <select
                value={sampler}
                onChange={(e) => updateDraft('sampler', e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
              >
                <option value="">샘플러 선택</option>
                {sampler && !['Euler a', 'Euler', 'DPM++ 2M Karras', 'DPM++ SDE Karras', 'DDIM'].includes(sampler) && <option value={sampler}>{sampler}</option>}
                <option value="Euler a">Euler a</option>
                <option value="Euler">Euler</option>
                <option value="DPM++ 2M Karras">DPM++ 2M Karras</option>
                <option value="DPM++ SDE Karras">DPM++ SDE Karras</option>
                <option value="DDIM">DDIM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                CFG Scale *
              </label>
              <input
                type="number"
                step="any"
                value={cfgScale}
                onChange={(e) => updateDraft('cfgScale', e.target.value)}
                min={0}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                시드값 (Seed) *
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => updateDraft('seed', e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                해상도 (Resolution) *
              </label>
              <select
                value={resolution}
                onChange={(e) => updateDraft('resolution', e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
              >
                <option value="">해상도 선택</option>
                {resolution && !['512x512', '768x768', '1024x1024'].includes(resolution) && <option value={resolution}>{resolution}</option>}
                <option value="512x512">512x512</option>
                <option value="768x768">768x768</option>
                <option value="1024x1024">1024x1024</option>
              </select>
            </div>
            <div><label className="mb-1.5 block text-xs font-bold text-foreground">배치 크기 *</label><input type="number" required min={1} step={1} value={batchSize} onChange={event => updateDraft('batchSize', event.target.value)} className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium"/></div>
          </div>
        </div>

        {/* Section 3: Features & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">핵심 특징 태그</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="특징 입력 후 추가"
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {features.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 bg-muted border border-border rounded-lg text-xs font-bold flex items-center gap-1.5 text-foreground"
                >
                  {item}
                  <button type="button" onClick={() => handleRemoveFeature(item)}>
                    <X size={12} className="text-muted-foreground hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">추천 용도 / 활용처</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={recommendationInput}
                onChange={(e) => setRecommendationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRecommendation();
                  }
                }}
                placeholder="용도 입력 후 추가"
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddRecommendation}
                className="px-3 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recommendations.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 bg-muted border border-border rounded-lg text-xs font-bold flex items-center gap-1.5 text-foreground"
                >
                  {item}
                  <button type="button" onClick={() => handleRemoveRecommendation(item)}>
                    <X size={12} className="text-muted-foreground hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex justify-between items-center">
          <span className="text-xs font-bold text-muted-foreground">
            공개 범위: {isAsset ? '🔒 내 작업실 비공개 (isPublic: false)' : '🌐 커뮤니티 전체 공개 (isPublic: true)'}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-bold text-muted-foreground bg-muted hover:bg-gray-200 transition-colors text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || sourceLoading || (!!initialSourceId && !sourceName)}
              className="px-8 py-3 rounded-xl font-black text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSubmitting ? '저장 중...' : isAsset ? '레시피 저장' : '쇼케이스 등록'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
