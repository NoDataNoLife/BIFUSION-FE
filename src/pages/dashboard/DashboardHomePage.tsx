import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  HardDrive,
  BadgeCheck,
  Award,
  Zap,
} from "lucide-react";
import DashboardCard from "../../components/dashboard/DashboardCard";

import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuthStore } from '../../store/useAuthStore';
import type { Project, ProjectResponseData } from '../../store/useProjectStore';
import { AssetCover, DataState } from '../../components/dashboard/DataView';

function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { data, error, loading } = useApiQuery<{ statusCounts: Record<string, number> }>(`/projects/${project.projectId}/jobs`, { size: 1 });
  return <DashboardCard className="overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all group rounded-3xl border border-border">
    <button onClick={() => navigate(`/dashboard/projects/${project.projectId}`)} aria-label={`${project.title} 열기`} className="block w-full relative h-44 overflow-hidden"><AssetCover src={project.bannerImageUrl} title={project.title} className="group-hover:scale-105 transition-transform duration-500" /></button>
    <div className="p-6"><h3 className="font-black text-foreground mb-4 line-clamp-1 text-lg">{project.title}</h3>
      <div className="min-h-6 mb-6 text-sm text-muted-foreground font-medium">
        {loading ? '작업 현황 조회 중…' : error ? '작업 현황을 불러오지 못했습니다.' : <div className="flex flex-wrap gap-6"><span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full" />{data?.statusCounts?.RUNNING ?? '—'} 실행 중</span><span className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" />{data?.statusCounts?.PENDING ?? '—'} 대기 중</span></div>}
      </div>
      <div className="flex items-center justify-between gap-3 pt-5 border-t border-border"><span className="text-xs text-muted-foreground font-medium">{project.lastActivityAt ? new Date(project.lastActivityAt).toLocaleDateString('ko-KR') : '최근 활동 없음'}</span><button onClick={() => navigate(`/dashboard/projects/${project.projectId}`)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90">프로젝트 열기</button></div>
    </div>
  </DashboardCard>;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isVerifiedExpert = user?.isExpert === true || user?.expertStatus === 'APPROVED';
  const { data, error, loading, reload } = useApiQuery<ProjectResponseData>('/projects');
  const displayProjects = [...new Map([...(data?.managingProjects ?? []), ...(data?.participatingProjects ?? [])].map(project => [project.projectId, project])).values()];

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            대시보드
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            {user?.nickname || user?.name || '연구자'}님, 오늘도 좋은 연구 되세요 👋
          </p>
        </div>
        {isVerifiedExpert && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
            <BadgeCheck className="w-5 h-5" />
            <span className="font-bold text-sm">인증된 전문가</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate("/dashboard/projects")}
          className="flex items-center gap-5 p-6 bg-linear-to-br from-primary to-amber-600 text-white rounded-3xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all text-left cursor-pointer"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <p className="font-black text-lg">새 프로젝트 생성</p>
            <p className="text-sm text-white/80 font-medium">데이터 증강 시작하기</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/dashboard/community")}
          className="flex items-center gap-5 p-6 bg-card border border-border rounded-3xl hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-left group cursor-pointer"
        >
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-black text-lg text-foreground">
              커뮤니티 둘러보기
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              레시피와 데이터셋 공유하기
            </p>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-10">
        {/* 내 프로젝트 현황 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                내 프로젝트
              </h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {loading ? '프로젝트 조회 중…' : error ? '프로젝트 조회 실패' : `참여 중인 프로젝트 ${displayProjects.length}개`}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/projects")}
              className="text-primary font-bold hover:underline transition-all text-sm cursor-pointer"
            >
              전체 보기 →
            </button>
          </div>

          {loading || error ? <DataState loading={loading} error={error} onRetry={reload} /> : displayProjects.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{displayProjects.slice(0, 6).map(project => <ProjectCard key={project.projectId} project={project} />)}</div> : <DataState title="첫 프로젝트를 시작해 보세요" description="새 프로젝트에서 데이터를 업로드하고 증강·학습 작업을 진행할 수 있어요." />}
        </section>

        {/* 리소스 사용량 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              리소스 사용량
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              스토리지와 월간 증강 사용량은 집계가 연결되면 표시됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Storage */}
            <DashboardCard className="p-7 rounded-3xl border border-border space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">스토리지</h4>
                    <p className="text-xs text-muted-foreground font-medium">클라우드 저장 공간</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">사용량</span>
                  <span className="text-sm font-black text-foreground">
                    집계 준비 중
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: 0 }}
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Monthly Augmentations */}
            <DashboardCard className="p-7 rounded-3xl border border-border space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">월간 증강</h4>
                    <p className="text-xs text-muted-foreground font-medium">생성 작업 횟수</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">진행률</span>
                  <span className="text-sm font-black text-foreground">
                    집계 준비 중
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: 0 }}
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Rewards */}
            <DashboardCard className="p-7 rounded-3xl border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <Award className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-black text-foreground">리워드 포인트</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    커뮤니티 및 검수 기여
                  </p>
                  <p className="text-2xl font-black text-primary mt-2">{user?.points != null ? `${user.points.toLocaleString()}P` : '집계 준비 중'}</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </section>
      </div>
    </div>
  );
}
