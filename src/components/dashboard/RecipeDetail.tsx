import { AntCostNotice, AntRequestError } from '../common/AntActionNotice';
import { forkRecipe, refreshPointsAfter } from '../../lib/pointActions';
import RecipeOrigin from '../community/RecipeOrigin';
import InspectionPanel from '../community/InspectionPanel';
import ProfileAvatar from '../common/ProfileAvatar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitFork, Share2, Trash2, Award, Check } from 'lucide-react';
import { AssetCover, DataState } from './DataView';
import api from '../../lib/axios';
import { commentOnlyReviewsEnabled } from '../../lib/backendFeatures';
import { recipeReviewPayload, recipeReviewEditPayload } from '../../lib/recipeReviewPayload';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuthStore } from '../../store/useAuthStore';
import { useCommunityStore, type RecipeDetailResponse } from '../../store/useCommunityStore';
import VerificationResultModal from '../community/modals/VerificationResultModal';
import ExpertVerificationCard, { type VerificationStatus } from '../community/ExpertVerificationCard';

export interface Recipe { id: string; title?: string }
interface Props { recipe: Recipe; onBack: () => void; isAuthor?: boolean; onDelete?: () => void | Promise<void>; onCreateFromRecipe?: () => void }
interface Review { reviewId: number; userId: number; author: string; content: string; rating?: number | null; profileImageUrl?: string | null; createdAt: string; parentReviewId: number | null; replies: Review[] }
interface Reviews { content: Review[]; totalPages: number; totalElements: number }

export default function RecipeDetail({ recipe, onBack, onCreateFromRecipe }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const detail = useApiQuery<RecipeDetailResponse>(`/community/recipes/${recipe.id}`);
  const [page, setPage] = useState(0);
  const reviews = useApiQuery<Reviews>(`/community/recipes/${recipe.id}/reviews`, { page, size: 10 });
  const [tab, setTab] = useState<'overview' | 'settings' | 'reviews'>('overview');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verification, setVerification] = useState<'result' | null>(null);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(null); setNotice(null);
    try { await action(); } catch (err) { setError(err); }
    finally { setBusy(false); }
  };

  if (detail.loading) return <div className="p-8"><DataState loading /></div>;
  if (detail.error || !detail.data) return <div className="p-8 space-y-4"><p role="alert">{detail.error || '레시피가 없습니다.'}</p><button onClick={detail.reload}>다시 시도</button><button onClick={onBack}>목록으로</button></div>;

  const data = detail.data;
  const own = user?.userId === data.author?.userId;
  const status = (['NONE', 'PENDING', 'COMPLETED', 'REJECTED', 'IN_PROGRESS'].includes(data.inspectionStatus ?? '') ? data.inspectionStatus : 'NONE') as VerificationStatus;
  const refresh = () => { detail.reload(); reviews.reload(); };

  const renderReview = (review: Review) => {
    const editing = editingId === review.reviewId;
    const isReply = review.parentReviewId != null;
    return (
      <article key={review.reviewId} className={`p-5 border border-border rounded-2xl space-y-4 ${isReply ? 'bg-muted/20 ml-3 sm:ml-6' : 'bg-muted/40'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ProfileAvatar src={review.profileImageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div>
              <strong className="text-sm">{review.author || '탈퇴한 사용자'}</strong>
            </div>
          </div>
          <time className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleString('ko-KR')}</time>
        </div>

        {editing ? (
          <form className="space-y-3" onSubmit={event => {
            event.preventDefault();
            if (!editContent.trim()) return;
            void run(async () => {
              await api.put(`/community/recipes/${recipe.id}/reviews/${review.reviewId}`, recipeReviewEditPayload(editContent, commentOnlyReviewsEnabled, review));
              setEditingId(null);
              refresh();
            });
          }}>
            <textarea
              autoFocus
              aria-label="댓글 수정 내용"
              value={editContent}
              disabled={busy}
              onChange={event => setEditContent(event.target.value)}
              className="w-full min-h-28 p-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">취소</button>
              <button disabled={busy || !editContent.trim()} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50">{busy ? '저장 중…' : '수정 저장'}</button>
            </div>
          </form>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">{review.content}</p>
        )}

        {!editing && (
          <div className="flex gap-4 text-xs font-medium text-muted-foreground">
            {user && !isReply && (
              <button disabled={busy} onClick={() => { setReplyTo(review.reviewId); setReplyContent(''); setEditingId(null); }} className="hover:text-primary transition-colors cursor-pointer">
                답글 달기
              </button>
            )}
            {review.userId === user?.userId && (
              <>
                <button disabled={busy} onClick={() => { setEditingId(review.reviewId); setEditContent(review.content); setReplyTo(null); }} className="hover:text-primary transition-colors cursor-pointer">
                  수정
                </button>
                <button disabled={busy} className="text-red-400 hover:text-red-500 transition-colors cursor-pointer" onClick={() => {
                  if (confirm('댓글을 삭제하시겠습니까?')) {
                    void run(async () => {
                      await api.delete(`/community/recipes/${recipe.id}/reviews/${review.reviewId}`);
                      refresh();
                    });
                  }
                }}>
                  삭제
                </button>
              </>
            )}
          </div>
        )}

        {replyTo === review.reviewId && (
          <form className="space-y-3 border-t border-border pt-4" onSubmit={event => {
            event.preventDefault();
            if (!replyContent.trim()) return;
            void run(async () => {
              await api.post(`/community/recipes/${recipe.id}/reviews`, recipeReviewPayload(replyContent, commentOnlyReviewsEnabled, 0, review.reviewId));
              setReplyTo(null);
              setReplyContent('');
              refresh();
            });
          }}>
            <textarea
              autoFocus
              aria-label={`${review.author}님에게 답글`}
              placeholder="답글을 작성해 주세요"
              value={replyContent}
              disabled={busy}
              onChange={event => setReplyContent(event.target.value)}
              className="w-full min-h-24 p-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setReplyTo(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">취소</button>
              <button disabled={busy || !replyContent.trim()} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50">답글 등록</button>
            </div>
          </form>
        )}

        {review.replies?.map(renderReview)}
      </article>
    );
  };

  return <div className="min-h-screen bg-background">
    <div className="bg-card border-b border-border sticky top-0 z-10"><div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm"><ArrowLeft size={18}/>목록으로 돌아가기</button>
      <div className="flex flex-wrap gap-3">
        {onCreateFromRecipe && <button disabled={busy || data.isDeleted} onClick={onCreateFromRecipe} className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary disabled:opacity-50"><GitFork size={18}/>내 레시피로 만들기</button>}
        {!own && <button disabled={busy} onClick={() => void run(async () => { if (!confirm('30앤트를 사용해 이 레시피를 내 보관함에 저장할까요?')) return; const { balanceRefreshed } = await forkRecipe(recipe.id); setNotice(balanceRefreshed ? '내 보관함에 저장했습니다.' : '내 보관함에 저장했습니다. 잔액을 갱신하지 못해 새로고침이 필요합니다. 다시 저장할 필요는 없습니다.'); detail.reload(); })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-primary font-bold text-sm disabled:opacity-50"><GitFork size={18}/>내 보관함에 저장</button>}
        {own && <button disabled={busy} onClick={() => { if (confirm('레시피를 삭제하시겠습니까?')) void run(async () => { await refreshPointsAfter(() => useCommunityStore.getState().deleteRecipe(Number(recipe.id))); onBack(); }); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-red-500 font-bold text-sm"><Trash2 size={18}/>삭제</button>}
        <button disabled={busy} onClick={() => void run(async () => { await navigator.clipboard.writeText(`${window.location.origin}/dashboard/community?recipeId=${recipe.id}`); setNotice('링크를 복사했습니다.'); })} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20"><Share2 size={18}/>공유</button>
      </div>
    </div></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <AntRequestError error={error} fallback="요청을 처리하지 못했습니다."/>
      {notice && <p role="status" className="rounded-2xl bg-primary/10 p-4 text-primary">{notice}</p>}
      {!own && <AntCostNotice points={user?.points} cost={30} label="내 보관함 저장"/>}
      <section className="bg-card rounded-4xl overflow-hidden border border-border shadow-sm grid md:grid-cols-2">
        <div className="aspect-video md:aspect-auto bg-muted"><AssetCover src={data.bannerUrl} title={data.title}/></div>
        <div className="p-6 sm:p-10 space-y-6">
          {data.isExpertVerified && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black"><Award size={14}/>전문가 검증</span>}
          <RecipeOrigin origin={data.forkedFrom}/><h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight wrap-break-word">{data.title}</h1><p className="text-lg text-muted-foreground font-medium leading-relaxed">{data.description}</p>
          <button disabled={!data.author?.userId} onClick={() => navigate(`/dashboard/profile/${data.author.userId}`)} className="w-full flex items-center gap-4 p-4 bg-muted/40 hover:bg-muted/80 rounded-2xl border border-border text-left"><ProfileAvatar src={data.author?.profileImageUrl || '/defaultUserProfile.png'} alt="" className="w-12 h-12 rounded-xl object-cover"/><div><p className="font-bold">{data.author?.nickname || '탈퇴한 사용자'}</p><p className="text-xs text-muted-foreground mt-1">{data.createdAt ? new Date(data.createdAt).toLocaleDateString('ko-KR') : '작성일 미등록'}</p></div></button>
          <div className="p-4 border border-border rounded-2xl text-center"><p className="text-xs font-bold text-muted-foreground mb-1">Fork 수</p><p className="text-xl font-black text-primary flex justify-center items-center gap-1"><GitFork size={18}/>{data.forkCount ?? '—'}</p></div>
        </div>
      </section>
      <section className="bg-card rounded-4xl border border-border shadow-sm overflow-hidden">
        <div role="tablist" aria-label="레시피 상세" className="px-6 sm:px-8 pt-8 border-b border-border flex gap-8">
          {(['overview', 'settings', 'reviews'] as const).map(value => (
            <button
              role="tab"
              aria-selected={tab === value}
              key={value}
              onClick={() => setTab(value)}
              className={`pb-6 text-sm font-black relative ${tab === value ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {value === 'overview' ? '개요' : value === 'settings' ? '설정 정보' : `댓글 (${data.reviewCount ?? '—'})`}
              {tab === value && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"/>}
            </button>
          ))}
        </div>
        <div className="p-6 sm:p-10">
          {tab === 'overview' && <div className="space-y-10"><div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8"><div><h2 className="text-2xl font-black mb-6">연구 배경 및 방법론</h2><p className="text-muted-foreground leading-loose whitespace-pre-line">{data.overview?.content || '작성자가 아직 상세 설명을 등록하지 않았습니다.'}</p></div>
              <div><h3 className="text-lg font-black mb-4">핵심 기능</h3>{data.overview?.features?.length ? <div className="grid sm:grid-cols-2 gap-3">{data.overview.features.map((feature,i) => <div key={i} className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border"><Check className="text-emerald-500 shrink-0" size={18}/><span className="text-sm font-bold">{feature}</span></div>)}</div> : <p className="text-sm text-muted-foreground">등록된 핵심 기능이 없습니다.</p>}</div>
            </div>
            <aside className="p-8 bg-primary/5 rounded-4xl border border-primary/10 self-start"><h3 className="text-lg font-black text-primary mb-6">추천 활용 사례</h3>{data.overview?.recommendations?.length ? <ul className="space-y-4">{data.overview.recommendations.map((value,i) => <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground"><span className="w-1.5 h-1.5 mt-2 bg-primary rounded-full shrink-0"/>{value}</li>)}</ul> : <p className="text-sm text-muted-foreground">등록된 활용 사례가 없습니다.</p>}</aside>
          </div>{data.inspectionTarget ? <InspectionPanel target={data.inspectionTarget} title={data.title} reload={detail.reload}/> : <ExpertVerificationCard status={status} onViewResults={() => setVerification('result')} />}</div>}
          {tab === 'settings' && (data.settings ? <dl className="grid md:grid-cols-2 gap-6">{Object.entries(data.settings).map(([key,value]) => <div key={key} className="flex flex-wrap justify-between items-center gap-3 p-6 bg-muted rounded-2xl border border-border"><dt className="text-sm font-black text-muted-foreground uppercase">{key}</dt><dd className="font-mono font-bold text-primary bg-card px-4 py-1.5 rounded-lg border border-border">{value ?? '—'}</dd></div>)}</dl> : <DataState title="등록된 설정 정보가 없습니다"/>) }
          {tab === 'reviews' && (
            <section className="space-y-6">
              {reviews.loading ? (
                <div className="py-8"><DataState loading /></div>
              ) : reviews.error ? (
                <div className="p-4 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-between">
                  <span>댓글을 불러오지 못했습니다.</span>
                  <button onClick={reviews.reload} className="underline text-sm font-bold">다시 시도</button>
                </div>
              ) : reviews.data?.content.length ? (
                <div className="space-y-4">
                  {reviews.data.content.map(renderReview)}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground font-medium">작성된 댓글이 없습니다.</p>
              )}

              {((reviews.data?.totalPages ?? 0) > 1) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    disabled={page === 0 || reviews.loading}
                    onClick={() => setPage(value => value - 1)}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-bold disabled:opacity-50 hover:bg-muted"
                  >
                    이전
                  </button>
                  <span className="text-sm font-bold text-muted-foreground">{page + 1} / {reviews.data?.totalPages ?? 1} 페이지</span>
                  <button
                    disabled={reviews.loading || page + 1 >= (reviews.data?.totalPages ?? 0)}
                    onClick={() => setPage(value => value + 1)}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-bold disabled:opacity-50 hover:bg-muted"
                  >
                    다음
                  </button>
                </div>
              )}

              <form
                className="space-y-4 p-6 bg-muted/40 rounded-3xl border border-border"
                onSubmit={event => {
                  event.preventDefault();
                  if (!content.trim()) return;
                  void run(async () => {
                    await api.post(`/community/recipes/${recipe.id}/reviews`, recipeReviewPayload(content, commentOnlyReviewsEnabled, 5));
                    setContent('');
                    refresh();
                  });
                }}
              >
                <div>
                  <p className="mb-2 text-sm font-bold">댓글 남기기</p>
                </div>
                <textarea
                  disabled={busy}
                  placeholder={user ? '사용 경험이나 의견을 남겨 주세요' : '로그인 후 댓글을 남길 수 있습니다'}
                  aria-label="댓글 내용"
                  value={content}
                  onChange={event => setContent(event.target.value)}
                  className="w-full min-h-28 p-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex justify-end">
                  <button
                    disabled={busy || !content.trim() || !user}
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl disabled:opacity-50 shadow-md shadow-primary/20"
                  >
                    {busy ? '등록 중…' : '댓글 등록'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </section>
    </div>
    {verification === 'result' && <VerificationResultModal assetTitle={data.title} result={data.inspectionResult} onClose={() => setVerification(null)}/>}
  </div>;
}
