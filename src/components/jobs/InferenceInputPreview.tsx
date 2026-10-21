import { useState } from 'react';
import api from '../../lib/axios';
import { getJobErrorMessage } from '../../lib/jobErrors';

interface Props { fileId?: number; originalFileName?: string; sampleNumber: number }

export default function InferenceInputPreview({ fileId, originalFileName, sampleNumber }: Props) {
  const [file, setFile] = useState<{ fileName: string; presignedUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const load = async () => {
    if (!fileId || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/files/${fileId}/download`);
      const data = res.data?.data ?? res.data;
      if (typeof data?.presignedUrl !== 'string' || !data.presignedUrl) throw new Error('이미지 주소를 확인할 수 없습니다.');
      setFile({ fileName: typeof data.fileName === 'string' ? data.fileName : '', presignedUrl: data.presignedUrl });
      setImageFailed(false);
    } catch (err) {
      setError(getJobErrorMessage(err, '입력 이미지를 불러오지 못했습니다.'));
    } finally { setLoading(false); }
  };
  return (
    <div className="space-y-2 min-w-40 max-w-64">
      <p className="break-all">{originalFileName || file?.fileName || (fileId ? `File #${fileId}` : `샘플 ${sampleNumber}`)}</p>
      <p className="text-muted-foreground font-normal">입력 순서 {sampleNumber}{fileId ? ` · File #${fileId}` : ''}</p>
      {file && !imageFailed && <img src={file.presignedUrl} alt={originalFileName || file.fileName || '추론 입력'} onError={() => setImageFailed(true)} className="w-24 h-24 object-contain rounded-lg bg-muted" />}
      {fileId && <button type="button" onClick={() => void load()} disabled={loading} className="text-primary underline disabled:opacity-50">
        {loading ? '이미지 조회 중…' : file ? '이미지 주소 새로고침' : '입력 이미지 보기'}
      </button>}
      {imageFailed && <p className="text-muted-foreground font-normal">이미지를 표시할 수 없습니다. 주소를 새로고침해 주세요.</p>}
      {error && <p role="alert" className="text-red-500 font-normal">{error}</p>}
    </div>
  );
}
