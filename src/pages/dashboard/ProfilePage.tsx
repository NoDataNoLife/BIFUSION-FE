import { useState, useRef, useEffect } from 'react';
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
  ChevronRight,
  Crown,
  AlertTriangle,
  CheckCircle,
  UserX,
  ShieldCheck,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { useAuthStore } from '../../store/useAuthStore';

// --- Types ---
interface CommunityActivity {
  id: string;
  type: 'showcase' | 'dataset' | 'qna' | 'recruiting';
  title: string;
  description?: string;
  timestamp: string;
  isPublic: boolean;
  stats?: { likes?: number; downloads?: number; comments?: number; };
  isExpertVerified?: boolean;
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'activities'>('projects');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'plan' | 'verification' | 'account'>('plan');
  
  const communityActivities: CommunityActivity[] = [
    { id: '1', type: 'showcase', title: 'ECG Data Augmentation Pipeline', description: '심전도 신호 분류를 위한 전문가 검증 레시피', timestamp: '1일 전', isPublic: true, stats: { likes: 512, comments: 24 }, isExpertVerified: true },
    { id: '2', type: 'dataset', title: 'ECG Heartbeat Categorization', description: '심전도 신호 분류를 위한 대규모 데이터셋 (109,446 files)', timestamp: '5일 전', isPublic: true, stats: { downloads: 2145, likes: 789 }, isExpertVerified: true },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* --- Left Column: Profile Card (Based on Prototype Structure) --- */}
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          {/* Avatar Section */}
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-gray-50 shadow-inner">
              <ImageWithFallback 
                src={user?.profileImage || '/defalutUserProfile.png'} 
                alt={user?.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
              <Edit2 size={18} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || '사용자'}</h1>
            <p className="text-sm text-gray-400 font-medium">@{user?.email?.split('@')[0] || 'researcher'}</p>
            <div className="pt-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                <ShieldCheck size={12} /> 전문가 인증됨
              </span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="w-full text-left space-y-2 border-t border-gray-50 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">About Me</p>
              <Edit2 size={12} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              의료 AI 연구원으로서 데이터 증강 기술을 통해 정밀 진단 모델의 성능을 향상시키는 연구를 진행하고 있습니다.
            </p>
          </div>

          {/* Account Settings Trigger */}
          <div className="w-full pt-8">
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              <SettingsIcon size={16} /> Account Settings
            </button>
          </div>
        </div>

        {/* Info List Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
            <MapPin size={18} className="text-primary" /> 서울, 대한민국
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium hover:text-primary transition-colors cursor-pointer">
            <LinkIcon size={18} className="text-primary" /> bifusion.ai/researcher
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
            <Calendar size={18} className="text-primary" /> Joined Mar 2024
          </div>
        </div>
      </div>

      {/* --- Right Column: Stats & Content (Based on Prototype Structure) --- */}
      <div className="flex-1 space-y-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '프로젝트', value: 12, icon: Briefcase, color: 'text-blue-500' },
            { label: '레시피', value: 45, icon: Award, color: 'text-purple-500' },
            { label: '데이터셋', value: 8, icon: Database, color: 'text-green-500' },
            { label: '리워드', value: '12.5k', icon: TrendingUp, color: 'text-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${stat.color} mx-auto mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Card with Tabs */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Tabs Header */}
          <div className="px-8 pt-8 border-b border-gray-50 flex gap-10">
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-6 text-base font-bold transition-all relative ${
                activeTab === 'projects' ? 'text-primary' : 'text-gray-300 hover:text-gray-500'
              }`}
            >
              My Projects
              {activeTab === 'projects' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_-4px_12px_rgba(var(--color-primary),0.3)]" />}
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`pb-6 text-base font-bold transition-all relative ${
                activeTab === 'activities' ? 'text-primary' : 'text-gray-300 hover:text-gray-500'
              }`}
            >
              Diagnosis Activities
              {activeTab === 'activities' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_-4px_12px_rgba(var(--color-primary),0.3)]" />}
            </button>
          </div>

          <div className="p-8 flex-1">
            {activeTab === 'projects' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="group flex items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                    <div className="w-24 h-16 rounded-xl overflow-hidden shadow-sm">
                      <img src={`https://images.unsplash.com/photo-${i === 1 ? '1576091160550-2173dba999ef' : '1559757175-0eb30cd8c063'}?w=400&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">{i === 1 ? '심장 질환 예측 모델' : '뇌 MRI 이미지 분석'}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{i === 1 ? 'Manager' : 'Member'}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-200 group-hover:text-primary transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {communityActivities.map((activity) => (
                  <div key={activity.id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-start gap-5 hover:bg-white hover:shadow-lg transition-all group">
                    <div className={`w-12 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                      activity.type === 'showcase' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'showcase' ? <Award size={24} /> : <Database size={24} />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          activity.type === 'showcase' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {activity.type}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{activity.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{activity.description}</p>
                      <div className="flex items-center gap-6 pt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>{activity.timestamp}</span>
                        <div className="flex items-center gap-4">
                          {activity.stats?.likes && <span className="flex items-center gap-1 text-red-400"><Heart size={12} fill="currentColor" /> {activity.stats.likes}</span>}
                          {activity.stats?.downloads && <span className="flex items-center gap-1 text-green-400"><Upload size={12} /> {activity.stats.downloads}</span>}
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

      {/* --- Settings Modal (Plan, Verification, Account) --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Account Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-2.5 hover:bg-white rounded-xl transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-8 border-b border-gray-100 flex gap-8 bg-[#F8FAFC]">
              {[
                { id: 'plan', label: 'Plan', icon: Crown },
                { id: 'verification', label: 'Verify', icon: ShieldCheck },
                { id: 'account', label: 'Security', icon: UserX },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id as any)}
                  className={`pb-4 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all relative ${
                    settingsTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {settingsTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {settingsTab === 'plan' && (
                <div className="space-y-8">
                  <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">현재 플랜: Basic</h3>
                    <div className="space-y-3">
                      {['100 Data Augmentation / mo', 'Max 3 Research Projects', 'Community Recipe Access'].map((f, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                          <Check size={16} className="text-primary" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Upgrade to PRO — $19/mo</button>
                </div>
              )}

              {settingsTab === 'account' && (
                <div className="space-y-8 text-center pt-4">
                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 inline-block mx-auto min-w-[250px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Login Email</p>
                    <p className="text-lg font-bold text-gray-900">{user?.email}</p>
                  </div>
                  <div className="pt-6">
                    <button 
                      onClick={() => { logout(); setShowSettingsModal(false); }}
                      className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut size={20} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
