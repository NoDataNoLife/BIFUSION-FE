import { useState } from "react";
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
  HelpCircle,
  LogOut,
  Crown,
  AlertTriangle,
  UserX,
  ShieldCheck,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { useAuthStore } from "../../store/useAuthStore";

// --- Types ---
interface CommunityActivity {
  id: string;
  type: "showcase" | "dataset" | "qna" | "recruiting";
  title: string;
  description?: string;
  timestamp: string;
  isPublic: boolean;
  stats?: { likes?: number; downloads?: number; comments?: number };
  isExpertVerified?: boolean;
}

interface ProfileProject {
  id: string;
  title: string;
  role: "관리자" | "멤버";
  status: "Running" | "Completed";
  coverImage: string;
  isPublic: boolean;
}

type SettingsTab = "plan" | "verification" | "account";

const initialProjects: ProfileProject[] = [
  {
    id: "P-001",
    title: "심장 질환 예측 모델",
    role: "관리자",
    status: "Running",
    coverImage:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    isPublic: true,
  },
  {
    id: "P-002",
    title: "뇌 MRI 이미지 분석",
    role: "멤버",
    status: "Running",
    coverImage:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80",
    isPublic: true,
  },
  {
    id: "P-003",
    title: "합성 환자 데이터 생성",
    role: "관리자",
    status: "Completed",
    coverImage:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80",
    isPublic: true,
  },
  {
    id: "P-004",
    title: "CT 스캔 노이즈 제거",
    role: "멤버",
    status: "Running",
    coverImage:
      "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=600&q=80",
    isPublic: true,
  },
  {
    id: "P-005",
    title: "폐 질환 진단 시스템",
    role: "관리자",
    status: "Running",
    coverImage:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=80",
    isPublic: true,
  },
  {
    id: "P-006",
    title: "피부 질환 분류 모델",
    role: "멤버",
    status: "Running",
    coverImage:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    isPublic: true,
  },
  {
    id: "P-007",
    title: "망막 질환 탐지",
    role: "멤버",
    status: "Running",
    coverImage:
      "https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80",
    isPublic: false,
  },
  {
    id: "P-008",
    title: "초음파 자동 판독",
    role: "관리자",
    status: "Completed",
    coverImage:
      "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=600&q=80",
    isPublic: false,
  },
];

const initialActivities: CommunityActivity[] = [
  {
    id: "1",
    type: "showcase",
    title: "ECG Data Augmentation Pipeline",
    description: "심전도 신호 분류를 위한 전문가 검증 레시피",
    timestamp: "1일 전",
    isPublic: true,
    stats: { likes: 512, comments: 24 },
    isExpertVerified: true,
  },
  {
    id: "2",
    type: "dataset",
    title: "ECG Heartbeat Categorization",
    description: "심전도 신호 분류를 위한 대규모 데이터셋 (109,446 files)",
    timestamp: "5일 전",
    isPublic: true,
    stats: { downloads: 2145, likes: 789 },
    isExpertVerified: true,
  },
  {
    id: "3",
    type: "qna",
    title: "ECG 데이터 전처리 방법 문의",
    description:
      "Q&A 답변: ECG 신호의 경우 베이스라인 원더 제거가 중요합니다...",
    timestamp: "1주 전",
    isPublic: true,
    stats: { comments: 24 },
  },
  {
    id: "4",
    type: "recruiting",
    title: "의료 영상 AI 연구팀 모집",
    description:
      "폐암 진단 AI 개발을 위한 의료 전문가 및 데이터 사이언티스트 모집",
    timestamp: "2주 전",
    isPublic: true,
    stats: { likes: 45, comments: 12 },
  },
  {
    id: "5",
    type: "showcase",
    title: "Chest X-Ray Classification Model",
    description: "흉부 X-Ray 이미지 분류를 위한 ResNet 기반 모델",
    timestamp: "3주 전",
    isPublic: true,
    stats: { likes: 234, comments: 18 },
    isExpertVerified: true,
  },
  {
    id: "6",
    type: "dataset",
    title: "Medical Image Segmentation Dataset",
    description: "CT 이미지 세그멘테이션을 위한 라벨링 데이터셋",
    timestamp: "3주 전",
    isPublic: true,
    stats: { likes: 189, downloads: 567 },
  },
  {
    id: "7",
    type: "qna",
    title: "GAN을 활용한 의료 이미지 생성",
    description: "Q&A 답변: 개인정보 보호 측면에서 매우 중요한 연구입니다.",
    timestamp: "1개월 전",
    isPublic: true,
    stats: { likes: 42 },
  },
  {
    id: "8",
    type: "showcase",
    title: "Skin Lesion Classification Pipeline",
    description: "피부 병변 분류를 위한 전문가 검증 파이프라인",
    timestamp: "1개월 전",
    isPublic: true,
    stats: { likes: 423, comments: 31 },
  },
  {
    id: "9",
    type: "recruiting",
    title: "뇌 MRI 종양 탐지 프로젝트 팀원 모집",
    description: "딥러닝 기반 뇌 MRI 종양 탐지 시스템 개발",
    timestamp: "1개월 전",
    isPublic: false,
    stats: { likes: 28, comments: 9 },
  },
  {
    id: "10",
    type: "dataset",
    title: "Retinal OCT Image Dataset",
    description: "망막 OCT 이미지 데이터셋 (84,495 files)",
    timestamp: "2개월 전",
    isPublic: true,
    stats: { likes: 521, downloads: 1834 },
    isExpertVerified: true,
  },
];

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("plan");
  const [projects, setProjects] = useState<ProfileProject[]>(initialProjects);
  const [showProjectVisibilityModal, setShowProjectVisibilityModal] =
    useState(false);
  const [draftProjects, setDraftProjects] =
    useState<ProfileProject[]>(initialProjects);
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(
    null,
  );
  const [showAllProjects, setShowAllProjects] = useState(false);

  const [communityActivities, setCommunityActivities] =
    useState<CommunityActivity[]>(initialActivities);
  const [isCommunityPublic, setIsCommunityPublic] = useState(true);
  const [visibleActivityCount, setVisibleActivityCount] = useState(5);

  const publicProjects = projects.filter((project) => project.isPublic);
  const displayedProjects = showAllProjects
    ? publicProjects
    : publicProjects.slice(0, 6);
  const hasMoreProjects = publicProjects.length > 6;

  const displayedActivities = communityActivities.slice(
    0,
    visibleActivityCount,
  );
  const hasMoreActivities = visibleActivityCount < communityActivities.length;
  const settingsTabs: Array<{
    id: SettingsTab;
    label: string;
    icon: typeof Crown;
  }> = [
    { id: "plan", label: "Plan", icon: Crown },
    { id: "verification", label: "Verify", icon: ShieldCheck },
    { id: "account", label: "Security", icon: UserX },
  ];

  const openProjectVisibilityModal = () => {
    setDraftProjects(projects);
    setShowProjectVisibilityModal(true);
  };

  const toggleDraftProjectVisibility = (projectId: string) => {
    setDraftProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, isPublic: !project.isPublic }
          : project,
      ),
    );
  };

  const saveProjectVisibility = () => {
    setProjects(draftProjects);
    setShowProjectVisibilityModal(false);
    setDraggingProjectId(null);
  };

  const handleProjectDragStart = (projectId: string) => {
    setDraggingProjectId(projectId);
  };

  const handleProjectDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleProjectDrop = (targetProjectId: string) => {
    if (!draggingProjectId || draggingProjectId === targetProjectId) {
      return;
    }

    setDraftProjects((prev) => {
      const draggedIndex = prev.findIndex(
        (project) => project.id === draggingProjectId,
      );
      const targetIndex = prev.findIndex(
        (project) => project.id === targetProjectId,
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev;
      }

      const reordered = [...prev];
      const [draggedProject] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, draggedProject);

      return reordered;
    });

    setDraggingProjectId(null);
  };

  const handleProjectDragEnd = () => {
    setDraggingProjectId(null);
  };

  const toggleActivityVisibility = (activityId: string) => {
    setCommunityActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? { ...activity, isPublic: !activity.isPublic }
          : activity,
      ),
    );
  };

  const loadMoreActivities = () => {
    if (!hasMoreActivities) {
      return;
    }

    setVisibleActivityCount((prev) =>
      Math.min(prev + 5, communityActivities.length),
    );
  };

  const handleActivityScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isNearBottom) {
      loadMoreActivities();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* --- Left Column: Profile Card (Based on Prototype Structure) --- */}
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          {/* Avatar Section */}
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-gray-50 shadow-inner">
              <ImageWithFallback
                src={user?.profileImage || "/defalutUserProfile.png"}
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
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.name || "사용자"}
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              @{user?.email?.split("@")[0] || "researcher"}
            </p>
            <div className="pt-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                <ShieldCheck size={12} /> 전문가 인증됨
              </span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="w-full text-left space-y-2 border-t border-gray-50 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                About Me
              </p>
              <Edit2 size={12} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              의료 AI 연구원으로서 데이터 증강 기술을 통해 정밀 진단 모델의
              성능을 향상시키는 연구를 진행하고 있습니다.
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
            <LinkIcon size={18} className="text-primary" />{" "}
            bifusion.ai/researcher
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
            <Calendar size={18} className="text-primary" /> Joined Mar 2024
          </div>
        </div>
      </div>

      {/* --- Right Column: Content (Based on Prototype Structure) --- */}
      <div className="flex-1 space-y-8">
        {/* My Projects */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <AlertTriangle size={20} className="text-primary" /> 나의 개미집
            </h2>
            <button
              onClick={openProjectVisibilityModal}
              className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              aria-label="프로젝트 공개 설정"
            >
              <SettingsIcon size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50/40"
              >
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-28 object-cover"
                />
                <div className="p-3">
                  <h3 className="text-lg font-black text-gray-900 leading-tight line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.role} <span className="text-gray-300">•</span>{" "}
                    {project.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMoreProjects && (
            <button
              onClick={() => setShowAllProjects((prev) => !prev)}
              className="mt-4 w-full py-3 rounded-xl border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-colors"
            >
              {showAllProjects
                ? "접기"
                : `더보기 (+${publicProjects.length - displayedProjects.length})`}
            </button>
          )}
        </section>

        {/* Community Activities */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> 커뮤니티 활동
            </h2>

            <button
              onClick={() => setIsCommunityPublic((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                isCommunityPublic
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isCommunityPublic ? <Eye size={16} /> : <EyeOff size={16} />}
              {isCommunityPublic ? "공개" : "비공개"}
            </button>
          </div>

          <div
            className={`max-h-[680px] overflow-y-auto pr-2 space-y-3 custom-scrollbar transition-opacity ${
              isCommunityPublic ? "opacity-100" : "opacity-70"
            }`}
            onScroll={handleActivityScroll}
          >
            {displayedActivities.map((activity) => {
              const typeTone =
                activity.type === "showcase"
                  ? "bg-purple-100 text-purple-700"
                  : activity.type === "dataset"
                    ? "bg-blue-100 text-blue-700"
                    : activity.type === "qna"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700";

              const leftIconTone =
                activity.type === "showcase"
                  ? "bg-purple-100 text-purple-600"
                  : activity.type === "dataset"
                    ? "bg-blue-100 text-blue-600"
                    : activity.type === "qna"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600";

              return (
                <div
                  key={activity.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    activity.isPublic && isCommunityPublic
                      ? "border-primary/20 bg-white"
                      : "border-gray-100 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${leftIconTone}`}
                    >
                      {activity.type === "showcase" && <Award size={20} />}
                      {activity.type === "dataset" && <Database size={20} />}
                      {activity.type === "qna" && <HelpCircle size={20} />}
                      {activity.type === "recruiting" && <Users size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide ${typeTone}`}
                          >
                            {activity.type}
                          </span>
                          <h3 className="text-lg font-black text-gray-900 truncate">
                            {activity.title}
                          </h3>
                          {activity.isExpertVerified && (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-primary text-white whitespace-nowrap">
                              전문가
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleActivityVisibility(activity.id)}
                          disabled={!isCommunityPublic}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            activity.isPublic
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-100 text-gray-500"
                          } ${!isCommunityPublic ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          {activity.isPublic ? (
                            <Eye size={13} />
                          ) : (
                            <EyeOff size={13} />
                          )}
                          {activity.isPublic ? "공개" : "비공개"}
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center gap-5 pt-3 text-xs font-bold text-gray-400">
                        <span>{activity.timestamp}</span>
                        {activity.stats?.likes && (
                          <span className="flex items-center gap-1 text-red-400">
                            <Heart size={13} fill="currentColor" />{" "}
                            {activity.stats.likes}
                          </span>
                        )}
                        {activity.stats?.downloads && (
                          <span className="flex items-center gap-1 text-green-500">
                            <Upload size={13} /> {activity.stats.downloads}
                          </span>
                        )}
                        {activity.stats?.comments && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <MessageSquare size={13} />{" "}
                            {activity.stats.comments}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMoreActivities && (
              <button
                onClick={loadMoreActivities}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                더보기 (+
                {Math.min(5, communityActivities.length - visibleActivityCount)}
                )
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Project Visibility Modal */}
      {showProjectVisibilityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                프로젝트 공개 설정
              </h2>
              <button
                onClick={() => setShowProjectVisibilityModal(false)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={22} className="text-gray-500" />
              </button>
            </div>

            <div className="p-8 space-y-5 overflow-y-auto">
              <p className="text-sm text-gray-500 leading-relaxed">
                프로필에 표시할 프로젝트를 선택하고 순서를 관리하세요. 비공개로
                설정한 프로젝트는 다른 사용자에게 표시되지 않습니다.
              </p>
              <p className="text-xs text-gray-400">
                드래그해서 순서를 바꾸면 상단 노출 순서에 그대로 반영됩니다.
              </p>

              <div className="space-y-3">
                {draftProjects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={() => handleProjectDragStart(project.id)}
                    onDragOver={handleProjectDragOver}
                    onDrop={() => handleProjectDrop(project.id)}
                    onDragEnd={handleProjectDragEnd}
                    className={`flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border transition-colors ${
                      draggingProjectId === project.id
                        ? "border-primary/40 bg-primary/5"
                        : "border-gray-100"
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-[72px] h-12 rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black text-gray-900 truncate">
                        {project.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {project.role} <span className="text-gray-300">•</span>{" "}
                        {project.status}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleDraftProjectVisibility(project.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm transition-colors ${
                        project.isPublic
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {project.isPublic ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                      {project.isPublic ? "공개" : "비공개"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowProjectVisibilityModal(false)}
                className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveProjectVisibility}
                className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Settings Modal (Plan, Verification, Account) --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                Account Settings
              </h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2.5 hover:bg-white rounded-xl transition-all"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-8 border-b border-gray-100 flex gap-8 bg-[#F8FAFC]">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id)}
                  className={`pb-4 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all relative ${
                    settingsTab === tab.id
                      ? "text-primary"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {settingsTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {settingsTab === "plan" && (
                <div className="space-y-8">
                  <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      현재 플랜: Basic
                    </h3>
                    <div className="space-y-3">
                      {[
                        "100 Data Augmentation / mo",
                        "Max 3 Research Projects",
                        "Community Recipe Access",
                      ].map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-sm font-bold text-gray-600"
                        >
                          <Check size={16} className="text-primary" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    Upgrade to PRO — $19/mo
                  </button>
                </div>
              )}

              {settingsTab === "account" && (
                <div className="space-y-8 text-center pt-4">
                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 inline-block mx-auto min-w-[250px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">
                      Login Email
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {user?.email}
                    </p>
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        logout();
                        setShowSettingsModal(false);
                      }}
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
