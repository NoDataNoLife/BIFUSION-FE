import { useState, useRef, useEffect } from "react";
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
import { useProjectStore } from "../../store/useProjectStore";

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
  coverImage: string;
  isPublic: boolean;
}

type SettingsTab = "plan" | "verification" | "account";



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
  const { 
    user, 
    logout, 
    deleteAccount, 
    updateNickname, 
    updateBio, 
    updateOrganization, 
    updateWebsite,
    updateProfileImage,
    fetchUserProfile,
    changePlan,
    applyExpert
  } = useAuthStore();

  const { managingProjects, participatingProjects, fetchMyProjects } = useProjectStore();

  useEffect(() => {
    if (user?.userId) {
      fetchUserProfile(user.userId);
    }
  }, [user?.userId, fetchUserProfile]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("plan");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setIsUploadingImage(true);
    const success = await updateProfileImage(file);
    setIsUploadingImage(false);

    if (!success) {
      alert("프로필 사진 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handlePlanChange = async (targetPlan: 'BASIC' | 'PRO') => {
    setIsChangingPlan(true);
    const success = await changePlan(targetPlan);
    setIsChangingPlan(false);

    if (success) {
      alert(`플랜이 ${targetPlan === 'PRO' ? 'Pro' : 'Basic'} 플랜으로 성공적으로 변경되었습니다.`);
    } else {
      alert("플랜 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const [isApplyingExpert, setIsApplyingExpert] = useState(false);
  const [expertFile, setExpertFile] = useState<File | null>(null);
  const expertFileInputRef = useRef<HTMLInputElement>(null);

  const handleExpertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      alert("PDF, JPG, JPEG, PNG 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setExpertFile(file);
  };

  const handleExpertApply = async () => {
    if (!expertFile) {
      alert("인증을 위해 증명서 파일을 첨부해 주세요.");
      return;
    }

    setIsApplyingExpert(true);
    const success = await applyExpert(expertFile);
    setIsApplyingExpert(false);

    if (success) {
      alert("전문가 인증 신청이 완료되었습니다! 관리자 승인까지 1~3 영업일이 소요됩니다.");
      setExpertFile(null);
    } else {
      alert("전문가 인증 신청에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // Nickname Editing State
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || "");

  const handleNicknameUpdate = async () => {
    if (!newNickname.trim() || newNickname === user?.nickname) {
      setIsEditingNickname(false);
      return;
    }

    const success = await updateNickname(newNickname);
    if (success) {
      setIsEditingNickname(false);
    } else {
      alert("닉네임 수정에 실패했습니다. 이미 사용 중이거나 올바르지 않은 형식일 수 있습니다.");
    }
  };

  // Bio Editing State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(user?.bio || "");

  const handleBioUpdate = async () => {
    if (newBio === user?.bio) {
      setIsEditingBio(false);
      return;
    }

    const success = await updateBio(newBio);
    if (success) {
      setIsEditingBio(false);
    } else {
      alert("자기소개 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // Organization Editing State
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [newOrg, setNewOrg] = useState(user?.organization || "");

  const handleOrgUpdate = async () => {
    if (newOrg === user?.organization) {
      setIsEditingOrg(false);
      return;
    }

    const success = await updateOrganization(newOrg);
    if (success) {
      setIsEditingOrg(false);
    } else {
      alert("소속 정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // Website Editing State
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [newWebsite, setNewWebsite] = useState(user?.websiteUrl || "");

  const handleWebsiteUpdate = async () => {
    if (newWebsite === user?.websiteUrl) {
      setIsEditingWebsite(false);
      return;
    }

    const success = await updateWebsite(newWebsite);
    if (success) {
      setIsEditingWebsite(false);
    } else {
      alert("웹사이트 주소 수정에 실패했습니다. 올바른 URL 형식인지 확인해주세요.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 계정을 삭제하시겠습니까? 작성하신 모든 정보가 삭제되며 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsDeleting(true);
    const success = await deleteAccount();
    setIsDeleting(false);

    if (success) {
      alert("계정이 삭제되었습니다. 그동안 이용해주셔서 감사합니다.");
      setShowSettingsModal(false);
      // deleteAccount 내부에서 상태를 초기화하므로 라우터가 자동으로 랜딩페이지로 보냅니다.
    } else {
      alert("계정 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const [projects, setProjects] = useState<ProfileProject[]>([]);
  const [showProjectVisibilityModal, setShowProjectVisibilityModal] =
    useState(false);
  const [draftProjects, setDraftProjects] =
    useState<ProfileProject[]>([]);

  useEffect(() => {
    const allProjects = [...managingProjects, ...participatingProjects];
    const mappedProjects: ProfileProject[] = allProjects.map(p => ({
      id: p.projectId.toString(),
      title: p.title,
      role: p.role === "LEADER" ? "관리자" : "멤버",
      coverImage: p.bannerImageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
      isPublic: true
    }));
    setProjects(mappedProjects);
    setDraftProjects(mappedProjects);
  }, [managingProjects, participatingProjects]);
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
    { id: "plan", label: "요금제", icon: Crown },
    { id: "verification", label: "전문가 인증", icon: ShieldCheck },
    { id: "account", label: "계정 보안", icon: UserX },
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-gray-50 shadow-inner relative">
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 animate-in fade-in duration-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                </div>
              )}
              <ImageWithFallback
                src={user?.profileImage || "/defaultUserProfile.png"}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={handleImageClick}
              disabled={isUploadingImage}
              className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
              title="프로필 사진 수정"
            >
              <Edit2 size={18} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-1 mb-6">
            <div className="group relative flex flex-col items-center">
              {isEditingNickname ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200 mb-1">
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNicknameUpdate()}
                    autoFocus
                    placeholder="닉네임 입력"
                    className="text-2xl font-bold text-gray-900 bg-gray-50 border-b-2 border-primary outline-none px-2 py-0.5 w-48 text-center"
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={handleNicknameUpdate}
                      className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="저장"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingNickname(false);
                        setNewNickname(user?.nickname || "");
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="취소"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {user?.nickname || "닉네임을 설정해주세요"}
                  </h1>
                  <button 
                    onClick={() => {
                      setNewNickname(user?.nickname || "");
                      setIsEditingNickname(true);
                    }}
                    className="p-1 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="닉네임 수정"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              
              <p className="text-sm text-gray-400 font-medium">
                @{user?.name || "researcher"}
              </p>
            </div>

            {user?.isExpert && (
              <div className="pt-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                  <ShieldCheck size={12} /> 전문가 인증됨
                </span>
              </div>
            )}
          </div>

          {/* Bio Section */}
          <div className="w-full text-left space-y-2 border-t border-gray-50 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                About Me
              </p>
              {!isEditingBio && (
                <button 
                  onClick={() => {
                    setNewBio(user?.bio || "");
                    setIsEditingBio(true);
                  }}
                  className="p-1 text-gray-300 hover:text-primary transition-colors"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
            
            {isEditingBio ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:border-primary/30 min-h-[100px] resize-none"
                  placeholder="자기소개를 입력해주세요."
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setIsEditingBio(false);
                      setNewBio(user?.bio || "");
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleBioUpdate}
                    className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    저장하기
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed">
                {user?.bio || "자기소개를 입력해주세요."}
              </p>
            )}
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
          <div className="flex items-center justify-between group h-6">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium flex-1">
              <MapPin size={18} className="text-primary" />
              {isEditingOrg ? (
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOrgUpdate()}
                  autoFocus
                  className="bg-gray-50 border-b border-primary outline-none px-1 w-full"
                />
              ) : (
                <span className="truncate">{user?.organization || "소속 정보 없음"}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isEditingOrg ? (
                <>
                  <button onClick={handleOrgUpdate} className="p-1 text-green-500 hover:bg-green-50 rounded-lg">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setIsEditingOrg(false)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setNewOrg(user?.organization || "");
                    setIsEditingOrg(true);
                  }}
                  className="p-1 text-gray-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between group h-6">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium flex-1">
              <LinkIcon size={18} className="text-primary" />
              {isEditingWebsite ? (
                <input
                  type="text"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWebsiteUpdate()}
                  autoFocus
                  placeholder="https://example.com"
                  className="bg-gray-50 border-b border-primary outline-none px-1 w-full"
                />
              ) : (
                <span className="truncate">{user?.websiteUrl || "웹사이트 정보 없음"}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isEditingWebsite ? (
                <>
                  <button onClick={handleWebsiteUpdate} className="p-1 text-green-500 hover:bg-green-50 rounded-lg">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setIsEditingWebsite(false)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setNewWebsite(user?.websiteUrl || "");
                    setIsEditingWebsite(true);
                  }}
                  className="p-1 text-gray-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
            <MessageSquare size={18} className="text-primary" />
            {user?.contact || "연락처 정보 없음"}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
            <Calendar size={18} className="text-primary" />{' '}
            {user?.createdAt ? (
              isNaN(Date.parse(user.createdAt)) ? (
                user.createdAt.includes('가입') ? user.createdAt : `Joined ${user.createdAt}`
              ) : (
                `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
              )
            ) : (
              "Joined ..."
            )}
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
                    {project.role}
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
                : `${publicProjects.length - displayedProjects.length}개 더보기`}
            </button>
          )}
        </section>

        {/* Community Activities */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> 집단 활동
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
                        {project.role}
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
                계정 설정
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
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">현재 플랜</p>
                        <h3 className="text-2xl font-black text-gray-900">
                          {user?.planType === "PRO" ? "Pro Plan" : "Basic Plan"}
                        </h3>
                      </div>
                      <span className="px-4 py-1.5 bg-white border border-primary/20 text-primary rounded-full text-sm font-bold shadow-sm">
                        {user?.planType === "PRO" ? "유료" : "무료"}
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">플랜 제한사항</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                            <Check size={18} className="text-primary flex-shrink-0" /> 월 {user?.planType === "PRO" ? "무제한" : "100개"} 데이터 증강 작업
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                            <Check size={18} className="text-primary flex-shrink-0" /> 프로젝트 {user?.planType === "PRO" ? "무제한" : "3개까지"} 생성 가능
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                            <Check size={18} className="text-primary flex-shrink-0" /> {user?.planType === "PRO" ? "고급 AI 모델 및 커스텀 설정" : "기본 AI 모델 사용"}
                          </div>
                          {user?.planType === "PRO" ? (
                            <>
                              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                <Check size={18} className="text-primary flex-shrink-0" /> 우선 지원 및 전용 서버
                              </div>
                              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                <Check size={18} className="text-primary flex-shrink-0" /> 팀 협업 기능 제공
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                <X size={18} className="text-gray-300 flex-shrink-0" /> 고급 AI 모델 및 커스텀 설정
                              </div>
                              <div className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                <X size={18} className="text-gray-300 flex-shrink-0" /> 우선 지원 및 전용 서버
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {user?.planType !== "PRO" && (
                        <div className="pt-6 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pro 플랜 혜택</p>
                          <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            무제한 데이터 증강, 고급 AI 모델, 우선 지원, 팀 협업 기능 등 모든 기능을 제한 없이 이용해보세요.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePlanChange(user?.planType === "PRO" ? "BASIC" : "PRO")}
                    disabled={isChangingPlan}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isChangingPlan ? (
                      "처리 중..."
                    ) : user?.planType === "PRO" ? (
                      "Basic 플랜으로 변경"
                    ) : (
                      "Pro 플랜으로 업그레이드 — 월 $19"
                    )}
                  </button>
                </div>
              )}

              {settingsTab === "verification" && (
                <div className="space-y-8">
                  {/* Case 1: Already Approved / Verified Expert */}
                  {(user?.isExpert || user?.expertStatus === "APPROVED") ? (
                    <div className="text-center py-10 space-y-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 p-8">
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <ShieldCheck size={48} className="animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-emerald-800">전문가 인증 완료</h3>
                        <p className="text-sm font-medium text-emerald-600">
                          인증된 전문가 회원님입니다. 전문가 전용 권한과 혜택을 이용하실 수 있습니다.
                        </p>
                      </div>
                      <div className="pt-6 border-t border-emerald-100/50 max-w-md mx-auto text-xs text-emerald-700/80 font-bold space-y-2">
                        <p>✓ 전문가 데이터셋 및 레시피 검토 기능 활성화</p>
                        <p>✓ 프로필에 전문가 인증 배지 표시</p>
                      </div>
                    </div>
                  ) : user?.expertStatus === "PENDING" ? (
                    /* Case 2: Under Review / Pending status */
                    <div className="text-center py-10 space-y-6 bg-amber-50/50 rounded-3xl border border-amber-100 p-8">
                      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-600">
                        <AlertTriangle size={48} className="animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-amber-800">인증 심사 진행 중</h3>
                        <p className="text-sm font-medium text-amber-600">
                          전문가 인증 신청이 성공적으로 접수되어 심사 중입니다.
                        </p>
                      </div>
                      <p className="text-xs text-amber-700 max-w-sm mx-auto font-medium leading-relaxed bg-white border border-amber-200/50 px-4 py-3 rounded-2xl">
                        첨부하신 의료 면허증 또는 학위 증명서 검토에는 **영업일 기준 1~3일**이 소요됩니다. 심사가 완료되면 결과가 메일 등으로 통보됩니다.
                      </p>
                    </div>
                  ) : (
                    /* Case 3: Apply / None / Rejected status */
                    <div className="space-y-6">
                      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 space-y-4">
                        <div className="flex gap-4">
                          <div className="p-3 bg-white border border-primary/20 text-primary rounded-2xl shadow-sm h-fit">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-gray-900 mb-1">의료 및 학위 전문가 신청</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                              의료진, 관련 학계 연구자 등 전문 지식을 인증받아 신뢰받는 기여를 시작해보세요. 의료 면허증 또는 학위 증명서를 첨부하여 인증을 요청할 수 있습니다.
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">지원 대상서류</p>
                          <ul className="text-xs text-gray-600 font-medium space-y-2 pl-4 list-disc">
                            <li>의사 면허증 / 간호사 면허증 등 전문 의료 면허증</li>
                            <li>의학 또는 생명과학 석사/박사 학위 증명서</li>
                          </ul>
                        </div>
                      </div>

                      {/* File Upload Zone */}
                      <div 
                        onClick={() => expertFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                          expertFile 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={expertFileInputRef} 
                          onChange={handleExpertFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        {expertFile ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-white border border-primary/20 text-primary rounded-2xl shadow-sm inline-flex items-center justify-center">
                              <Upload size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 break-all">{expertFile.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{(expertFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpertFile(null);
                              }}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                            >
                              파일 재선택
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl inline-flex items-center justify-center">
                              <Upload size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-700">인증 서류 파일 업로드</p>
                              <p className="text-xs text-gray-400 mt-1">
                                클릭하여 컴퓨터에서 파일을 선택하세요 (PDF, JPG, JPEG, PNG / 최대 10MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Submit button */}
                      <button
                        onClick={handleExpertApply}
                        disabled={isApplyingExpert || !expertFile}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isApplyingExpert ? "제출 중..." : "전문가 인증 신청하기"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {settingsTab === "account" && (
                <div className="space-y-8 text-center pt-4">
                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 inline-block mx-auto min-w-[250px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">
                      연동된 이메일
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {user?.email}
                    </p>
                  </div>
                  <div className="pt-6 space-y-4">
                    <button
                      onClick={() => {
                        logout();
                        setShowSettingsModal(false);
                      }}
                      className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut size={20} /> 로그아웃 (Sign Out)
                    </button>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-red-400 uppercase mb-3 tracking-widest flex items-center justify-center gap-2">
                        <AlertTriangle size={12} /> 위험 구역 (Danger Zone)
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserX size={20} />
                        )}
                        계정 삭제 (Delete Account)
                      </button>
                    </div>
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
