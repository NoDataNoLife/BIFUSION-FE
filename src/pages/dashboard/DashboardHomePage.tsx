import { useState } from "react";
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

export default function DashboardHome() {
  const navigate = useNavigate();
  const [isVerifiedExpert] = useState(false);

  // Mock data for display
  const displayProjects = [
    {
      id: "1",
      name: "심장 질환 예측 모델",
      coverImage:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      activeJobs: 2,
      queuedJobs: 5,
      lastUpdated: "2시간 전",
    },
    {
      id: "2",
      name: "뇌 MRI 이미지 분석",
      coverImage:
        "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
      activeJobs: 1,
      queuedJobs: 3,
      lastUpdated: "5시간 전",
    },
  ];

  const storageUsage = 35;
  const storageLimit = 100;
  const monthlyAugmentations = 45;
  const augmentationLimit = 100;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            대시보드
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            안녕하세요! 오늘도 좋은 연구 되세요 👋
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
              레시피 공유 및 전문가 검수 의뢰
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
                진행 중인 프로젝트 {displayProjects.length}개
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/projects")}
              className="text-primary font-bold hover:underline transition-all text-sm cursor-pointer"
            >
              전체 보기 →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((project) => (
              <DashboardCard
                key={project.id}
                className="overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group rounded-3xl border border-border"
              >
                <div className="relative h-44">
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="font-black text-foreground mb-4 line-clamp-1 text-lg">
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-6 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span>{project.activeJobs} 실행 중</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span>{project.queuedJobs} 대기 중</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-border">
                    <span className="text-xs text-muted-foreground font-medium">
                      {project.lastUpdated}
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/projects/${project.id}`)
                      }
                      className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      프로젝트 열기
                    </button>
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        </section>

        {/* 리소스 사용량 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              리소스 사용량
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              현재 플랜의 스토리지 및 AI 데이터 증강 리소스 현황입니다.
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
                    {storageUsage}GB <span className="text-muted-foreground font-normal">/ {storageLimit}GB</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(storageUsage / storageLimit) * 100}%` }}
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
                    {monthlyAugmentations} <span className="text-muted-foreground font-normal">/ {augmentationLimit}회</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${(monthlyAugmentations / augmentationLimit) * 100}%`,
                    }}
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
                  <p className="text-2xl font-black text-primary mt-2">1,250P</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </section>
      </div>
    </div>
  );
}
