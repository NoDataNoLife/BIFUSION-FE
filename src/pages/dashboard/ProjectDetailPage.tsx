import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Clock,
  CheckCircle,
  Loader,
  XCircle,
  Plus,
  Search,
  X,
  Trash2,
  UserPlus,
  ChevronRight,
  MoreVertical,
  Activity,
  Play,
  Check,
} from "lucide-react";
import { useProjectStore } from "../../store/useProjectStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect } from "react";

// --- Types ---
interface Job {
  id: string;
  type: "Augment" | "Train" | "Inference";
  status: "Queue" | "Processing" | "Completed" | "Failed";
  progress?: number;
  seed: string;
  user: string;
  date: string;
}


type StatusTab = "all" | "queue" | "processing" | "completed" | "failed";
type JobTypeFilter = "all" | "Augment" | "Train" | "Inference";

// --- Mock Data (Based on BIFUSION-PROTO) ---
const mockJobs: Job[] = [
  {
    id: "JOB-001",
    type: "Augment",
    status: "Queue",
    seed: "4231",
    user: "염승빈",
    date: "2026-02-09",
  },
  {
    id: "JOB-002",
    type: "Train",
    status: "Queue",
    seed: "7892",
    user: "권나현",
    date: "2026-02-09",
  },
  {
    id: "JOB-003",
    type: "Inference",
    status: "Queue",
    seed: "5614",
    user: "김성한",
    date: "2026-02-09",
  },
  {
    id: "JOB-004",
    type: "Augment",
    status: "Processing",
    progress: 45,
    seed: "9023",
    user: "조현희",
    date: "2026-02-08",
  },
  {
    id: "JOB-005",
    type: "Train",
    status: "Processing",
    progress: 65,
    seed: "3407",
    user: "모채현",
    date: "2026-02-08",
  },
  {
    id: "JOB-007",
    type: "Augment",
    status: "Completed",
    seed: "8743",
    user: "권나현",
    date: "2026-02-05",
  },
  {
    id: "JOB-008",
    type: "Train",
    status: "Completed",
    seed: "6159",
    user: "김성한",
    date: "2026-02-06",
  },
  {
    id: "JOB-013",
    type: "Inference",
    status: "Failed",
    seed: "9999",
    user: "염승빈",
    date: "2026-02-10",
  },
];



export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { currentProject, fetchProjectDetail, updateProjectInfo, inviteMember, removeMember, updateMemberRole } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(projectId);
    }
  }, [projectId, fetchProjectDetail]);

  const [selectedTab, setSelectedTab] = useState<StatusTab>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] =
    useState<JobTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    if (currentProject) {
      setEditTitle(currentProject.title || "");
      setEditDescription(currentProject.description || "");
      setCoverImage(currentProject.bannerImageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80");
    }
  }, [currentProject]);

  // Statistics
  const stats = {
    queue: mockJobs.filter((j) => j.status === "Queue").length,
    processing: mockJobs.filter((j) => j.status === "Processing").length,
    completed: mockJobs.filter((j) => j.status === "Completed").length,
    failed: mockJobs.filter((j) => j.status === "Failed").length,
  };

  const filteredJobs = mockJobs.filter((j) => {
    if (selectedTab !== "all" && j.status.toLowerCase() !== selectedTab)
      return false;
    if (selectedTypeFilter !== "all" && j.type !== selectedTypeFilter)
      return false;
    if (
      searchQuery &&
      !j.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !j.user.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const statCards: Array<{
    label: string;
    value: number;
    icon: typeof Clock;
    color: "yellow" | "blue" | "green" | "red";
    id: Exclude<StatusTab, "all">;
  }> = [
    {
      label: "대기 중",
      value: stats.queue,
      icon: Clock,
      color: "yellow",
      id: "queue",
    },
    {
      label: "실행 중",
      value: stats.processing,
      icon: Loader,
      color: "blue",
      id: "processing",
    },
    {
      label: "완료됨",
      value: stats.completed,
      icon: CheckCircle,
      color: "green",
      id: "completed",
    },
    {
      label: "실패",
      value: stats.failed,
      icon: XCircle,
      color: "red",
      id: "failed",
    },
  ];

  const jobTypeFilters: Exclude<JobTypeFilter, "all">[] = [
    "Augment",
    "Train",
    "Inference",
  ];


  const handleSaveSettings = async () => {
    if (!projectId) return;
    const success = await updateProjectInfo(projectId, {
      title: editTitle,
      description: editDescription,
      bannerImageUrl: coverImage,
    });
    if (success) {
      setIsSettingsOpen(false);
    } else {
      alert("설정 저장에 실패했습니다.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !projectId) return;
    
    const success = await inviteMember(projectId, newMemberEmail);
    if (success) {
      setNewMemberEmail("");
    } else {
      alert("초대에 실패했습니다.");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!projectId) return;
    if (window.confirm("정말 이 멤버를 삭제하시겠습니까?")) {
      const success = await removeMember(projectId, userId);
      if (!success) {
        alert("멤버 삭제에 실패했습니다.");
      }
    }
  };

  const handleRoleChange = async (userId: number, role: "MANAGER" | "MEMBER") => {
    if (!projectId) return;
    const success = await updateMemberRole(projectId, userId, role);
    if (success) {
      setOpenDropdownId(null);
    } else {
      alert("권한 변경에 실패했습니다.");
    }
  };

  const getStatusBadge = (status: Job["status"], progress?: number) => {
    switch (status) {
      case "Queue":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100">
            <Clock className="w-3 h-3" />
            대기중
          </span>
        );
      case "Processing":
        return (
          <div className="flex flex-col gap-1.5 min-w-30">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 self-start">
              <Loader className="w-3 h-3 animate-spin" /> {progress}% 진행중
            </span>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
            <CheckCircle className="w-3 h-3" />
            완료됨
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
            <XCircle className="w-3 h-3" />
            실패
          </span>
        );
    }
  };

  const handleJobClick = (job: Job) => {
    if (job.status === "Queue") {
      if (job.type === "Augment") {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.id}/setup`);
      } else if (job.type === "Train") {
        navigate(`/dashboard/projects/${projectId}/train/${job.id}/setup`);
      } else if (job.type === "Inference") {
        navigate(`/dashboard/projects/${projectId}/inference/${job.id}/setup`);
      }
    } else if (job.status === "Processing") {
      if (job.type === "Augment") {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.id}/progress`);
      } else if (job.type === "Train") {
        navigate(`/dashboard/projects/${projectId}/train/${job.id}/progress`);
      } else if (job.type === "Inference") {
        navigate(
          `/dashboard/projects/${projectId}/inference/${job.id}/progress`,
        );
      }
    } else if (job.status === "Completed") {
      if (job.type === "Augment") {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.id}/result`);
      } else if (job.type === "Train") {
        navigate(`/dashboard/projects/${projectId}/train/${job.id}/result`);
      } else if (job.type === "Inference") {
        navigate(`/dashboard/projects/${projectId}/inference/${job.id}/result`);
      }
    } else {
      alert(`${job.type} 작업의 ${job.status} 상태 페이지는 준비 중입니다.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/projects")}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                <span>Projects</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">Detail</span>
              </nav>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {currentProject?.title || "로딩 중..."}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex -space-x-2 mr-4">
                {currentProject?.members?.map((member) => (
                  <img
                    key={member.userId}
                    src={member.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                    alt={member.nickname || "사용자"}
                    className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-100 shadow-sm"
                    title={member.nickname || "사용자"}
                  />
                ))}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors ring-1 ring-gray-100"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-bold text-sm text-foreground hover:bg-muted transition-all shadow-sm"
              >
                <Settings className="w-4 h-4" />
                설정
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <Play className="w-4 h-4 fill-current" />새 작업 시작
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Cover Image */}
        <section className="relative h-64 md:h-72 rounded-4xl overflow-hidden border border-border shadow-sm">
          <img
            src={coverImage}
            alt={currentProject?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {currentProject?.title}
              </h2>
              <p className="text-sm text-white/90 mt-2 max-w-2xl">
                {currentProject?.description}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <button
              key={stat.id}
              onClick={() =>
                setSelectedTab(selectedTab === stat.id ? "all" : stat.id)
              }
              className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                selectedTab === stat.id
                  ? `border-${stat.color}-500 bg-${stat.color}-50 shadow-lg shadow-${stat.color}-500/10`
                  : "border-white bg-card hover:border-gray-200 shadow-sm"
              }`}
            >
              <div
                className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 inline-block mb-4 group-hover:scale-110 transition-transform`}
              >
                <stat.icon
                  className={`w-6 h-6 ${stat.id === "processing" ? "animate-spin" : ""}`}
                />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-foreground mt-1">
                {stat.value}
              </p>
              {selectedTab === stat.id && (
                <div
                  className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-${stat.color}-500 animate-pulse`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          {/* Filters Header */}
          <div className="p-6 border-b border-gray-50 bg-[#F8FAFC]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <button
                onClick={() => setSelectedTypeFilter("all")}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                  selectedTypeFilter === "all"
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                전체 보기
              </button>
              {jobTypeFilters.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                    selectedTypeFilter === type
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="작업 ID 또는 담당자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          {/* Job Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    작업 정보
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    타입
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    상태
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    담당자
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                    생성일
                  </th>
                  <th className="px-6 py-4 text-right border-b border-border"></th>
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
                          <span className="font-bold text-foreground tracking-tight group-hover:text-primary transition-colors cursor-pointer">
                            {job.id}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground mt-0.5 select-all">
                            Seed: {job.seed}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                            job.type === "Augment"
                              ? "bg-purple-50 text-purple-600 border-purple-100"
                              : job.type === "Train"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-orange-50 text-orange-600 border-orange-100"
                          }`}
                        >
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
                            className="w-6 h-6 rounded-full bg-muted ring-1 ring-gray-200 shadow-sm"
                          />
                          <span className="text-sm font-bold text-foreground">
                            {job.user}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-muted-foreground tabular-nums">
                        {job.date}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-muted-foreground hover:text-gray-900 hover:bg-muted rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Activity className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold text-muted-foreground">
                          조건에 맞는 작업이 없습니다
                        </p>
                        <p className="text-sm mt-1">
                          필터를 변경하거나 새로운 작업을 시작해보세요
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-foreground">
                프로젝트 설정
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Basic Info Section */}
              <section>
                <h4 className="text-lg font-bold text-foreground mb-4">
                  기본 정보
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">프로젝트 제목</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">프로젝트 설명</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Cover Image Section */}
              <section>
                <h4 className="text-lg font-bold text-foreground mb-4">
                  배경 이미지
                </h4>
                <div className="space-y-4">
                  <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="block">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="배경 이미지 URL을 입력하세요"
                        className="w-full bg-transparent text-center focus:outline-none text-sm text-muted-foreground"
                      />
                    </div>
                  </label>
                </div>
              </section>

              {/* Team Members Section */}
              <section>
                <h4 className="text-lg font-bold text-foreground mb-4">
                  멤버 관리
                </h4>

                <form onSubmit={handleAddMember} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="이메일 주소 입력"
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      초대
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {currentProject?.members?.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                          alt={member.nickname || "사용자"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            {member.nickname || "이름 없음"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email || "이메일 없음"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 relative">
                        {/* 권한 변경 Dropdown Container */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (member.userId !== user?.userId) {
                                setOpenDropdownId(openDropdownId === member.userId ? null : member.userId);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              member.userId === user?.userId ? 'cursor-default' : 'cursor-pointer'
                            } ${
                              member.role === "MANAGER"
                                ? `bg-primary/10 text-primary ${member.userId !== user?.userId ? 'hover:bg-primary/20' : ''}`
                                : `bg-blue-100 text-blue-700 ${member.userId !== user?.userId ? 'hover:bg-blue-200' : ''}`
                            }`}
                          >
                            {member.role === "MANAGER" ? "Manager" : "Member"}
                          </button>
                          
                          {openDropdownId === member.userId && member.userId !== user?.userId && (
                            <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 py-1 overflow-hidden">
                              <button
                                onClick={() => handleRoleChange(member.userId, "MANAGER")}
                                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors flex items-center justify-between"
                              >
                                Manager
                                {member.role === "MANAGER" && <Check className="w-4 h-4 text-primary" />}
                              </button>
                              <button
                                onClick={() => handleRoleChange(member.userId, "MEMBER")}
                                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors flex items-center justify-between"
                              >
                                Member
                                {member.role === "MEMBER" && <Check className="w-4 h-4 text-primary" />}
                              </button>
                            </div>
                          )}
                        </div>

                        {member.role !== "MANAGER" && member.userId !== user?.userId && (
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
