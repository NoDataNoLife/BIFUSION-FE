import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { JobDetail } from '../../store/useJobStore';
import { executionFields, type ExecutionFile } from '../../lib/jobExecutionSnapshot';
import ImageWithFallback from '../common/ImageWithFallback';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';

function InputFile({ file, index }: { file: ExecutionFile; index: number }) {
  const [url, setUrl] = useState(file.imageUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <li className="space-y-2 rounded-xl border border-border p-3"><p className="break-all text-sm font-medium">{file.fileName ?? (file.fileId ? `File #${file.fileId}` : `입력 ${index + 1}`)}</p><p className="text-xs text-muted-foreground">입력 순서 {index + 1} · {file.group === 'NORMAL' ? '정상 이미지' : file.group === 'ANOMALY' ? '비정상 이미지' : '입력 이미지'}{file.deleted && ' · 삭제됨'}</p>{url && <ImageWithFallback src={url} alt={file.fileName ?? `입력 ${index + 1}`} className="h-24 w-24 rounded-lg object-contain"/>}{!file.deleted && file.fileId && <button disabled={busy} className="text-xs text-primary underline disabled:opacity-50" onClick={async () => {
    if (busy) return; setBusy(true); setError(null);
    try { const response = await api.post(`/files/${file.fileId}/download`); const data = response.data?.data; if (response.data?.success === false || typeof data?.presignedUrl !== 'string' || !/^https?:\/\//.test(data.presignedUrl)) throw new Error('이미지 주소를 확인하지 못했습니다.'); setUrl(data.presignedUrl); }
    catch (e) { setError(requestMessage(e, '입력 이미지를 조회하지 못했습니다.')); }
    finally { setBusy(false); }
  }}>{busy ? '조회 중…' : url ? '이미지 주소 새로고침' : '입력 이미지 보기'}</button>}{!url && <p className="text-xs text-muted-foreground">미리보기 정보 없음</p>}{error && <p role="alert" className="text-xs text-red-500">{error}</p>}</li>;
}

export default function JobExecutionInputs({ job }: { job: JobDetail }) {
  const snapshot = job.executionSnapshot;
  const parameters = snapshot?.parameters;
  const inputs = snapshot?.inputs;
  const knownSeed = job.executionSeed;
  const knownKShot = job.type === 'TRAINING' && typeof job.result?.kShot === 'number' && Number.isFinite(job.result.kShot) ? job.result.kShot : null;
  return <section aria-label="사용한 설정 및 입력 정보" className="space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
    <h2 className="text-xl font-bold">사용한 설정 및 입력 정보</h2>
    <p className="text-sm text-muted-foreground">서버에서 조회한 실제 실행 기록입니다. 현재 기본값으로 보정하지 않습니다.</p>
    {!snapshot && <p className="text-sm text-muted-foreground">전체 실행 설정·입력 참조 기록이 아직 제공되지 않았습니다. 확인 가능한 항목만 표시합니다.</p>}
    {job.type !== 'INFERENCE' && <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{executionFields[job.type].map(([key, label]) => {
      const value = parameters?.[key] ?? (key === 'seed' ? knownSeed : key === 'kShot' ? knownKShot : null);
      return <div key={key} className="rounded-xl bg-muted/50 p-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-2 font-semibold">{value ?? '기록 없음'}</dd></div>;
    })}</dl>}
    {job.type === 'TRAINING' && <div><p className="text-sm text-muted-foreground">학습에 사용한 증강 작업</p>{inputs?.augmentationJobId && job.projectId ? <Link className="text-primary underline" to={`/dashboard/projects/${job.projectId}/jobs/${inputs.augmentationJobId}/result`}>JOB-{inputs.augmentationJobId}</Link> : <p>기록 없음</p>}</div>}
    {job.type === 'INFERENCE' && <div><p className="text-sm text-muted-foreground">추론에 사용한 모델 ID</p><p className="font-semibold">{inputs?.modelId ?? '기록 없음'}</p></div>}
    {(job.type === 'INFERENCE' || job.type === 'AUGMENTATION') && <div className="space-y-3"><h3 className="font-bold">입력 이미지</h3>{inputs?.files == null ? <p className="text-sm text-muted-foreground">입력 이미지 기록이 제공되지 않았습니다.</p> : inputs.files.length ? <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{inputs.files.map((file, index) => <InputFile key={`${job.jobId}-${file.fileId}-${index}`} file={file} index={index}/>)}</ul> : <p className="text-sm text-muted-foreground">기록된 입력 이미지가 없습니다.</p>}</div>}
  </section>;
}
