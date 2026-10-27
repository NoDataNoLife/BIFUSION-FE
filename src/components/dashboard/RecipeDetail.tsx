import { AntCostNotice, AntRequestError } from '../common/AntActionNotice';
import { forkRecipe, refreshPointsAfter } from '../../lib/pointActions';
import RecipeOrigin from '../community/RecipeOrigin';
import InspectionPanel from '../community/InspectionPanel';
import ProfileAvatar from '../common/ProfileAvatar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitFork, Share2, Trash2, Award, Check } from 'lucide-react';
import { AssetCover, DataState } from './DataView';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuthStore } from '../../store/useAuthStore';
import { useCommunityStore, type RecipeDetailResponse } from '../../store/useCommunityStore';
import VerificationResultModal from '../community/modals/VerificationResultModal';
import ExpertVerificationCard, { type VerificationStatus } from '../community/ExpertVerificationCard';

export interface Recipe { id: string; title?: string }
interface Props { recipe: Recipe; onBack: () => void; isAuthor?: boolean; onDelete?: () => void | Promise<void>; onCreateFromRecipe?: () => void }
export default function RecipeDetail({ recipe, onBack, onCreateFromRecipe }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const detail = useApiQuery<RecipeDetailResponse>(`/community/recipes/${recipe.id}`);
  const [tab, setTab] = useState<'overview' | 'settings'>('overview');
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
          <RecipeOrigin origin={data.forkedFrom}/><h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight break-words">{data.title}</h1><p className="text-lg text-muted-foreground font-medium leading-relaxed">{data.description}</p>
          <button disabled={!data.author?.userId} onClick={() => navigate(`/dashboard/profile/${data.author.userId}`)} className="w-full flex items-center gap-4 p-4 bg-muted/40 hover:bg-muted/80 rounded-2xl border border-border text-left"><ProfileAvatar src={data.author?.profileImageUrl || '/defaultUserProfile.png'} alt="" className="w-12 h-12 rounded-xl object-cover"/><div><p className="font-bold">{data.author?.nickname || '탈퇴한 사용자'}</p><p className="text-xs text-muted-foreground mt-1">{data.createdAt ? new Date(data.createdAt).toLocaleDateString('ko-KR') : '작성일 미등록'}</p></div></button>
          <div className="p-4 border border-border rounded-2xl text-center"><p className="text-xs font-bold text-muted-foreground mb-1">Fork 수</p><p className="text-xl font-black text-primary flex justify-center items-center gap-1"><GitFork size={18}/>{data.forkCount ?? '—'}</p></div>
        </div>
      </section>
      <section className="bg-card rounded-4xl border border-border shadow-sm overflow-hidden">
        <div role="tablist" aria-label="레시피 상세" className="px-6 sm:px-8 pt-8 border-b border-border flex gap-8">{(['overview', 'settings'] as const).map(value => <button role="tab" aria-selected={tab === value} key={value} onClick={() => setTab(value)} className={`pb-6 text-sm font-black relative ${tab === value ? 'text-primary' : 'text-muted-foreground'}`}>{value === 'overview' ? '개요' : '설정 정보'}{tab === value && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"/>}</button>)}</div>
        <div className="p-6 sm:p-10">
          {tab === 'overview' && <div className="space-y-10"><div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8"><div><h2 className="text-2xl font-black mb-6">연구 배경 및 방법론</h2><p className="text-muted-foreground leading-loose whitespace-pre-line">{data.overview?.content || '작성자가 아직 상세 설명을 등록하지 않았습니다.'}</p></div>
              <div><h3 className="text-lg font-black mb-4">핵심 기능</h3>{data.overview?.features?.length ? <div className="grid sm:grid-cols-2 gap-3">{data.overview.features.map((feature,i) => <div key={i} className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border"><Check className="text-emerald-500 shrink-0" size={18}/><span className="text-sm font-bold">{feature}</span></div>)}</div> : <p className="text-sm text-muted-foreground">등록된 핵심 기능이 없습니다.</p>}</div>
            </div>
            <aside className="p-8 bg-primary/5 rounded-4xl border border-primary/10 self-start"><h3 className="text-lg font-black text-primary mb-6">추천 활용 사례</h3>{data.overview?.recommendations?.length ? <ul className="space-y-4">{data.overview.recommendations.map((value,i) => <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground"><span className="w-1.5 h-1.5 mt-2 bg-primary rounded-full shrink-0"/>{value}</li>)}</ul> : <p className="text-sm text-muted-foreground">등록된 활용 사례가 없습니다.</p>}</aside>
          </div>{data.inspectionTarget ? <InspectionPanel target={data.inspectionTarget} title={data.title} reload={detail.reload}/> : <ExpertVerificationCard status={status} onViewResults={() => setVerification('result')} />}</div>}
          {tab === 'settings' && (data.settings ? <dl className="grid md:grid-cols-2 gap-6">{Object.entries(data.settings).map(([key,value]) => <div key={key} className="flex flex-wrap justify-between items-center gap-3 p-6 bg-muted rounded-2xl border border-border"><dt className="text-sm font-black text-muted-foreground uppercase">{key}</dt><dd className="font-mono font-bold text-primary bg-card px-4 py-1.5 rounded-lg border border-border">{value ?? '—'}</dd></div>)}</dl> : <DataState title="등록된 설정 정보가 없습니다"/>) }
        </div>
      </section>
    </div>
    {verification === 'result' && <VerificationResultModal assetTitle={data.title} result={data.inspectionResult} onClose={() => setVerification(null)}/>}
  </div>;
}
