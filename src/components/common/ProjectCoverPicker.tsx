import { useEffect, useId, useState } from 'react';
import { validateImageFiles } from '../../lib/fileUpload';
import { AssetCover } from '../dashboard/DataView';
interface Props { currentUrl?: string | null; value: File | null | undefined; onChange: (file: File | null | undefined) => void; disabled?: boolean }
export default function ProjectCoverPicker({ currentUrl, value, onChange, disabled }: Props) {
  const id = useId();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!value) { setPreview(''); return; }
    const url = URL.createObjectURL(value); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);
  return <div className="space-y-3">
    <div className="h-44 overflow-hidden rounded-xl bg-muted"><AssetCover src={value ? preview : value === null ? null : currentUrl} title="프로젝트 배경 미리보기" /></div>
    <label htmlFor={id} className="block text-sm font-bold">배경 이미지 선택</label>
    <input id={id} type="file" accept="image/jpeg,image/png" disabled={disabled} className="block w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary" onChange={event => {
      const file = event.target.files?.[0]; if (!file) return;
      const validation = validateImageFiles([file], { maxCount: 1, maxTotalBytes: 5 * 1024 * 1024 });
      setError(validation.error || ''); if (validation.valid) onChange(file); event.target.value = '';
    }} />
    <p className="text-xs text-muted-foreground">JPG·PNG, 최대 5MB. 저장하면 프로젝트 목록과 대시보드에도 적용됩니다.</p>
    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    {(value || (value !== null && currentUrl)) && <button type="button" disabled={disabled} onClick={() => { onChange(null); setError(''); }} className="text-sm text-red-500">이미지 제거</button>}
    {value !== undefined && currentUrl && <button type="button" disabled={disabled} onClick={() => { onChange(undefined); setError(''); }} className="ml-4 text-sm text-muted-foreground">기존 이미지 유지</button>}
  </div>;
}
