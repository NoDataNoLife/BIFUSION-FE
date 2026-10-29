import { useState } from 'react';
import { Link } from 'react-router-dom';
import { augmentationFields, readAugmentationSettings } from '../../lib/augmentationRecipe';
import { augmentationRecipesEnabled } from '../../lib/backendFeatures';
import { useApiQuery } from '../../hooks/useApiQuery';
import type { ProjectResponseData } from '../../store/useProjectStore';
import { DataState } from '../dashboard/DataView';

function ProjectPicker({ recipeId }: { recipeId: number }) {
  const query = useApiQuery<ProjectResponseData>('/projects');
  const projects = [...new Map([...(query.data?.managingProjects ?? []), ...(query.data?.participatingProjects ?? [])].map(p => [p.projectId, p])).values()];
  return <section aria-label="증강할 프로젝트 선택" className="space-y-3 rounded-xl border border-border p-4"><p className="font-bold">증강할 프로젝트 선택</p>{query.loading || query.error ? <DataState loading={query.loading} error={query.error} onRetry={query.reload}/> : projects.length ? projects.map(p => <Link key={p.projectId} to={`/dashboard/projects/${p.projectId}/jobs/new/setup?recipeId=${recipeId}`} className="block rounded-lg border border-border p-3 text-primary hover:bg-muted">{p.title}</Link>) : <p>참여 중인 프로젝트가 없습니다. 프로젝트를 만든 뒤 다시 선택해 주세요.</p>}</section>;
}
export default function RecipeAugmentationSettings({ value, recipeId }: { value: unknown; recipeId: number }) {
  const [selecting, setSelecting] = useState(false);
  let settings;
  try { settings = readAugmentationSettings(value); } catch { return <DataState title="사용 가능한 증강 설정 기록이 없습니다" description="기존 설정은 보존됩니다. 실제 증강 설정을 임의 기본값으로 복원하지 않습니다."/>; }
  return <div className="space-y-5"><dl className="grid gap-3 sm:grid-cols-2">{augmentationFields.map(field => <div key={field.key} className="rounded-xl border border-border bg-muted p-4"><dt className="text-sm text-muted-foreground">{field.label}</dt><dd className="mt-2 font-bold">{settings[field.key]}</dd></div>)}</dl><><button disabled={!augmentationRecipesEnabled} onClick={() => setSelecting(!selecting)} className="rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:opacity-50">{augmentationRecipesEnabled ? '이 설정으로 증강하기' : '레시피 재사용 연동 준비 중'}</button><p className="text-sm text-muted-foreground">프로젝트와 입력 이미지는 별도로 선택합니다. 실행 전에 예상 비용을 확인합니다.</p>{augmentationRecipesEnabled && selecting && <ProjectPicker recipeId={recipeId}/>}</></div>;
}
