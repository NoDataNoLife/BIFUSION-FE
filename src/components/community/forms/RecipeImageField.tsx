import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

/** Optional thumbnail uploaded with the recipe registration. */
export default function RecipeImageField({ file, onChange, disabled = false }: { file: File | null; onChange: (file: File | null) => void; disabled?: boolean }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return <section className="space-y-3 rounded-2xl border border-border bg-muted/30 p-5" aria-labelledby={`${id}-label`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h4 id={`${id}-label`} className="text-sm font-bold">대표 이미지 <span className="font-normal text-muted-foreground">(선택)</span></h4><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">선택 사항</span></div>
    <p id={`${id}-help`} className="text-xs leading-6 text-muted-foreground">PNG, JPG, WebP 이미지를 10MB 이하로 선택하세요. 등록 후에는 대표 이미지를 변경할 수 없습니다.</p>
    <input ref={input} id={id} aria-label="레시피 대표 이미지 선택" type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled} aria-describedby={`${id}-help`} aria-invalid={!!error} aria-errormessage={error ? `${id}-error` : undefined} onChange={event => {
      const selected = event.target.files?.[0];
      if (!selected) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(selected.type)) { setError('PNG, JPG, WebP 이미지를 선택해 주세요.'); event.target.value = ''; return; }
      if (selected.size > 10 * 1024 * 1024) { setError('대표 이미지는 10MB 이하로 선택해 주세요.'); event.target.value = ''; return; }
      setError(null); onChange(selected);
    }} className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-3 file:font-bold file:text-primary disabled:opacity-50"/>
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-500">{error}</p>}
    {file && url ? <div className="space-y-3"><img src={url} alt="선택한 레시피 대표 이미지 미리보기" className="max-h-52 w-full rounded-xl bg-muted object-contain"/><div className="flex items-center justify-between gap-3"><p className="min-w-0 truncate text-xs text-muted-foreground">{file.name}</p><button type="button" disabled={disabled} onClick={() => { onChange(null); setError(null); if (input.current) input.current.value = ''; }} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"><X size={14}/> 이미지 제거</button></div><p role="status" className="text-xs leading-6 text-primary">레시피를 등록할 때 이 이미지도 함께 저장됩니다.</p></div> : <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground"><ImagePlus size={18} aria-hidden="true"/>이미지가 없으면 기본 이미지 아이콘으로 표시됩니다.</div>}
  </section>;
}
