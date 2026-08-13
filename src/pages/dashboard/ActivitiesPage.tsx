import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  Users, 
  TrendingUp, 
  Bell, 
  Filter, 
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// --- Types ---
interface ActivityItem {
  id: string;
  type: 'job_completed' | 'team_activity' | 'recipe_update' | 'alert';
  user: string;
  message: string;
  time: string;
  date: string;
  avatar: string;
}

// --- Mock Data (Based on BIFUSION-PROTO) ---
const allActivities: ActivityItem[] = [
  {
    id: 'ACT-001',
    type: 'job_completed',
    user: '김성한',
    message: 'Lung Cancer 프로젝트의 증강 작업이 완료되었습니다',
    time: '2분 전',
    date: '2026-03-02',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
  },
  {
    id: 'ACT-002',
    type: 'team_activity',
    user: '조현희',
    message: 'Brain MRI 프로젝트에 새로운 레시피를 적용했습니다',
    time: '15분 전',
    date: '2026-03-02',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cho',
  },
  {
    id: 'ACT-003',
    type: 'recipe_update',
    user: '염승빈',
    message: "'High-Res Enhancement' 레시피가 업데이트되었습니다",
    time: '1시간 전',
    date: '2026-03-02',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom',
  },
  {
    id: 'ACT-004',
    type: 'job_completed',
    user: '권나현',
    message: 'ECG 데이터 증강 작업 5개가 완료되었습니다',
    time: '3시간 전',
    date: '2026-03-02',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kwon',
  },
  {
    id: 'ACT-005',
    type: 'team_activity',
    user: '김성한',
    message: 'Chest X-Ray 프로젝트를 생성했습니다',
    time: '5시간 전',
    date: '2026-03-02',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
  },
  {
    id: 'ACT-006',
    type: 'job_completed',
    user: '조현희',
    message: 'Retinal Image 프로젝트의 학습이 완료되었습니다',
    time: '8시간 전',
    date: '2026-03-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cho',
  },
  {
    id: 'ACT-007',
    type: 'recipe_update',
    user: '염승빈',
    message: "'CT Scan Upscaling' 레시피를 공유했습니다",
    time: '12시간 전',
    date: '2026-03-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom',
  },
  {
    id: 'ACT-008',
    type: 'team_activity',
    user: '권나현',
    message: 'Ultrasound 프로젝트에 팀원 3명을 초대했습니다',
    time: '1일 전',
    date: '2026-03-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kwon',
  },
];

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'job_completed' | 'team_activity' | 'recipe_update'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_completed':
        return <div className="p-2 bg-green-50 text-green-600 rounded-xl border border-green-100"><CheckCircle2 className="w-5 h-5" /></div>;
      case 'team_activity':
        return <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><Users className="w-5 h-5" /></div>;
      case 'recipe_update':
        return <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100"><TrendingUp className="w-5 h-5" /></div>;
      default:
        return <div className="p-2 bg-muted text-muted-foreground rounded-xl border border-border"><Bell className="w-5 h-5" /></div>;
    }
  };

  const filteredActivities = allActivities.filter(activity => {
    const matchesFilter = filterType === 'all' || activity.type === filterType;
    const matchesSearch = activity.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = activity.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof allActivities>);

  const formatDate = (dateStr: string) => {
    const today = '2026-03-02';
    const yesterday = '2026-03-01';
    if (dateStr === today) return '오늘';
    if (dateStr === yesterday) return '어제';
    return dateStr;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Activities</span>
          </nav>
          <h1 className="text-3xl font-black text-foreground tracking-tight italic">최근 활동 현황</h1>
          <p className="text-muted-foreground mt-1 font-medium">BIFUSION 팀의 모든 연구 및 협업 기록</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="활동 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
            filterType === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'bg-card text-muted-foreground border border-border hover:border-gray-200'
          }`}
        >
          전체 활동
        </button>
        {[
          { id: 'job_completed', label: '작업 완료' },
          { id: 'team_activity', label: '팀 협업' },
          { id: 'recipe_update', label: '레시피 업데이트' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setFilterType(type.id as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap border ${
              filterType === type.id 
                ? `bg-card text-foreground border-gray-900 shadow-md` 
                : 'bg-card text-muted-foreground border-border hover:border-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-10">
        {Object.keys(groupedActivities).length > 0 ? (
          Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date} className="relative">
              <div className="sticky top-24 z-10 mb-6">
                <span className="px-4 py-1.5 bg-gray-900 text-white text-xs font-black rounded-full shadow-lg uppercase tracking-tighter italic">
                  {formatDate(date)}
                </span>
              </div>
              
              <div className="space-y-4 ml-2 border-l-2 border-border pl-8">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="relative group bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[41px] top-8 w-4 h-4 rounded-full border-4 border-white bg-gray-200 group-hover:bg-primary transition-colors shadow-sm" />
                    
                    <div className="flex items-start gap-4">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-foreground">{activity.user}</span>
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-widest">{activity.time}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                          {activity.message}
                        </p>
                      </div>
                      <div className="flex -space-x-1 group-hover:mr-2 transition-all">
                        <img 
                          src={activity.avatar} 
                          alt={activity.user} 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center bg-card rounded-3xl border-2 border-dashed border-border">
            <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-foreground mb-1 tracking-tight">활동 기록이 없습니다</h3>
            <p className="text-muted-foreground font-medium text-sm">검색어나 필터를 변경해 보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
