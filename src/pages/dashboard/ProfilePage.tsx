import { useState } from 'react';
import { 
  Award, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  MessageSquare, 
  Users, 
  Database, 
  Upload, 
  Heart, 
  TrendingUp, 
  Edit2, 
  X, 
  Settings as SettingsIcon, 
  Check, 
  Briefcase, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { useAuthStore } from '../../store/useAuthStore';

interface CommunityActivity {
  id: string;
  type: 'showcase' | 'dataset' | 'qna' | 'recruiting';
  title: string;
  description?: string;
  timestamp: string;
  stats?: {
    likes?: number;
    downloads?: number;
    comments?: number;
  };
  isExpertVerified?: boolean;
}

export default function PublicProfilePage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'activities'>('projects');
  
  // Mock Stats
  const stats = [
    { label: '프로젝트', value: 12, icon: Users, color: 'text-blue-500' },
    { label: '레시피', value: 45, icon: Award, color: 'text-purple-500' },
    { label: '데이터셋', value: 8, icon: Database, color: 'text-green-500' },
    { label: '리워드', value: '12.5k', icon: TrendingUp, color: 'text-orange-500' },
  ];

  const communityActivities: CommunityActivity[] = [
    {
      id: '1',
      type: 'showcase',
      title: 'ECG Data Augmentation Pipeline',
      description: '심전도 신호 분류를 위한 전문가 검증 레시피',
      timestamp: '1일 전',
      stats: { likes: 512, comments: 24 },
      isExpertVerified: true,
    },
    {
      id: '2',
      type: 'dataset',
      title: 'ECG Heartbeat Categorization',
      description: '심전도 신호 분류를 위한 대규모 데이터셋 (109,446 files)',
      timestamp: '5일 전',
      stats: { downloads: 2145, likes: 789 },
      isExpertVerified: true,
    },
  ];

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
        
        <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-40 h-40 rounded-[3rem] overflow-hidden ring-8 ring-gray-50 shadow-inner">
              <ImageWithFallback 
                src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`} 
                alt={user?.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95">
              <Edit2 size={20} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name || '사용자'}</h1>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Award size={12} /> 전문가 인증
                </div>
              </div>
              <p className="text-gray-400 font-bold text-lg">@{user?.email?.split('@')[0] || 'username'}</p>
            </div>

            <p className="text-gray-500 font-medium leading-relaxed max-w-2xl text-lg">
              의료 AI 연구원으로서 데이터 증강 기술을 통해 정밀 진단 모델의 성능을 향상시키는 연구를 진행하고 있습니다. 
              주로 MRI와 CT 영상 데이터 처리에 집중하고 있습니다.
            </p>

            <div className="flex flex-wrap gap-6 items-center pt-4">
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                <MapPin size={18} className="text-primary" /> 서울, 대한민국
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-primary transition-colors cursor-pointer">
                <LinkIcon size={18} className="text-primary" /> bifusion.ai/researcher
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                <Calendar size={18} className="text-primary" /> 2024년 3월 가입
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95">
              <SettingsIcon size={18} /> 프로필 수정
            </button>
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-50 transition-all active:scale-95"
            >
              <LogOut size={18} /> 로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${stat.color} mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="px-10 pt-10 border-b border-gray-50 flex gap-10">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-8 text-lg font-black transition-all relative ${
              activeTab === 'projects' ? 'text-primary' : 'text-gray-300 hover:text-gray-500'
            }`}
          >
            참여 프로젝트
            {activeTab === 'projects' && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-8 text-lg font-black transition-all relative ${
              activeTab === 'activities' ? 'text-primary' : 'text-gray-300 hover:text-gray-500'
            }`}
          >
            커뮤니티 활동
            {activeTab === 'activities' && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-full" />}
          </button>
        </div>

        <div className="p-10">
          {activeTab === 'projects' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="group flex items-center gap-6 p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer">
                  <div className="w-32 h-20 rounded-2xl overflow-hidden shadow-sm">
                    <img src={`https://images.unsplash.com/photo-${i === 1 ? '1576091160550-2173dba999ef' : '1559757175-0eb30cd8c063'}?w=400&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 text-lg truncate group-hover:text-primary transition-colors">{i === 1 ? '심장 질환 예측 모델' : '뇌 MRI 이미지 분석'}</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">{i === 1 ? 'Manager' : 'Member'}</p>
                  </div>
                  <ChevronRight size={24} className="text-gray-200 group-hover:text-primary transition-colors group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {communityActivities.map((activity) => (
                <div key={activity.id} className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex items-start gap-6 hover:bg-white hover:shadow-xl transition-all group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                    activity.type === 'showcase' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'showcase' ? <Award size={28} /> : <Database size={28} />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        activity.type === 'showcase' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{activity.title}</h3>
                    </div>
                    <p className="text-gray-500 font-medium leading-relaxed">{activity.description}</p>
                    <div className="flex items-center gap-6 pt-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                      <span>{activity.timestamp}</span>
                      <div className="flex items-center gap-4">
                        {activity.stats?.likes && <span className="flex items-center gap-1.5 text-red-400"><Heart size={14} fill="currentColor" /> {activity.stats.likes}</span>}
                        {activity.stats?.comments && <span className="flex items-center gap-1.5 text-blue-400"><MessageSquare size={14} fill="currentColor" /> {activity.stats.comments}</span>}
                        {activity.stats?.downloads && <span className="flex items-center gap-1.5 text-green-400"><Upload size={14} /> {activity.stats.downloads}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
