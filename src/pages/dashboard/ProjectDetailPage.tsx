import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Clock, 
  CheckCircle, 
  Loader, 
  XCircle, 
  Plus, 
  Search, 
  Filter,
  Users,
  Trash2,
  Mail,
  UserPlus,
  ChevronRight,
  MoreVertical,
  Activity,
  Play
} from 'lucide-react';

// --- Types ---
interface Job {
  id: string;
  type: 'Augment' | 'Train' | 'Inference';
  status: 'Queue' | 'Processing' | 'Completed' | 'Failed';
  progress?: number;
  seed: string;
  user: string;
  date: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  avatar: string;
}

// --- Mock Data (Based on BIFUSION-PROTO) ---
const mockJobs: Job[] = [
  { id: 'JOB-001', type: 'Augment', status: 'Queue', seed: '4231', user: '염승빈', date: '2026-02-09' },
  { id: 'JOB-002', type: 'Train', status: 'Queue', seed: '7892', user: '권나현', date: '2026-02-09' },
  { id: 'JOB-003', type: 'Inference', status: 'Queue', seed: '5614', user: '김성한', date: '2026-02-09' },
  { id: 'JOB-004', type: 'Augment', status: 'Processing', progress: 45, seed: '9023', user: '조현희', date: '2026-02-08' },
  { id: 'JOB-005', type: 'Train', status: 'Processing', progress: 65, seed: '3407', user: '모채현', date: '2026-02-08' },
  { id: 'JOB-007', type: 'Augment', status: 'Completed', seed: '8743', user: '권나현', date: '2026-02-05' },
  { id: 'JOB-008', type: 'Train', status: 'Completed', seed: '6159', user: '김성한', date: '2026-02-06' },
  { id: 'JOB-013', type: 'Inference', status: 'Failed', seed: '9999', user: '염승빈', date: '2026-02-10' },
];

const mockTeamMembers: TeamMember[] = [
  { id: 'M-001', name: '염승빈', email: 'seungbin@biffusion.com', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom' },
  { id: 'M-002', name: '권나현', email: 'nahyun@biffusion.com', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kwon' },
  { id: 'M-003', name: '조현희', email: 'hyunhee@biffusion.com', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cho' },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [selectedTab, setSelectedTab] = useState<'all' | 'queue' | 'processing' | 'completed' | 'failed'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'Augment' | 'Train' | 'Inference'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Statistics
  const stats = {
    queue: mockJobs.filter(j => j.status === 'Queue').length,
    processing: mockJobs.filter(j => j.status === 'Processing').length,
    completed: mockJobs.filter(j => j.status === 'Completed').length,
    failed: mockJobs.filter(j => j.status === 'Failed').length,
  };

  const filteredJobs = mockJobs.filter(j => {
    if (selectedTab !== 'all' && j.status.toLowerCase() !== selectedTab) return false;
    if (selectedTypeFilter !== 'all' && j.type !== selectedTypeFilter) return false;
    if (searchQuery && !j.id.toLowerCase().includes(searchQuery.toLowerCase()) && !j.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: Job['status'], progress?: number) => {
    switch (status) {
      case 'Queue':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100"><Clock className="w-3 h-3" />대기중</span>;
      case 'Processing':
        return (
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 self-start">
              <Loader className="w-3 h-3 animate-spin" /> {progress}% 진행중
            </span>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100"><CheckCircle className="w-3 h-3" />완료됨</span>;
      case 'Failed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100"><XCircle className="w-3 h-3" />실패</span>;
    }
  };

  const handleJobClick = (job: Job) => {
    if (job.status === 'Queue') {
      if (job.type === 'Augment') {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.id}/setup`);
      } else if (job.type === 'Train') {
        navigate(`/dashboard/projects/${projectId}/train/${job.id}/setup`);
      } else if (job.type === 'Inference') {
        navigate(`/dashboard/projects/${projectId}/inference/${job.id}/setup`);
      }
    } else if (job.status === 'Processing') {
      if (job.type === 'Augment') {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.id}/progress`);
      } else if (job.type === 'Train') {
        navigate(`/dashboard/projects/${projectId}/train/${job.id}/progress`);
      } else if (job.type === 'Inference') {
        navigate(`/dashboard/projects/${projectId}/inference/${job.id}/progress`);
      }
    } else if (job.status === 'Completed') {
      if (job.type === 'Augment') {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.id}/result`);
      } else if (job.type === 'Train') {
        navigate(`/dashboard/projects/${projectId}/train/${job.id}/result`);
      } else if (job.type === 'Inference') {
        navigate(`/dashboard/projects/${projectId}/inference/${job.id}/result`);
      }
    } else {
      alert(`${job.type} 작업의 ${job.status} 상태 페이지는 준비 중입니다.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/dashboard/projects')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                <span>Projects</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">Detail</span>
              </nav>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">심장 질환 예측 모델</h1>
            </div>
            
            <div className="ml-auto flex items-center gap-3">
              <div className="flex -space-x-2 mr-4">
                {mockTeamMembers.map((member) => (
                  <img 
                    key={member.id} 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-100 shadow-sm"
                    title={member.name}
                  />
                ))}
                <button className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors ring-1 ring-gray-100">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <Settings className="w-4 h-4" />
                설정
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <Play className="w-4 h-4 fill-current" />
                새 작업 시작
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: '대기 중', value: stats.queue, icon: Clock, color: 'yellow', id: 'queue' },
            { label: '실행 중', value: stats.processing, icon: Loader, color: 'blue', id: 'processing' },
            { label: '완료됨', value: stats.completed, icon: CheckCircle, color: 'green', id: 'completed' },
            { label: '실패', value: stats.failed, icon: XCircle, color: 'red', id: 'failed' },
          ].map((stat) => (
            <button
              key={stat.id}
              onClick={() => setSelectedTab(selectedTab === stat.id ? 'all' : (stat.id as any))}
              className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                selectedTab === stat.id 
                  ? `border-${stat.color}-500 bg-${stat.color}-50 shadow-lg shadow-${stat.color}-500/10` 
                  : 'border-white bg-white hover:border-gray-200 shadow-sm'
              }`}
            >
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 inline-block mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.id === 'processing' ? 'animate-spin' : ''}`} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
              {selectedTab === stat.id && (
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-${stat.color}-500 animate-pulse`} />
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters Header */}
          <div className="p-6 border-b border-gray-50 bg-[#F8FAFC]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <button 
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                  selectedTypeFilter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                전체 보기
              </button>
              {['Augment', 'Train', 'Inference'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                    selectedTypeFilter === type ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="작업 ID 또는 담당자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          {/* Job Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">작업 정보</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">타입</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">상태</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">담당자</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">생성일</th>
                  <th className="px-6 py-4 text-right border-b border-gray-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr 
                      key={job.id} 
                      onClick={() => handleJobClick(job)}
                      className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors cursor-pointer">{job.id}</span>
                          <span className="text-xs font-medium text-gray-400 mt-0.5 select-all">Seed: {job.seed}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                          job.type === 'Augment' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          job.type === 'Train' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {job.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(job.status, job.progress)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${job.user}`} 
                            alt={job.user} 
                            className="w-6 h-6 rounded-full bg-gray-100 ring-1 ring-gray-200 shadow-sm"
                          />
                          <span className="text-sm font-bold text-gray-700">{job.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-500 tabular-nums">
                        {job.date}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Activity className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold text-gray-500">조건에 맞는 작업이 없습니다</p>
                        <p className="text-sm mt-1">필터를 변경하거나 새로운 작업을 시작해보세요</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
