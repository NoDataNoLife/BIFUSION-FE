import { useState } from 'react';
import VerificationRequestModal from '../community/modals/VerificationRequestModal';
import { ArrowLeft, Star, GitFork, Eye, Award, Download, Calendar, MessageCircle, Share2, Check, Trash2, Clock, CheckCircle, AlertCircle, Save } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { useAssetStore } from '../../store/useAssetStore';
import { type Recipe } from '../../store/mockData';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onFork?: (recipe: Recipe) => void;
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
  const { toggleFork, isForked } = useAssetStore();
  const forked = isForked(recipe.id);
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

  const handleForkRecipe = () => {
    toggleFork(recipe.id);
    if (onFork) onFork(recipe);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Assets로 돌아가기
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleForkRecipe} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm border ${
                forked 
                  ? 'bg-green-50 border-green-200 text-green-600' 
                  : 'bg-card border-border text-foreground hover:bg-muted'
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
        <div className="bg-card rounded-4xl overflow-hidden border border-border shadow-sm grid md:grid-cols-2">
          <div className="aspect-video md:aspect-auto bg-muted">
            <ImageWithFallback src={recipe.thumbnailUrl} alt={recipe.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-10 space-y-6">
            <div className="flex items-center gap-3">
              {recipe.isExpertVerified && (
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                  <Award size={14} /> 전문가 검증
                </div>
              )}
            </div>
            
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">{recipe.title}</h1>
            <p className="text-muted-foreground font-medium leading-relaxed">{recipe.description}</p>

            {/* Author Card */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl border border-border">
              <ImageWithFallback src={recipe.authorAvatar} alt={recipe.author} className="w-12 h-12 rounded-xl ring-4 ring-white shadow-sm" />
              <div>
                <p className="font-bold text-foreground">{recipe.author}</p>
                <p className="text-xs text-muted-foreground font-medium">{recipe.createdAt.split('T')[0]} 작성됨</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card border border-border rounded-2xl text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">평점</p>
                <p className="text-xl font-black text-yellow-500 flex items-center justify-center gap-1">
                  <Star size={18} fill="currentColor" /> {recipe.rating}
                </p>
              </div>
              <div className="p-4 bg-card border border-border rounded-2xl text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Fork 수</p>
                <p className="text-xl font-black text-primary flex items-center justify-center gap-1">
                  <GitFork size={18} /> {recipe.forkedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="bg-card rounded-4xl border border-border shadow-sm overflow-hidden">
          <div className="px-8 pt-8 border-b border-gray-50 flex gap-8">
            {(['overview', 'config', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-6 text-sm font-black transition-all relative ${
                  activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-gray-600'
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
                <div className="grid md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-8">
                    <div className="prose prose-slate max-w-none">
                      <h3 className="text-2xl font-black text-foreground mb-6">연구 배경 및 방법론</h3>
                      <p className="text-muted-foreground font-medium leading-loose whitespace-pre-line">
                        {recipe.overview.content}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-lg font-black text-foreground">핵심 기능</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {recipe.overview.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border">
                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                              <Check size={14} />
                            </div>
                            <span className="text-sm font-bold text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 bg-primary/5 rounded-4xl border border-primary/10 space-y-6">
                      <h4 className="text-lg font-black text-primary">추천 활용 사례</h4>
                      <ul className="space-y-4">
                        {recipe.overview.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-3 text-sm font-bold text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {isAuthor && (
                  <div className="p-8 bg-muted rounded-4xl border border-border space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-foreground">작성자 관리 도구</h3>
                      <div className="px-4 py-1.5 bg-gray-200 text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest">
                        내 레시피
                      </div>
                    </div>
                    
                    {recipe.id === '3' && ( // 임시로 ID 3번(내 레시피)만 검증 신청 가능하게 표시
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Award size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">전문가 검증을 신청하세요</p>
                            <p className="text-sm text-muted-foreground font-medium">검증 완료 시 레시피 신뢰도가 대폭 향상됩니다.</p>
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
                {Object.entries(recipe.settings).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-6 bg-muted rounded-2xl border border-border">
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">{key}</span>
                    <span className="font-mono font-bold text-primary bg-card px-4 py-1.5 rounded-lg border border-border shadow-sm">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="p-8 bg-gray-50/50 rounded-3xl border border-border space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <ImageWithFallback src={review.authorAvatar} alt={review.author} className="w-10 h-10 rounded-xl" />
                        <div>
                          <p className="font-bold text-foreground">{review.author}</p>
                          <div className="flex text-yellow-400 gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-muted-foreground'} />)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground font-medium leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-foreground text-center mb-2">레시피 삭제</h2>
            <p className="text-muted-foreground text-center font-medium mb-8">정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-gray-200 transition-all">취소</button>
              <button onClick={() => { onDelete?.(recipe.id); onBack(); }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-xl shadow-red-200 transition-all">삭제하기</button>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <VerificationRequestModal
          assetTitle={recipe.title}
          onClose={() => setShowVerificationModal(false)}
          onSubmit={(reason, reward) => {
            console.log("Verification requested:", { reason, reward });
            // TODO: Call API
            setShowVerificationModal(false);
          }}
        />
      )}
    </div>
  );
}
