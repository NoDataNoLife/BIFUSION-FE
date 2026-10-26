import React, { useState, useEffect } from "react";
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
  RotateCcw,
} from "lucide-react";
import { useProjectStore } from "../../store/useProjectStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useProjectJobs, type ProjectJobItem } from "../../hooks/useProjectJobs";
import ProfileAvatar from "../../components/common/ProfileAvatar";

import { invitationRolesEnabled } from "../../lib/backendFeatures";
import { AssetCover } from "../../components/dashboard/DataView";

type StatusTab = "all" | "queue" | "processing" | "completed" | "failed" | "cancelled";
type JobTypeFilter = "all" | "Augment" | "Train" | "Inference";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { currentProject, fetchProjectDetail, updateProjectInfo, inviteMember, removeMember, updateMemberRole } = useProjectStore();

  const [selectedTab, setSelectedTab] = useState<StatusTab>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<JobTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const type = { all: undefined, Augment: 'AUGMENTATION', Train: 'TRAINING', Inference: 'INFERENCE' }[selectedTypeFilter];
  const status = { all: undefined, queue: 'PENDING', processing: 'RUNNING', completed: 'SUCCESS', failed: 'FAILED', cancelled: 'CANCELLED' }[selectedTab];
  const { jobs, statusCounts, loadingJobs, jobsError, hasNext, fetchJobs, loadMoreJobs } = useProjectJobs(projectId, type, status, searchQuery);

  useEffect(() => {
    if (projectId) void fetchProjectDetail(projectId);
  }, [projectId, fetchProjectDetail]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [invitationRole, setInvitationRole] = useState<"MEMBER" | "MANAGER">("MEMBER");
  const canInviteManager = currentProject?.projectId === Number(projectId) && currentProject.members?.some(member => member.userId === user?.userId && member.role === 'MANAGER');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    if (currentProject) {
      setEditTitle(currentProject.title || "");
      setEditDescription(currentProject.description || "");
      setCoverImage(currentProject.bannerImageUrl || "");
    }
  }, [currentProject]);

  const stats = {
    queue: statusCounts.PENDING ?? 0,
    processing: statusCounts.RUNNING ?? 0,
    completed: statusCounts.SUCCESS ?? 0,
    failed: statusCounts.FAILED ?? 0,
    cancelled: statusCounts.CANCELLED ?? 0,
  };
  const filteredJobs = jobs;

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
    {
      label: "취소됨",
      value: stats.cancelled,
      icon: XCircle,
      color: "yellow",
      id: "cancelled",
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
      bannerImageUrl: coverImage.trim() || null,
    });
    if (success) {
      setIsSettingsOpen(false);
    } else {
      alert("설정 저장에 실패했습니다.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !projectId || inviting) return;
    
    if (invitationRole === 'MANAGER' && (!canInviteManager || !invitationRolesEnabled)) {
      setInviteFeedback({ ok: false, text: '관리자 권한으로 초대할 수 없습니다. 멤버 권한을 선택해 주세요.' }); return;
    }
    setInviting(true);
    setInviteFeedback(null);
    try {
      const success = await inviteMember(projectId, newMemberEmail.trim(), invitationRole);
      setInviteFeedback({ ok: success, text: success ? `${invitationRole === 'MANAGER' ? '관리자' : '멤버'} 권한으로 초대를 보냈습니다. 상대방이 수락하면 멤버 목록에 표시됩니다.` : (useProjectStore.getState().error || '초대를 보내지 못했습니다. 다시 시도해 주세요.') });
      if (success) setNewMemberEmail('');
    } finally { setInviting(false); }
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

  const getStatusBadge = (status: string, currentStep?: string | null) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold border border-yellow-500/20">
            <Clock className="w-3 h-3" />
            대기중
          </span>
        );
      case "STARTED":
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
            <Loader className="w-3 h-3 animate-spin" />
            {currentStep || "진행중"}
          </span>
        );
      case "SUCCESS":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            완료됨
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20">
            <XCircle className="w-3 h-3" />
            실패
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-500/20">
            <XCircle className="w-3 h-3" />
            취소됨
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border">
            {status}
          </span>
        );
    }
  };

  const handleJobClick = (job: ProjectJobItem) => {
    const t = (job.type || "").toUpperCase();
    const s = (job.status || "").toUpperCase();
    const isCompleted = s === "SUCCESS" || s === "COMPLETED";

    if (t.includes("AUGMENT")) {
      if (isCompleted) {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.jobId}/result`);
      } else {
        navigate(`/dashboard/projects/${projectId}/jobs/${job.jobId}/progress`);
      }
    } else if (t.includes("TRAIN")) {
      if (isCompleted) {
        navigate(`/dashboard/projects/${projectId}/train/${job.jobId}/result`);
      } else {
        navigate(`/dashboard/projects/${projectId}/train/${job.jobId}/progress`);
      }
    } else if (t.includes("INFERENCE")) {
      if (isCompleted) {
        navigate(`/dashboard/projects/${projectId}/inference/${job.jobId}/result`);
      } else {
        navigate(`/dashboard/projects/${projectId}/inference/${job.jobId}/progress`);
      }
    } else {
      alert(`${job.type} 작업의 상세 페이지를 찾을 수 없습니다.`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/projects")}
              className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
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
                  <ProfileAvatar
                    key={member.userId}
                    src={member.profileImageUrl || (member.userId === user?.userId ? user?.profileImage || user?.profileImageUrl : null)}
                    alt={member.nickname || "사용자"}
                    className="w-8 h-8 rounded-full border-2 border-border ring-1 ring-border shadow-sm"
                    title={member.nickname || "사용자"}
                  />
                ))}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-8 h-8 rounded-full border-2 border-border bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors ring-1 ring-border"
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
              <button
                onClick={() => navigate(`/dashboard/projects/${projectId}/jobs/new/setup`)}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />새 작업 시작
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Cover Image */}
        <section className="relative h-64 md:h-72 rounded-4xl overflow-hidden border border-border shadow-sm">
          <AssetCover src={currentProject?.bannerImageUrl} title={currentProject?.title || '프로젝트'} />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {statCards.map((stat) => (
            <button
              key={stat.id}
              onClick={() =>
                setSelectedTab(selectedTab === stat.id ? "all" : stat.id)
              }
              className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group cursor-pointer ${
                selectedTab === stat.id
                  ? `border-${stat.color}-500 bg-${stat.color}-500/10 shadow-lg shadow-${stat.color}-500/10`
                  : "border-border bg-card hover:border-primary/40 shadow-sm"
              }`}
            >
              <div
                className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 inline-block mb-4 group-hover:scale-110 transition-transform`}
              >
                <stat.icon
                  className={`w-6 h-6 ${stat.id === "processing" && stat.value > 0 ? "animate-spin" : ""}`}
                />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-foreground mt-1">
                {jobsError || loadingJobs ? '—' : stat.value}
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
          <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <button
                onClick={() => setSelectedTypeFilter("all")}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
                  selectedTypeFilter === "all"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                전체 보기
              </button>
              {jobTypeFilters.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
                    selectedTypeFilter === type
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative group flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="작업 ID 또는 담당자 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                />
              </div>
              <button
                onClick={() => fetchJobs()}
                disabled={loadingJobs}
                title="새로고침"
                className="p-2.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${loadingJobs ? "animate-spin text-primary" : ""}`} />
              </button>
            </div>
          </div>

          {jobsError && (
            <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
              <span>{jobsError}</span>
              <button
                onClick={() => fetchJobs()}
                className="text-xs font-bold underline hover:no-underline cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Job Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40">
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
              <tbody className="divide-y divide-border">
                {jobsError ? (<tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">작업 목록을 조회하지 못했습니다. 위의 다시 시도 버튼을 이용해 주세요.</td></tr>) : loadingJobs && filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader className="w-8 h-8 animate-spin mb-3 text-primary" />
                        <p className="font-bold text-sm">작업 목록을 불러오는 중입니다...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    const jobLabel = job.jobCode || `JOB-${job.jobId}`;
                    const userName = job.createdBy?.nickname || job.createdBy?.email || "시스템";
                    const creator = currentProject?.members?.find(member => member.userId === job.createdBy?.userId);
                    const creatorImage = creator?.profileImageUrl || (job.createdBy?.userId === user?.userId ? user?.profileImage || user?.profileImageUrl : null);
                    const formattedDate = job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString("ko-KR")
                      : "-";

                    const isAugment = (job.type || "").toUpperCase().includes("AUGMENT");
                    const isTrain = (job.type || "").toUpperCase().includes("TRAIN");

                    return (
                      <tr
                        key={job.jobId}
                        onClick={() => handleJobClick(job)}
                        className="group hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground tracking-tight group-hover:text-primary transition-colors cursor-pointer">
                              {jobLabel}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground mt-0.5 select-all">
                              Seed: {job.seedNumber !== undefined && job.seedNumber !== null ? String(job.seedNumber) : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                              isAugment
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                : isTrain
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                  : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                            }`}
                          >
                            {isAugment ? "AUGMENT" : isTrain ? "TRAIN" : "INFERENCE"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(job.status, job.currentStep)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <ProfileAvatar
                              src={creatorImage}
                              alt={userName}
                              className="w-6 h-6 rounded-full bg-muted ring-1 ring-border shadow-sm"
                            />
                            <span className="text-sm font-bold text-foreground">
                              {userName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-muted-foreground tabular-nums">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
          {hasNext && (
            <div className="p-4 border-t border-border text-center">
              <button onClick={loadMoreJobs} disabled={loadingJobs} className="px-6 py-2 rounded-xl bg-muted text-sm font-semibold disabled:opacity-50">
                {loadingJobs ? '불러오는 중…' : '이전 작업 더 보기'}
              </button>
            </div>
          )}
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
                    <AssetCover src={coverImage.trim()} title="배경 이미지 미리보기" />
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
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      required
                      disabled={inviting}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="이메일 주소 입력"
                      className="min-w-0 flex-1 bg-background text-foreground px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <select aria-label="초대받을 멤버 권한" value={invitationRole} disabled={inviting} onChange={event => setInvitationRole(event.target.value as "MEMBER" | "MANAGER")} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                      <option value="MEMBER">멤버</option>
                      {canInviteManager && <option value="MANAGER" disabled={!invitationRolesEnabled}>관리자{!invitationRolesEnabled ? ' (준비 중)' : ''}</option>}
                    </select>
                    <button
                      type="submit"
                      disabled={inviting || !newMemberEmail.trim()}
                      className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {inviting ? '전송 중…' : '초대'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{invitationRolesEnabled ? '응답 전인 초대를 다시 보내면 지금 선택한 권한으로 변경됩니다. 관리자 초대는 관리자만 할 수 있습니다.' : '현재 멤버 초대를 사용할 수 있습니다. 관리자 초대는 서버 반영 후 제공됩니다.'}</p>
                </form>

                {inviteFeedback && <p role={inviteFeedback.ok ? 'status' : 'alert'} className={`mb-4 text-sm ${inviteFeedback.ok ? 'text-emerald-600' : 'text-red-500'}`}>{inviteFeedback.text}</p>}
                <div className="space-y-2">
                  {currentProject?.members?.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          src={member.profileImageUrl || (member.userId === user?.userId ? user?.profileImage || user?.profileImageUrl : null)}
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
