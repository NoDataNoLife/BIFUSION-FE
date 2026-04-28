import { useState } from 'react';
import { ArrowLeft, Star, GitFork, Eye, Award, Download, Calendar, MessageCircle, Share2, Check, Trash2, Clock, CheckCircle, AlertCircle, Save } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

interface RecipeDetailProps {
  recipe: {
    id: string;
    name: string;
    author: string;
    authorAvatar: string;
    authorId?: string;
    isExpertVerified: boolean;
    rating: number;
    reviewCount: number;
    forkCount: number;
    usageCount: number;
    thumbnail: string;
    description: string;
    forkedFrom?: string;
    createdAt: string;
    verificationStatus?: 'none' | 'pending' | 'verified';
  };
  onBack: () => void;
  onFork?: (recipe: any) => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
  isAuthor?: boolean;
  onDelete?: (recipeId: string) => void;
  onVerificationRequest?: (recipeId: string) => void;
}

interface Review {
  id: string;
  author: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export default function RecipeDetail({ recipe, onBack, onFork, onAuthorClick, isAuthor, onDelete, onVerificationRequest }: RecipeDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'reviews'>('overview');
  const [forked, setForked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const reviews: Review[] = [
    {
      id: '1',
      author: '김성한',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
      rating: 5,
      comment: '정말 훌륭한 레시피입니다. 데이터 증강 품질이 매우 높고, 모델 성능이 크게 향상되었습니다.',
      date: '2025-02-15',
    },
    {
      id: '2',
      author: '조현희',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cho',
      rating: 4,
      comment: '전반적으로 좋지만, 파라미터 튜닝이 조금 더 필요할 것 같습니다.',
      date: '2025-02-10',
    },
  ];

  const configDetails = {
    model: 'Stable Diffusion XL',
    steps: 50,
    sampler: 'DPM++ 2M Karras',
    cfgScale: 7.5,
    seed: 'Random',
    resolution: '1024x1024',
    batchSize: 4,
  };

  const handleForkRecipe = () => {
    if (onFork) onFork(recipe);
    setForked(true);
    setTimeout(() => setForked(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Assets로 돌아가기
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleForkRecipe} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm border ${
                forked 
                  ? 'bg-green-50 border-green-200 text-green-600' 
                  : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
            >
              {forked ? <Check className="w-4 h-4" /> : <GitFork className="w-4 h-4" />}
              {forked ? 'Fork됨' : '이 레시피 Fork'}
            </button>
            <button 
              onClick={handleShare}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg ${
                copied
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? '링크 복사됨' : '공유'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm grid md:grid-cols-2">
          <div className="aspect-video md:aspect-auto bg-gray-50">
            <ImageWithFallback src={recipe.thumbnail} alt={recipe.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-10 space-y-6">
            <div className="flex items-center gap-3">
              {recipe.isExpertVerified && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                  <Award size={14} /> 전문가 검증
                </div>
              )}
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{recipe.name}</h1>
            <p className="text-gray-500 font-medium leading-relaxed">{recipe.description}</p>

            {/* Author Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <ImageWithFallback src={recipe.authorAvatar} alt={recipe.author} className="w-12 h-12 rounded-xl ring-4 ring-white shadow-sm" />
              <div>
                <p className="font-bold text-gray-900">{recipe.author}</p>
                <p className="text-xs text-gray-400 font-medium">{recipe.createdAt} 작성됨</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">평점</p>
                <p className="text-xl font-black text-yellow-500 flex items-center justify-center gap-1">
                  <Star size={18} fill="currentColor" /> {recipe.rating}
                </p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-2xl text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fork 수</p>
                <p className="text-xl font-black text-primary flex items-center justify-center gap-1">
                  <GitFork size={18} /> {recipe.forkCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 pt-8 border-b border-gray-50 flex gap-8">
            {(['overview', 'config', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-6 text-sm font-black transition-all relative ${
                  activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'overview' ? '개요' : tab === 'config' ? '설정 정보' : `리뷰 (${reviews.length})`}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
              </button>
            ))}
          </div>

          <div className="p-10">
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-2xl font-black text-gray-900 mb-6">연구 배경 및 방법론</h3>
                  <p className="text-gray-600 font-medium leading-loose">
                    이 레시피는 대규모 의료 영상 데이터 증강을 위해 설계된 최적화 파이프라인입니다. 
                    Stable Diffusion XL 아키텍처를 기반으로 하며, 의료 전문가의 피드백을 반영하여 
                    해부학적 정확도를 극대화했습니다.
                  </p>
                </div>

                {isAuthor && (
                  <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6">
                    <h3 className="text-xl font-black text-gray-900">작성자 관리 도구</h3>
                    
                    {recipe.verificationStatus === 'none' && (
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Award size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">전문가 검증을 신청하세요</p>
                            <p className="text-sm text-gray-500 font-medium">검증 완료 시 레시피 신뢰도가 대폭 향상됩니다.</p>
                          </div>
                        </div>
                        <button onClick={() => setShowVerificationModal(true)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm">
                          신청하기
                        </button>
                      </div>
                    )}

                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-red-600">위험 구역</p>
                        <p className="text-sm text-red-400 font-medium">이 레시피를 영구적으로 삭제합니다.</p>
                      </div>
                      <button onClick={() => setShowDeleteModal(true)} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm flex items-center gap-2">
                        <Trash2 size={18} /> 레시피 삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(configDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{key}</span>
                    <span className="font-mono font-bold text-primary bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <ImageWithFallback src={review.authorAvatar} alt={review.author} className="w-10 h-10 rounded-xl" />
                        <div>
                          <p className="font-bold text-gray-900">{review.author}</p>
                          <div className="flex text-yellow-400 gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-300'} />)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals (Simplified) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 text-center mb-2">레시피 삭제</h2>
            <p className="text-gray-500 text-center font-medium mb-8">정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all">취소</button>
              <button onClick={() => { onDelete?.(recipe.id); onBack(); }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-xl shadow-red-200 transition-all">삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
