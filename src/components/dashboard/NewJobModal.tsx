import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layers, BrainCircuit, ScanSearch, X } from 'lucide-react';

const jobOptions = [
  { path: 'jobs', title: '데이터 증강', description: '원본 데이터를 바탕으로 새로운 이미지를 생성합니다.', requirement: '원본 데이터셋과 증강 설정을 선택합니다.', icon: Layers },
  { path: 'train', title: '모델 학습', description: '증강 데이터를 사용해 분류 모델을 학습합니다.', requirement: '학습에 사용할 증강 데이터가 필요합니다.', icon: BrainCircuit },
  { path: 'inference', title: '이미지 추론', description: '학습된 모델로 이미지의 분류 결과를 확인합니다.', requirement: '학습이 완료된 모델과 입력 이미지가 필요합니다.', icon: ScanSearch },
];

export default function NewJobModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return <dialog ref={dialog} aria-labelledby="new-job-title" onCancel={event => { event.preventDefault(); onClose(); }} className="m-auto w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm">
    <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
      <h2 id="new-job-title" className="text-xl font-black">새 작업 시작</h2>
      <button type="button" onClick={onClose} aria-label="작업 선택 닫기" className="rounded-xl p-2 text-muted-foreground hover:bg-background"><X size={24} /></button>
    </div>
    <div className="p-6 sm:p-8">
      <p className="mb-6 text-muted-foreground">시작할 작업을 선택해 주세요. 각 작업의 설정 화면으로 이동합니다.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {jobOptions.map(({ path, title, description, requirement, icon: Icon }) => <Link key={path} to={`/dashboard/projects/${projectId}/${path}/new/setup`} onClick={onClose} className="group flex flex-col items-start rounded-2xl border-2 border-border bg-card p-6 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary">
          <div className="mb-4 rounded-xl bg-primary/10 p-3 text-primary"><Icon size={24} /></div>
          <h3 className="mb-2 text-lg font-bold">{title}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{description}</p>
          <p className="mt-auto text-xs text-muted-foreground">{requirement}</p>
        </Link>)}
      </div>
    </div>
  </dialog>;
}