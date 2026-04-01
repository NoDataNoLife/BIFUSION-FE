import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  FolderOpen, 
  Clock, 
  TrendingUp, 
  HardDrive, 
  Activity, 
  Bell, 
  BadgeCheck, 
  Award,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [isVerifiedExpert] = useState(false);

  // Mock data for display
  const displayProjects = [
    {
      id: '1',
      name: '심장 질환 예측 모델',
      coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      activeJobs: 2,
      queuedJobs: 5,
      lastUpdated: '2시간 전',
    },
    {
      id: '2',
      name: '뇌 MRI 이미지 분석',
      coverImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
      activeJobs: 1,
      queuedJobs: 3,
      lastUpdated: '5시간 전',
    },
  ];

  const recentActivities = [
    {
      id: 'ACT-001',
      type: 'job_created',
      user: '김성한',
      message: 'Augment Job을 생성했습니다 - Lung Cancer Detection 프로젝트',
      time: '2분 전',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    },
    {
      id: 'ACT-002',
      type: 'data_upload',
      user: '조현희',
      message: 'Brain MRI 데이터셋 250개 파일을 업로드했습니다',
      time: '15분 전',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cho',
    },
  ];

  const storageUsage = 35; 
  const storageLimit = 100; 
  const monthlyAugmentations = 45;
  const augmentationLimit = 100;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_created':
        return <Plus className="w-4 h-4 text-blue-600" />;
      case 'job_modified':
        return <Activity className="w-4 h-4 text-orange-600" />;
      case 'job_completed':
        return <BadgeCheck className="w-4 h-4 text-green-600" />;
      case 'data_upload':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">대시보드</h1>
          <p className="text-gray-500 mt-1 font-medium">안녕하세요! 오늘도 좋은 연구 되세요 👋</p>
        </div>
        {isVerifiedExpert && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
            <BadgeCheck className="w-5 h-5" />
            <span className="font-bold text-sm">인증된 전문가</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button 
          onClick={() => navigate('/dashboard/projects')}
          className="flex items-center gap-5 p-6 bg-gradient-to-br from-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-left"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-lg">새 프로젝트 생성</p>
            <p className="text-sm text-white/80">데이터 증강 시작하기</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/dashboard/community')}
          className="flex items-center gap-5 p-6 bg-white border border-gray-200 rounded-2xl hover:border-primary/30 hover:shadow-xl hover:shadow-gray-200/50 transition-all text-left group"
        >
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">커뮤니티 둘러보기</p>
            <p className="text-sm text-gray-500 font-medium">레시피 공유하기</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* 내 프로젝트 현황 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">내 프로젝트</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">진행 중인 프로젝트 {displayProjects.length}개</p>
              </div>
              <button 
                onClick={() => navigate('/dashboard/projects')}
                className="text-primary font-bold hover:underline transition-all text-sm"
              >
                전체 보기 →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer group"
                >
                  <div className="relative h-44">
                    <img
                      src={project.coverImage}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 line-clamp-1 text-lg">
                      {project.name}
                    </h3>

                    <div className="flex items-center gap-6 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>{project.activeJobs} 실행 중</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span>{project.queuedJobs} 대기 중</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                      <span className="text-xs text-gray-400 font-medium">{project.lastUpdated}</span>
                      <button 
                        onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                      >
                        프로젝트 열기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 리소스 사용량 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">리소스 사용량</h2>

            <div className="space-y-8">
              {/* Storage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-primary" />
                    <span className="font-bold text-gray-900">스토리지</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    {storageUsage}GB <span className="text-gray-300 font-normal">/</span> {storageLimit}GB
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(storageUsage / storageLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Monthly Augmentations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-bold text-gray-900">월간 증강 횟수</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    {monthlyAugmentations} <span className="text-gray-300 font-normal">/</span> {augmentationLimit}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(monthlyAugmentations / augmentationLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">리워드 포인트</p>
                    <p className="text-xs text-gray-500 font-medium">커뮤니티 활동으로 적립</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-primary">1,250P</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* 최근 활동 피드 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-8 tracking-tight">최근 활동</h2>

            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-50">
                    <img src={activity.avatar} alt={activity.user} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <span className="font-bold text-sm text-gray-900">{activity.user}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{activity.message}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-1.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/dashboard/activities')}
              className="w-full mt-10 py-3 text-primary font-bold hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/10"
            >
              모든 활동 보기
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
