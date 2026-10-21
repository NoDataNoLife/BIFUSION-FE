import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitFork, Share2, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuthStore } from '../../store/useAuthStore';
import { useCommunityStore, type RecipeDetailResponse } from '../../store/useCommunityStore';
import VerificationResultModal from '../community/modals/VerificationResultModal';
import ExpertVerificationCard, { type VerificationStatus } from '../community/ExpertVerificationCard';

export interface Recipe { id: string; title?: string }
interface Props { recipe: Recipe; onBack: () => void; isAuthor?: boolean; onDelete?: () => void | Promise<void> }
interface Review { reviewId: number; userId: number; author: string; content: string; createdAt: string; parentReviewId: number | null; replies: Review[] }
interface Reviews { content: Review[]; totalPages: number }

export default function RecipeDetail({ recipe, onBack }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const detail = useApiQuery<RecipeDetailResponse>(`/community/recipes/${recipe.id}`);
  const [page, setPage] = useState(0);
  const reviews = useApiQuery<Reviews>(`/community/recipes/${recipe.id}/reviews`, { page, size: 10 });
  const [tab, setTab] = useState<'overview' | 'settings' | 'reviews'>('overview');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verification, setVerification] = useState<'result' | null>(null);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(null); setNotice(null);
    try { await action(); } catch (err) { setError(requestMessage(err, '요청을 처리하지 못했습니다.')); }
    finally { setBusy(false); }
  };
  if (detail.loading) return <div className="p-8">레시피를 불러오는 중…</div>;
  if (detail.error || !detail.data) return <div className="p-8 space-y-4"><p role="alert">{detail.error || '레시피가 없습니다.'}</p><button onClick={detail.reload}>다시 시도</button><button onClick={onBack}>목록으로</button></div>;
  const data = detail.data;
  const own = user?.userId === data.author.userId;
  const status = (['NONE', 'PENDING', 'COMPLETED', 'REJECTED', 'IN_PROGRESS'].includes(data.inspectionStatus ?? '') ? data.inspectionStatus : 'NONE') as VerificationStatus;
  const refresh = () => { detail.reload(); reviews.reload(); };
  const renderReview = (review: Review) => <article key={review.reviewId} className="p-5 bg-muted/40 border border-border rounded-2xl space-y-3">
    <div className="flex justify-between gap-3"><strong>{review.author || '탈퇴한 사용자'}</strong><time className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleString()}</time></div>
    <p className="whitespace-pre-wrap">{review.content}</p>
    <div className="flex gap-4 text-sm text-primary">
      {user && !review.parentReviewId && <button disabled={busy} onClick={() => {
        const reply = prompt('답글을 입력하세요.');
        if (reply?.trim()) void run(async () => { await api.post(`/community/recipes/${recipe.id}/reviews`, { content: reply.trim(), parentReviewId: review.reviewId }); refresh(); });
      }}>답글</button>}
      {review.userId === user?.userId && <>
        <button disabled={busy} onClick={() => {
          const edited = prompt('댓글을 수정하세요.', review.content);
          if (!edited?.trim()) return;
          const stars = review.parentReviewId ? undefined : Number(prompt('평점을 입력하세요 (1~5).', '5'));
          if (stars !== undefined && (!Number.isInteger(stars) || stars < 1 || stars > 5)) { setError('평점은 1~5를 입력해 주세요.'); return; }
          void run(async () => { await api.put(`/community/recipes/${recipe.id}/reviews/${review.reviewId}`, { content: edited.trim(), ...(stars === undefined ? {} : { rating: stars }) }); refresh(); });
        }}>수정</button>
        <button disabled={busy} onClick={() => { if (confirm('댓글을 삭제하시겠습니까?')) void run(async () => { await api.delete(`/community/recipes/${recipe.id}/reviews/${review.reviewId}`); refresh(); }); }}>삭제</button>
      </>}
    </div>
    {review.replies?.map(renderReview)}
  </article>;
  return <div className="p-8 max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between gap-4"><button onClick={onBack} className="flex items-center gap-2"><ArrowLeft size={18}/>목록으로</button><div className="flex gap-4">
      {!own && <button disabled={busy} onClick={() => void run(async () => { await api.post(`/community/recipes/${recipe.id}/fork`); setNotice('내 보관함에 저장했습니다.'); detail.reload(); })} className="flex items-center gap-2 text-primary"><GitFork size={18}/>내 보관함에 저장</button>}
      <button onClick={() => void run(async () => { await navigator.clipboard.writeText(`${window.location.origin}/dashboard/community?recipeId=${recipe.id}`); setNotice('링크를 복사했습니다.'); })} className="flex gap-2"><Share2 size={18}/>공유</button>
      {own && <button disabled={busy} onClick={() => { if (confirm('레시피를 삭제하시겠습니까?')) void run(async () => { await useCommunityStore.getState().deleteRecipe(Number(recipe.id)); onBack(); }); }} className="flex gap-2 text-red-500"><Trash2 size={18}/>삭제</button>}
    </div></div>
    {(error || notice) && <p role={error ? 'alert' : 'status'} className={error ? 'text-red-500' : 'text-primary'}>{error || notice}</p>}
    <section className="bg-card border border-border rounded-3xl p-8 space-y-5">
      {data.bannerUrl && <img src={data.bannerUrl} alt={data.title} className="max-h-80 w-full object-cover rounded-2xl"/>}
      <h1 className="text-3xl font-bold">{data.title}</h1><p>{data.description}</p>
      <button onClick={() => navigate(`/dashboard/profile/${data.author.userId}`)} className="text-primary">{data.author.nickname || '탈퇴한 사용자'}</button>
      <p className="text-sm text-muted-foreground">{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '작성일 정보 없음'} · 평점 {data.rating ?? '정보 없음'} · Fork {data.forkCount ?? '정보 없음'} · 조회 {data.viewCount ?? '정보 없음'}</p>
    </section>
    <div className="flex gap-4">{(['overview','settings','reviews'] as const).map((value) => <button key={value} onClick={() => setTab(value)} className={`px-5 py-2 rounded-xl ${tab === value ? 'bg-primary text-white' : 'bg-muted'}`}>{value === 'overview' ? '개요' : value === 'settings' ? '파라미터' : '리뷰'}</button>)}</div>
    {tab === 'overview' && <section className="bg-card border border-border rounded-3xl p-8 space-y-6"><p className="whitespace-pre-wrap">{data.overview?.content || '등록된 상세 설명이 없습니다.'}</p>
      {!!data.overview?.features?.length && <div><h2 className="font-bold">핵심 특징</h2><ul>{data.overview.features.map((value, index) => <li key={index}>{value}</li>)}</ul></div>}
      {!!data.overview?.recommendations?.length && <div><h2 className="font-bold">추천 용도</h2><ul>{data.overview.recommendations.map((value, index) => <li key={index}>{value}</li>)}</ul></div>}
      <p className="text-sm text-muted-foreground">현재 레시피 검증 신청은 지원되지 않습니다.</p>
      <ExpertVerificationCard status={status} onViewResults={() => setVerification('result')}/>
    </section>}
    {tab === 'settings' && <section className="bg-card border border-border rounded-3xl p-8">{data.settings ? <dl className="grid md:grid-cols-2 gap-4">{Object.entries(data.settings).map(([key, value]) => <div key={key} className="p-4 bg-muted rounded-xl flex justify-between"><dt>{key}</dt><dd>{value ?? '정보 없음'}</dd></div>)}</dl> : <p>등록된 파라미터가 없습니다.</p>}</section>}
    {tab === 'reviews' && <section className="space-y-4">
      {reviews.loading ? <p>리뷰를 불러오는 중…</p> : reviews.error ? <p role="alert">{reviews.error} <button onClick={reviews.reload}>다시 시도</button></p> : reviews.data?.content.length ? reviews.data.content.map(renderReview) : <p>작성된 리뷰가 없습니다.</p>}
      <div className="flex gap-4"><button disabled={page === 0 || reviews.loading} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page + 1} 페이지</span><button disabled={reviews.loading || page + 1 >= (reviews.data?.totalPages ?? 0)} onClick={() => setPage((value) => value + 1)}>다음</button></div>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (!content.trim()) return; void run(async () => { await api.post(`/community/recipes/${recipe.id}/reviews`, { content: content.trim(), rating }); setContent(''); refresh(); }); }}>
        <label>평점 <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
        <textarea aria-label="리뷰 내용" value={content} onChange={(event) => setContent(event.target.value)} className="w-full p-4 bg-card border border-border rounded-xl"/>
        <button disabled={busy || !content.trim()} className="px-5 py-2 bg-primary text-white rounded-xl disabled:opacity-50">리뷰 등록</button>
      </form>
    </section>}
    {verification === 'result' && <VerificationResultModal assetTitle={data.title} result={data.inspectionResult} onClose={() => setVerification(null)}/>}
  </div>;
}