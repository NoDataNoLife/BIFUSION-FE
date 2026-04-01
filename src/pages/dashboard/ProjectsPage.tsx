import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Crown, 
  Users, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  FolderKanban, 
  X, 
  Upload, 
  Mail, 
  ChevronDown 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  teamMembers: { name: string; avatar: string }[];
  status: 'Running' | 'Completed' | 'Paused';
  role: 'manager' | 'member';
  isFavorite: boolean;
  lastActivity: string;
}

const initialProjects: Project[] = [
  {
    id: '1',
    title: '심장 질환 예측 모델',
    description: 'ECG 데이터를 활용한 심장 질환 조기 진단 AI 모델 개발',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    teamMembers: [
      { name: '염승빈', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom' },
      { name: '권나현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kwon' },
      { name: '김성한', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim' },
    ],
    status: 'Running',
    role: 'manager',
    isFavorite: true,
    lastActivity: '2시간 전',
  },
  {
    id: '2',
    title: '뇌 MRI 이미지 분석',
    description: '알츠하이머 질환 조기 발견을 위한 뇌 MRI 이미지 분석 시스템',
    coverImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
    teamMembers: [
      { name: '조현희', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cho' },
      { name: '모채현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mo' },
    ],
    status: 'Running',
    role: 'member',
    isFavorite: false,
    lastActivity: '5시간 전',
  },
  {
    id: '3',
    title: '합성 환자 데이터 생성',
    description: 'GAN을 활용한 개인정보 보호형 합성 환자 데이터 생성 연구',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    teamMembers: [
      { name: '염승빈', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom' },
      { name: '김성한', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim' },
    ],
    status: 'Completed',
    role: 'manager',
    isFavorite: true,
    lastActivity: '2주 전',
  },
];

export default function ProjectListPage() {
  const navigate = useNavigate();
  const { user: userInfo } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    coverImage: null as File | null,
    teamMembers: [{ email: '', role: 'Member' }],
  });

  const managerScrollRef = useRef<HTMLDivElement>(null);
  const memberScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleFavorite = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const createdProject: Project = {
      id: `${Date.now()}`,
      title: newProject.name,
      description: newProject.description,
      coverImage: newProject.coverImage ? URL.createObjectURL(newProject.coverImage) : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      teamMembers: [
        { 
          name: userInfo?.name || '사용자', 
          avatar: userInfo?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo?.name || 'user'}` 
        },
      ],
      status: 'Running',
      role: 'manager',
      isFavorite: false,
      lastActivity: '방금 전',
    };
    setProjects([createdProject, ...projects]);
    setIsModalOpen(false);
    setNewProject({
      name: '',
      description: '',
      coverImage: null,
      teamMembers: [{ email: '', role: 'Member' }],
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">내 프로젝트</h1>
          <p className="text-gray-500 mt-1 font-medium">총 {projects.length}개의 연구 프로젝트</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트 검색..."
              className="w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all whitespace-nowrap active:scale-95"
          >
            <Plus className="w-5 h-5" />
            새 프로젝트
          </button>
        </div>
      </div>

      {/* Managed Projects Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-gray-900">관리중인 프로젝트</h3>
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {projects.filter(p => p.role === 'manager' && p.title.toLowerCase().includes(searchQuery.toLowerCase())).length}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(managerScrollRef, 'left')} className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <button onClick={() => scroll(managerScrollRef, 'right')} className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>
        
        <div 
          ref={managerScrollRef}
          className="flex gap-6 overflow-x-auto pb-6 no-scrollbar"
        >
          {projects
            .filter(p => p.role === 'manager' && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((project) => (
              <ProjectCard key={project.id} project={project} onToggleFavorite={toggleFavorite} onOpen={() => navigate(`/dashboard/projects/${project.id}`)} />
            ))}
          {projects.filter(p => p.role === 'manager').length === 0 && <EmptyState icon={<FolderKanban />} title="관리중인 프로젝트가 없습니다" />}
        </div>
      </section>

      {/* Participating Projects Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-900">참여중인 프로젝트</h3>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-full">
              {projects.filter(p => p.role === 'member' && p.title.toLowerCase().includes(searchQuery.toLowerCase())).length}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll(memberScrollRef, 'left')} className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <button onClick={() => scroll(memberScrollRef, 'right')} className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>
        
        <div 
          ref={memberScrollRef}
          className="flex gap-6 overflow-x-auto pb-6 no-scrollbar"
        >
          {projects
            .filter(p => p.role === 'member' && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((project) => (
              <ProjectCard key={project.id} project={project} onToggleFavorite={toggleFavorite} onOpen={() => navigate(`/dashboard/projects/${project.id}`)} />
            ))}
        </div>
      </section>

      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCreateProject}
          newProject={newProject}
          setNewProject={setNewProject}
        />
      )}
    </div>
  );
}

// Sub-components
function ProjectCard({ project, onToggleFavorite, onOpen }: { project: Project, onToggleFavorite: any, onOpen: any }) {
  return (
    <div
      onClick={onOpen}
      className="flex-shrink-0 w-85 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all cursor-pointer relative group"
    >
      <button
        onClick={(e) => onToggleFavorite(project.id, e)}
        className="absolute top-4 left-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transition-all"
      >
        <Star className={`w-5 h-5 ${project.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      </button>
      
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-2.5 py-1 ${project.role === 'manager' ? 'bg-primary' : 'bg-blue-500'} text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-lg`}>
          {project.role === 'manager' ? <Crown className="w-3 h-3" /> : <Users className="w-3 h-3" />}
          {project.role.toUpperCase()}
        </span>
      </div>

      <div className="h-48 overflow-hidden bg-gray-50">
        <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-2 tracking-tight group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">{project.description}</p>
        
        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 3).map((member, idx) => (
              <img key={idx} src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-100" />
            ))}
            {project.teamMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 ring-1 ring-gray-100">
                +{project.teamMembers.length - 3}
              </div>
            )}
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{project.lastActivity}</span>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({ onClose, onSubmit, newProject, setNewProject }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">새 프로젝트 생성</h3>
            <p className="text-sm text-gray-500 font-medium">새로운 의료 AI 연구를 시작하세요</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-8 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 underline decoration-primary/30 decoration-4">프로젝트 명칭</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-medium"
                placeholder="예: 심장 질환 분석 프로젝트"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 underline decoration-primary/30 decoration-4">연구 설명</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-medium resize-none"
                rows={3}
                placeholder="프로젝트의 목적과 연구 내용을 입력하세요"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all">취소</button>
            <button type="submit" className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">프로젝트 생성하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ icon, title }: { icon: any, title: string }) {
  return (
    <div className="w-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-400">새로운 프로젝트를 추가해 연구를 시작하세요</p>
    </div>
  );
}
