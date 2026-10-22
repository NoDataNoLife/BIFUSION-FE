import { Database, ImageIcon, RefreshCw, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

export function AssetCover({ src, title, dataset = false, className = '' }: { src?: string | null; title: string; dataset?: boolean; className?: string }) {
  return src ? <ImageWithFallback src={src} alt={title} className={`w-full h-full object-cover ${className}`} /> : (
    <div className={`w-full h-full min-h-32 bg-linear-to-br from-primary/10 via-muted to-primary/5 flex items-center justify-center ${className}`}>
      {dataset ? <Database className="w-14 h-14 text-primary/40" aria-hidden="true" /> : <ImageIcon className="w-14 h-14 text-primary/40" aria-hidden="true" />}
      <span className="sr-only">{title} — 표지 이미지 없음</span>
    </div>
  );
}

export function DataState({ loading = false, error, title = '아직 등록된 내용이 없습니다', description, onRetry }: { loading?: boolean; error?: string | null; title?: string; description?: string; onRetry?: () => void }) {
  return <div role={error ? 'alert' : 'status'} className="py-16 px-6 text-center bg-card border border-dashed border-border rounded-3xl space-y-3">
    {loading ? <RefreshCw className="w-9 h-9 text-primary mx-auto animate-spin" /> : <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto" />}
    <p className="font-bold text-foreground">{loading ? '불러오는 중입니다' : error ? '내용을 불러오지 못했습니다' : title}</p>
    <p className="text-sm text-muted-foreground">{error || description}</p>
    {error && onRetry && <button onClick={onRetry} className="px-5 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm">다시 시도</button>}
  </div>;
}

export function Pagination({ page, totalPages = 0, totalElements, onChange }: { page: number; totalPages?: number; totalElements?: number; onChange: (page: number) => void }) {
  return <nav aria-label="페이지 이동" className="flex flex-wrap items-center justify-center gap-5 pt-4 text-sm">
    <button aria-label="이전 페이지" disabled={page === 0} onClick={() => onChange(page - 1)} className="p-3 rounded-xl border border-border bg-card disabled:opacity-30 hover:bg-muted"><ChevronLeft size={18} /></button>
    <span className="text-muted-foreground font-medium">{page + 1} / {Math.max(1, totalPages)} 페이지{totalElements != null && ` · 총 ${totalElements.toLocaleString()}개`}</span>
    <button aria-label="다음 페이지" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)} className="p-3 rounded-xl border border-border bg-card disabled:opacity-30 hover:bg-muted"><ChevronRight size={18} /></button>
  </nav>;
}
