import { useState } from 'react';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { AssetCover, DataState, Pagination } from '../../dashboard/DataView';
import type { MyRecipeListResponse } from '../../../store/useAssetStore';

export default function ForkedRecipePicker({ onSelect, onClose, busy }: { onSelect: (id: number) => void; onClose: () => void; busy: boolean }) {
  const [page, setPage] = useState(0);
  const list = useApiQuery<{ content: (MyRecipeListResponse & { isDeleted?: boolean })[]; totalPages: number; totalElements: number }>('/assets/recipes', { type: 'FORKED', page, size: 6 });
  return <section aria-label="포크한 레시피 불러오기" className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
    <div className="flex items-center justify-between gap-3"><h4 className="text-sm font-bold">포크한 레시피 선택</h4><button type="button" onClick={onClose} disabled={busy} className="rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted">닫기</button></div>
    {list.loading || list.error ? <DataState loading={list.loading} error={list.error} onRetry={list.reload}/> : !list.data?.content.length ? <DataState title="포크한 레시피가 없습니다" description="커뮤니티에서 레시피를 내 보관함에 저장한 뒤 불러올 수 있습니다."/> : <>
      <div className="grid gap-2 sm:grid-cols-2">{list.data.content.map(recipe => <button key={recipe.recipeId} type="button" disabled={busy || recipe.isDeleted} onClick={() => onSelect(recipe.recipeId)} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-primary disabled:opacity-50"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg [&>div]:min-h-0 [&_svg]:h-6 [&_svg]:w-6"><AssetCover src={recipe.bannerImageUrl} title={recipe.title}/></div><div className="min-w-0"><p className="truncate text-sm font-bold">{recipe.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{recipe.isDeleted ? '삭제된 레시피' : recipe.description}</p></div></button>)}</div>
      <Pagination page={page} totalPages={list.data.totalPages} onChange={value => { if (!busy) setPage(value); }}/>
    </>}
  </section>;
}
