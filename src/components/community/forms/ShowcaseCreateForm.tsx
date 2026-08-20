import React, { useState } from 'react';
import api from '../../../lib/axios';
import { useCommunityStore } from '../../../store/useCommunityStore';
import { Sparkles, Layers, Sliders, Cpu, Plus, X, ArrowRight } from 'lucide-react';

interface ShowcaseCreateFormProps {
  onClose: () => void;
  context?: 'COMMUNITY' | 'ASSET';
}

export default function ShowcaseCreateForm({ onClose, context = 'COMMUNITY' }: ShowcaseCreateFormProps) {
  const isAsset = context === 'ASSET';
  const { fetchRecipeList } = useCommunityStore();

  // Basic Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [overview, setOverview] = useState('');

  // Model & Pipeline Settings
  const [modelName, setModelName] = useState('BIFUSION-Diffusion-v2.1');
  const [steps, setSteps] = useState<number>(50);
  const [sampler, setSampler] = useState('Euler a');
  const [cfgScale, setCfgScale] = useState<number>(7.5);
  const [seed, setSeed] = useState<number>(42);
  const [resolution, setResolution] = useState('512x512');
  const [batchSize, setBatchSize] = useState<number>(4);

  // Features & Recommendations
  const [features, setFeatures] = useState<string[]>(['고해상도 CT 정밀 복원', '노이즈 왜곡 최소화']);
  const [featureInput, setFeatureInput] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>(['흉부 질환 분류 모델 학습', '데이터 희소 클래스 증강']);
  const [recommendationInput, setRecommendationInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (item: string) => {
    setFeatures(features.filter((f) => f !== item));
  };

  const handleAddRecommendation = () => {
    if (recommendationInput.trim() && !recommendations.includes(recommendationInput.trim())) {
      setRecommendations([...recommendations, recommendationInput.trim()]);
      setRecommendationInput('');
    }
  };

  const handleRemoveRecommendation = (item: string) => {
    setRecommendations(recommendations.filter((r) => r !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('레시피 제목을 입력해 주세요.');
      return;
    }
    if (!description.trim()) {
      alert('한 줄 요약 설명을 입력해 주세요.');
      return;
    }
    if (!modelName.trim()) {
      alert('모델명을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isPublic = !isAsset;
      await api.post('/community/recipes', {
        title,
        description,
        modelName,
        steps: Number(steps),
        sampler,
        cfgScale: Number(cfgScale),
        seed: Number(seed),
        resolution,
        batchSize: Number(batchSize),
        overview: overview.trim() || undefined,
        features: features.length > 0 ? features : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        isPublic,
      });

      alert(
        isPublic
          ? '연구 쇼케이스(레시피)가 커뮤니티에 성공적으로 공유되었습니다!'
          : '나만의 레시피가 내 자산에 안전하게 저장되었습니다!'
      );
      fetchRecipeList();
      onClose();
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert('레시피 등록에 실패했습니다: ' + (err.response?.data?.message || err.message));
    } finally {
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

      <form onSubmit={handleSubmit} className="space-y-8">
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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
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
                onChange={(e) => setOverview(e.target.value)}
                placeholder="데이터셋 및 모델에 대한 상세한 설명, 사용 방법, 검증 결과 등을 자유롭게 작성하세요."
                className="w-full h-24 px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:bg-background transition-all font-medium text-sm resize-none"
              />
            </div>
          </div>
        </div>

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
                onChange={(e) => setModelName(e.target.value)}
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
                onChange={(e) => setSteps(Number(e.target.value))}
                min={1}
                max={200}
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
                onChange={(e) => setSampler(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
              >
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
                step="0.1"
                value={cfgScale}
                onChange={(e) => setCfgScale(Number(e.target.value))}
                min={1}
                max={30}
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
                onChange={(e) => setSeed(Number(e.target.value))}
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
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary font-medium text-sm"
              >
                <option value="512x512">512x512</option>
                <option value="768x768">768x768</option>
                <option value="1024x1024">1024x1024</option>
              </select>
            </div>
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
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-black text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSubmitting ? '저장 중...' : isAsset ? '레시피 저장' : '쇼케이스 등록'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
