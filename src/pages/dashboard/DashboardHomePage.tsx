import { Link } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuthStore } from '../../store/useAuthStore';
import type { Project, ProjectResponseData } from '../../store/useProjectStore';

function ProjectCard({ project }: { project: Project }) {
  const { data, error, loading } = useApiQuery<{ statusCounts: Record<string, number> }>(`/projects/${project.projectId}/jobs`, { size: 1 });
  return <article className="bg-card border border-border rounded-3xl overflow-hidden">
    {project.bannerImageUrl && <img src={project.bannerImageUrl} alt={project.title} className="h-40 w-full object-cover"/>}
    <div className="p-6 space-y-4"><h3 className="text-xl font-bold">{project.title}</h3><p className="text-muted-foreground">{project.description}</p>
      {loading ? <p>작업 현황 조회 중…</p> : error ? <p className="text-sm text-muted-foreground">작업 현황을 불러오지 못했습니다.</p> : <p>{data?.statusCounts?.RUNNING ?? 0} 실행 중 · {data?.statusCounts?.PENDING ?? 0} 대기 중</p>}
      <Link to={`/dashboard/projects/${project.projectId}`} className="inline-block px-5 py-2 bg-primary text-white rounded-xl">프로젝트 열기</Link>
    </div>
  </article>;
}

export default function DashboardHomePage() {
  const { user } = useAuthStore();
  const { data, error, loading, reload } = useApiQuery<ProjectResponseData>('/projects');
  const projects = [...new Map([...(data?.managingProjects ?? []), ...(data?.participatingProjects ?? [])].map((item) => [item.projectId, item])).values()];
  return <main className="p-8 max-w-7xl mx-auto space-y-8">
    <div><h1 className="text-3xl font-bold">대시보드</h1><p className="mt-2 text-muted-foreground">{user?.nickname || user?.name || '사용자'}님, 프로젝트와 연구 자산을 확인하세요.</p></div>
    <div className="flex flex-wrap gap-4"><Link to="/dashboard/projects" className="px-6 py-4 bg-primary text-white rounded-2xl">프로젝트 관리</Link><Link to="/dashboard/assets" className="px-6 py-4 bg-card border border-border rounded-2xl">내 자산</Link><Link to="/dashboard/community" className="px-6 py-4 bg-card border border-border rounded-2xl">커뮤니티</Link></div>
    <section className="space-y-5"><div className="flex justify-between"><h2 className="text-2xl font-bold">내 프로젝트</h2><button onClick={reload} disabled={loading}>새로고침</button></div>
      {loading ? <p>프로젝트를 불러오는 중…</p> : error ? <p role="alert" className="text-red-500">{error}</p> : projects.length ? <><p className="text-muted-foreground">총 {projects.length}개</p><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{projects.map((project) => <ProjectCard key={project.projectId} project={project}/>)}</div></> : <p>아직 참여한 프로젝트가 없습니다. 프로젝트 관리에서 새 프로젝트를 만들어 주세요.</p>}
    </section>
  </main>;
}