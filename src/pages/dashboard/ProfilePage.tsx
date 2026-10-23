import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  AlertTriangle,
  UserX,
  ShieldCheck,
  Eye,
  EyeOff,
  GripVertical,
  Mail,
} from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../lib/axios";
import { requestMessage, type ActivityItem, type ActivityPage } from "../../lib/liveData";

import { activityVisible } from '../../lib/backendContracts';

// --- Types ---
interface CommunityActivity {
  id: string;
  type: "showcase" | "dataset" | "qna" | "recruiting";
  title: string;
  description?: string;
  timestamp: string;
  isPublic: boolean;
  isMyPageVisible: boolean;
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

function mapActivity(item: ActivityItem): CommunityActivity {
  return { id: `${item.type}:${item.activityId}`, type: item.type === 'RECIPE' ? 'showcase' : item.type === 'DATASET' ? 'dataset' : item.type === 'QNA' ? 'qna' : 'recruiting', title: item.title, description: item.description, timestamp: new Date(item.createdAt).toLocaleDateString(), isPublic: item.isPublic, isMyPageVisible: activityVisible(item), stats: { likes: item.likeCount, downloads: item.downloadCount, comments: item.commentCount } };
}

type SettingsTab = "verification" | "account";



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
    applyExpert
  } = useAuthStore();

  const { userId: paramUserId } = useParams();
  const [searchParams] = useSearchParams();
  const isOwnProfile = !paramUserId || Number(paramUserId) === user?.userId;

  const [communityActivities, setCommunityActivities] =
    useState<CommunityActivity[]>([]);
  const [isCommunityPublic, setIsCommunityPublic] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activityNotice, setActivityNotice] = useState<string | null>(null);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityCursor, setActivityCursor] = useState<string | null>(null);
  const [activityHasNext, setActivityHasNext] = useState(false);
  const [visibleActivityCount, setVisibleActivityCount] = useState(5);

  const [otherUser, setOtherUser] = useState<any>(null);

  useEffect(() => {
    setCommunityActivities([]); setOtherUser(null); setProfileError(null);
    if (isOwnProfile && user?.userId) {
      void fetchUserProfile(user.userId);
      return;
    }
    if (!paramUserId) return;
    const controller = new AbortController();
    setProfileLoading(true);
    api.get(`/users/${paramUserId}`, { params: { size: 100 }, signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        const data = res.data.data;
        if (!data?.userId) throw new Error('프로필 응답을 확인할 수 없습니다.');
        setOtherUser({ ...data, bio: data.introduction, organization: data.location, websiteUrl: data.website, profileImage: data.profileImageUrl });
        const activities = data.publicActivities ?? [];
        setCommunityActivities(activities.filter((it: ActivityItem) => it.type !== ('PROJECT' as string)).map((it: ActivityItem) => mapActivity({ ...it, isMyPageVisible: true })));
        const visible = activities.filter((it: { type: string }) => it.type === 'PROJECT').map((it: { activityId: number; title: string; myRole: string; bannerImageUrl: string }) => ({ id: String(it.activityId), title: it.title, role: it.myRole === 'MANAGER' ? '관리자' : '멤버', coverImage: it.bannerImageUrl || '', isPublic: true }));
        setProjects(visible); setHasNext(false); setTotalCount(visible.length);
      }).catch((err) => { if (!controller.signal.aborted) setProfileError(requestMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setProfileLoading(false); });
    return () => controller.abort();
  }, [isOwnProfile, user?.userId, paramUserId, fetchUserProfile]);

  const activeUser = isOwnProfile ? user : otherUser;

  const requestedSettings = searchParams.get('settings');
  const initialSettingsTab: SettingsTab = requestedSettings === 'account' || requestedSettings === 'verification' ? requestedSettings : 'account';
  const [showSettingsModal, setShowSettingsModal] = useState(requestedSettings === 'account' || requestedSettings === 'verification');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>(initialSettingsTab);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
  const [showProjectVisibilityModal, setShowProjectVisibilityModal] = useState(false);
  const [draftProjects, setDraftProjects] = useState<ProfileProject[]>([]);
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null);
  
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  const [totalCount, setTotalCount] = useState<number>(0);
  const isFetchingRef = useRef(false);

  const fetchProfileProjects = useCallback(async (cursor?: string | null) => {
    if (!isOwnProfile) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoadingProjects(true);
    try {
      const url = `/projects/me?size=6&isPublic=true${cursor ? `&cursor=${cursor}` : ''}`;
      const response = await api.get(url);
      if (response.data.success) {
        const { items, nextCursor: newCursor, hasNext: newHasNext, totalCount: newTotalCount } = response.data.data;
        const mappedProjects: ProfileProject[] = items.map((p: any) => ({
          id: p.projectId.toString(),
          title: p.title,
          role: p.role === "MANAGER" ? "관리자" : "멤버",
          coverImage: p.bannerImageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
          isPublic: p.isPublic
        }));

        if (cursor) {
          setProjects(prev => [...prev, ...mappedProjects]);
          setDraftProjects(prev => [...prev, ...mappedProjects]);
        } else {
          setProjects(mappedProjects);
          setDraftProjects(mappedProjects);
        }
        setNextCursor(newCursor);
        setHasNext(newHasNext);
        setTotalCount(newTotalCount);
      }
    } catch (error) {
      setProfileError(requestMessage(error));
    } finally {
      isFetchingRef.current = false;
      setIsLoadingProjects(false);
    }
  }, [isOwnProfile]);

  useEffect(() => {
    fetchProfileProjects();
  }, [fetchProfileProjects]);

  useEffect(() => {
    if (!isOwnProfile) return;
    const controller = new AbortController();
    setActivitiesLoading(true); setActivityError(null); setActivityHasNext(false); setActivityCursor(null);
    api.get('/mypage/activities', { params: { size: 20 }, signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        const data = res.data.data as ActivityPage;
        setCommunityActivities(data.items.map(mapActivity)); setActivityHasNext(data.hasNext); setActivityCursor(data.nextCursor);
      }).catch((err) => { if (!controller.signal.aborted) setActivityError(requestMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setActivitiesLoading(false); });
    return () => controller.abort();
  }, [isOwnProfile, user?.userId]);

  const displayedProjects = projects.filter((project) => project.isPublic);

  const availableActivities = isOwnProfile
    ? (isCommunityPublic ? communityActivities : communityActivities.filter((a) => a.isMyPageVisible))
    : communityActivities.filter((a) => a.isMyPageVisible);

  const displayedActivities = availableActivities.slice(
    0,
    visibleActivityCount,
  );
  const hasMoreActivities = visibleActivityCount < availableActivities.length || activityHasNext;
  const settingsTabs: Array<{
    id: SettingsTab;
    label: string;
    icon: typeof ShieldCheck;
  }> = [
    { id: "verification", label: "전문가 인증", icon: ShieldCheck },
    { id: "account", label: "계정 보안", icon: UserX },
  ];

  const openProjectVisibilityModal = async () => {
    try {
      const response = await api.get('/projects/me?size=100');
      if (response.data.success) {
        const allProjects = response.data.data.items.map((p: any) => ({
          id: p.projectId.toString(),
          title: p.title,
          role: p.role === "MANAGER" ? "관리자" : "멤버",
          coverImage: p.bannerImageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
          isPublic: p.isPublic
        }));
        setDraftProjects(allProjects);
        setShowProjectVisibilityModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch all projects for visibility modal", error);
      // Fallback
      setDraftProjects(projects);
      setShowProjectVisibilityModal(true);
    }
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

  const saveProjectVisibility = async () => {
    try {
      const payload = {
        items: draftProjects.map(p => ({
          projectId: Number(p.id),
          isPublic: p.isPublic
        }))
      };
      // API 문서상 GET으로 표기되어 있으나 통상적인 업데이트 메서드인 PUT(또는 PATCH/POST)를 사용합니다.
      const response = await api.put('/users/me/projects/visibility', payload);
      
      if (response.data.success) {
        setProjects(draftProjects);
        setShowProjectVisibilityModal(false);
        setDraggingProjectId(null);
      } else {
        alert("공개 여부 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to update project visibility:", error);
      alert("공개 여부 변경 중 오류가 발생했습니다.");
    }
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

  const saveActivityVisibility = async (activityId: string, visible: boolean) => {
    const target = communityActivities.find((activity) => activity.id === activityId);
    if (!target || savingVisibility) return;
    const type = target.type === 'showcase' ? 'RECIPE' : target.type === 'dataset' ? 'DATASET' : target.type === 'qna' ? 'QNA' : 'RECRUITMENT';
    setSavingVisibility(true); setActivityError(null); setActivityNotice(null);
    try {
      await api.patch('/users/me/activities/visibility', { items: [{ type, id: Number(activityId.split(':').pop()), isPublic: visible }] });
      setCommunityActivities((items) => items.map((item) => item.id === activityId ? { ...item, isMyPageVisible: item.isPublic && visible } : item));
      setActivityNotice(`프로필에서 ${visible ? '표시' : '숨김'} 처리했습니다.`);
    } catch (err) { setActivityError(requestMessage(err, '프로필 노출 설정을 저장하지 못했습니다.')); }
    finally { setSavingVisibility(false); }
  };

  const loadMoreActivities = async () => {
    if (activitiesLoading) return;
    if (visibleActivityCount < availableActivities.length) { setVisibleActivityCount((count) => count + 5); return; }
    if (!isOwnProfile || !activityHasNext || !activityCursor) return;
    setActivitiesLoading(true); setActivityError(null);
    try {
      const res = await api.get('/mypage/activities', { params: { size: 20, cursor: activityCursor } });
      const data = res.data.data as ActivityPage;
      setCommunityActivities((previous) => [...previous, ...data.items.map(mapActivity)]);
      setActivityHasNext(data.hasNext); setActivityCursor(data.nextCursor); setVisibleActivityCount((count) => count + 5);
    } catch (err) { setActivityError(requestMessage(err)); }
    finally { setActivitiesLoading(false); }
  };

  const handleActivityScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isNearBottom) {
      loadMoreActivities();
    }
  };

  if (!isOwnProfile && (profileLoading || profileError || !otherUser)) return <div className="p-8"><p role={profileError ? 'alert' : undefined}>{profileError || '프로필을 불러오는 중…'}</p><a href="/dashboard/community">커뮤니티로 돌아가기</a></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {profileError && <p role="alert" className="text-red-500">{profileError}</p>}
      {/* --- Left Column: Profile Card --- */}
      <div className="lg:w-1/3 space-y-6">
        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col items-center text-center">
          {/* Avatar Section */}
          <div className="relative mb-6">
            {isOwnProfile && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            )}
            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-gray-50 dark:ring-border shadow-inner relative">
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 animate-in fade-in duration-200">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                </div>
              )}
              <ImageWithFallback
                src={activeUser?.profileImage || "/defaultUserProfile.png"}
                alt={activeUser?.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isOwnProfile && (
              <button 
                onClick={handleImageClick}
                disabled={isUploadingImage}
                className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100 cursor-pointer"
                title="프로필 사진 수정"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-1 mb-6">
            <div className="group relative flex flex-col items-center">
              {isEditingNickname && isOwnProfile ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200 mb-1">
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNicknameUpdate()}
                    autoFocus
                    placeholder="닉네임 입력"
                    className="text-2xl font-bold text-foreground bg-muted border-b-2 border-primary outline-none px-2 py-0.5 w-48 text-center"
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={handleNicknameUpdate}
                      className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                      title="저장"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingNickname(false);
                        setNewNickname(activeUser?.nickname || "");
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="취소"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-foreground tracking-tight">
                    {activeUser?.nickname || "닉네임을 설정해주세요"}
                  </h1>
                  {isOwnProfile && (
                    <button 
                      onClick={() => {
                        setNewNickname(activeUser?.nickname || "");
                        setIsEditingNickname(true);
                      }}
                      className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="닉네임 수정"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground font-medium">
                @{activeUser?.name || "researcher"}
              </p>
            </div>

            {activeUser?.isExpert && (
              <div className="pt-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                  <ShieldCheck size={12} /> 전문가 인증됨
                </span>
              </div>
            )}
          </div>

          {/* Bio Section */}
          <div className="w-full text-left space-y-2 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                About Me
              </p>
              {!isEditingBio && isOwnProfile && (
                <button 
                  onClick={() => {
                    setNewBio(activeUser?.bio || "");
                    setIsEditingBio(true);
                  }}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
            
            {isEditingBio && isOwnProfile ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full text-sm text-muted-foreground leading-relaxed bg-muted border border-border rounded-xl p-3 outline-none focus:border-primary/30 min-h-25 resize-none"
                  placeholder="자기소개를 입력해주세요."
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setIsEditingBio(false);
                      setNewBio(activeUser?.bio || "");
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleBioUpdate}
                    className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    저장하기
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeUser?.bio || "자기소개를 입력해주세요."}
              </p>
            )}
          </div>

          {/* Account Settings Trigger / Contact Actions */}
          <div className="w-full pt-8">
            {isOwnProfile ? (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-muted text-muted-foreground rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-muted/80 hover:text-foreground transition-all active:scale-[0.98] cursor-pointer"
              >
                <SettingsIcon size={16} /> Account Settings
              </button>
            ) : (
              <div className="space-y-2.5">
                <a
                  href={activeUser?.email ? `mailto:${activeUser.email}` : undefined}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Mail size={16} /> 이메일로 문의하기
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Info List Section */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between group h-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium flex-1">
              <MapPin size={18} className="text-primary shrink-0" />
              {isEditingOrg && isOwnProfile ? (
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOrgUpdate()}
                  autoFocus
                  className="bg-muted border-b border-primary outline-none px-1 w-full text-foreground"
                />
              ) : (
                <span className="truncate">{activeUser?.organization || "소속 정보 없음"}</span>
              )}
            </div>
            {isOwnProfile && (
              <div className="flex items-center gap-1">
                {isEditingOrg ? (
                  <>
                    <button onClick={handleOrgUpdate} className="p-1 text-green-500 hover:bg-green-50 rounded-lg cursor-pointer">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setIsEditingOrg(false)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setNewOrg(activeUser?.organization || "");
                      setIsEditingOrg(true);
                    }}
                    className="p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between group h-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium flex-1">
              <LinkIcon size={18} className="text-primary shrink-0" />
              {isEditingWebsite && isOwnProfile ? (
                <input
                  type="text"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWebsiteUpdate()}
                  autoFocus
                  placeholder="https://example.com"
                  className="bg-muted border-b border-primary outline-none px-1 w-full text-foreground"
                />
              ) : (
                <span className="truncate">{activeUser?.websiteUrl || "웹사이트 정보 없음"}</span>
              )}
            </div>
            {isOwnProfile && (
              <div className="flex items-center gap-1">
                {isEditingWebsite ? (
                  <>
                    <button onClick={handleWebsiteUpdate} className="p-1 text-green-500 hover:bg-green-50 rounded-lg cursor-pointer">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setIsEditingWebsite(false)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setNewWebsite(activeUser?.websiteUrl || "");
                      setIsEditingWebsite(true);
                    }}
                    className="p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <MessageSquare size={18} className="text-primary shrink-0" />
            {activeUser?.contact || "연락처 정보 없음"}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <Calendar size={18} className="text-primary shrink-0" />{' '}
            {activeUser?.createdAt ? (
              isNaN(Date.parse(activeUser.createdAt)) ? (
                activeUser.createdAt.includes('가입') ? activeUser.createdAt : `Joined ${activeUser.createdAt}`
              ) : (
                `Joined ${new Date(activeUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
              )
            ) : (
              "Joined ..."
            )}
          </div>
        </div>
      </div>

      {/* --- Right Column: Content --- */}
      <div className="flex-1 space-y-8">
        {/* My Projects */}
        <section className="bg-card rounded-4xl border border-border shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <AlertTriangle size={20} className="text-primary" /> {isOwnProfile ? "나의 개미집" : `${activeUser?.nickname || "연구자"}님의 프로젝트`}
            </h2>
            {isOwnProfile && (
              <button
                onClick={openProjectVisibilityModal}
                className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="프로젝트 공개 설정"
              >
                <SettingsIcon size={18} />
              </button>
            )}
          </div>

          {displayedProjects.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-dashed border-border">
              <div className="w-16 h-16 bg-muted/60 shadow-sm rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-foreground font-bold mb-1">공개된 프로젝트가 없습니다.</h3>
              <p className="text-muted-foreground text-sm">현재 모두 비공개 상태이거나, 아직 참여 중인 프로젝트가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl overflow-hidden border border-border bg-muted/20"
                >
                  <ImageWithFallback
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-lg font-black text-foreground leading-tight line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasNext && (
            <button
              onClick={() => fetchProfileProjects(nextCursor)}
              disabled={isLoadingProjects}
              className="mt-4 w-full py-3 rounded-xl border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoadingProjects 
                ? "불러오는 중..." 
                : `${Math.max(0, totalCount - projects.length)}개 더보기`}
            </button>
          )}
        </section>

        {/* Community Activities */}
        <section className="bg-card rounded-4xl border border-border shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> {isOwnProfile ? "내 활동" : `${activeUser?.nickname || "연구자"}님의 공개 활동`}
            </h2>

            {isOwnProfile && (
              <button
                onClick={() => setIsCommunityPublic((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  isCommunityPublic
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCommunityPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                {isCommunityPublic ? "숨긴 활동도 보기" : "공개 활동만 보기"}
              </button>
            )}
          </div>

          <div
            className={`max-h-170 overflow-y-auto pr-2 space-y-3 custom-scrollbar transition-opacity ${
              isCommunityPublic ? "opacity-100" : "opacity-100"
            }`}
            onScroll={handleActivityScroll}
          >
            {activityNotice && <p role="status" className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-muted-foreground">{activityNotice}</p>}
            {activityError && <p role="alert" className="text-red-500">{activityError}</p>}
            {activitiesLoading && <p>활동 조회 중…</p>}
            {!activitiesLoading && !activityError && displayedActivities.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                표시할 커뮤니티 활동이 없습니다.
              </p>
            )}

            {displayedActivities.map((activity) => {
              const typeTone =
                activity.type === "showcase"
                  ? "bg-purple-500/10 text-purple-400"
                  : activity.type === "dataset"
                    ? "bg-blue-500/10 text-blue-400"
                    : activity.type === "qna"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-orange-500/10 text-orange-400";

              const leftIconTone =
                activity.type === "showcase"
                  ? "bg-purple-500/10 text-purple-400"
                  : activity.type === "dataset"
                    ? "bg-blue-500/10 text-blue-400"
                    : activity.type === "qna"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-orange-500/10 text-orange-400";

              return (
                <div
                  key={activity.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    activity.isMyPageVisible
                      ? "border-border bg-card hover:border-primary/30"
                      : "border-border/60 bg-muted/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${leftIconTone}`}
                    >
                      {activity.type === "showcase" && <Award size={20} />}
                      {activity.type === "dataset" && <Database size={20} />}
                      {activity.type === "qna" && <HelpCircle size={20} />}
                      {activity.type === "recruiting" && <Users size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide ${typeTone}`}
                          >
                            {{ showcase: "레시피", dataset: "데이터셋", qna: "질문", recruiting: "모집" }[activity.type]}
                          </span>
                          <h3 className="w-full pt-1 text-lg font-bold text-foreground break-words leading-snug">
                            {activity.title}
                          </h3>
                          {activity.isExpertVerified && (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-primary text-white whitespace-nowrap">
                              전문가
                            </span>
                          )}
                        </div>


                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center gap-5 pt-3 text-xs font-bold text-muted-foreground">
                        <span>{activity.timestamp}</span>
                        {(activity.stats?.likes ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-red-400">
                            <Heart size={13} fill="currentColor" />{" "}
                            {activity.stats?.likes}
                          </span>
                        )}
                        {(activity.stats?.downloads ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-green-500">
                            <Upload size={13} /> {activity.stats?.downloads}
                          </span>
                        )}
                        {(activity.stats?.comments ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare size={13} />{" "}
                            {activity.stats?.comments}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {activity.isMyPageVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{!activity.isPublic ? '비공개 글은 프로필에 표시할 수 없어요' : activity.isMyPageVisible ? '방문자에게 보이는 활동' : '나에게만 보이는 활동'}</span>
                      </div>
                      <label className="inline-flex items-center gap-3 text-xs font-medium text-muted-foreground">
                        프로필에 표시
                        <button
                          type="button"
                          role="switch"
                          aria-checked={activity.isMyPageVisible}
                          aria-label={`${activity.title} 프로필에 표시`}
                          disabled={savingVisibility || !activity.isPublic}
                          onClick={() => saveActivityVisibility(activity.id, !activity.isMyPageVisible)}
                          className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-40 ${activity.isMyPageVisible ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        >
                          <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${activity.isMyPageVisible ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}

            {hasMoreActivities && (
              <button
                onClick={loadMoreActivities}
                className="w-full py-3 rounded-xl border border-border text-muted-foreground font-bold hover:bg-muted transition-colors"
              >
                {activitiesLoading ? '불러오는 중…' : '활동 더 보기'}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Project Visibility Modal */}
      {showProjectVisibilityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-4xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                프로젝트 공개 설정
              </h2>
              <button
                onClick={() => setShowProjectVisibilityModal(false)}
                className="p-2.5 hover:bg-muted rounded-xl transition-all"
              >
                <X size={22} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-8 space-y-5 overflow-y-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                프로필에 표시할 프로젝트를 선택하고 순서를 관리하세요. 비공개로
                설정한 프로젝트는 다른 사용자에게 표시되지 않습니다.
              </p>
              <p className="text-xs text-muted-foreground">
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
                    className={`flex items-center gap-4 p-4 bg-muted rounded-2xl border transition-colors ${
                      draggingProjectId === project.id
                        ? "border-primary/40 bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <ImageWithFallback
                      src={project.coverImage}
                      alt={project.title}
                      className="w-18 h-12 rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black text-foreground truncate">
                        {project.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.role}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleDraftProjectVisibility(project.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm transition-colors ${
                        project.isPublic
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-200 text-muted-foreground"
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

            <div className="px-8 py-5 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowProjectVisibilityModal(false)}
                className="px-6 py-3 rounded-xl text-muted-foreground font-bold hover:bg-muted transition-colors"
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

      {/* --- Settings Modal (Verification, Account) --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">
                계정 설정
              </h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2.5 hover:bg-muted rounded-xl transition-all"
              >
                <X size={24} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-8 border-b border-border flex gap-8 bg-muted/30">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id)}
                  className={`pb-4 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all relative ${
                    settingsTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
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
                      <p className="text-xs text-amber-700 max-w-sm mx-auto font-medium leading-relaxed bg-card border border-amber-200/50 px-4 py-3 rounded-2xl">
                        첨부하신 의료 면허증 또는 학위 증명서 검토에는 **영업일 기준 1~3일**이 소요됩니다. 심사가 완료되면 결과가 메일 등으로 통보됩니다.
                      </p>
                    </div>
                  ) : (
                    /* Case 3: Apply / None / Rejected status */
                    <div className="space-y-6">
                      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 space-y-4">
                        <div className="flex gap-4">
                          <div className="p-3 bg-card border border-primary/20 text-primary rounded-2xl shadow-sm h-fit">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-foreground mb-1">의료 및 학위 전문가 신청</h4>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                              의료진, 관련 학계 연구자 등 전문 지식을 인증받아 신뢰받는 기여를 시작해보세요. 의료 면허증 또는 학위 증명서를 첨부하여 인증을 요청할 수 있습니다.
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">지원 대상서류</p>
                          <ul className="text-xs text-muted-foreground font-medium space-y-2 pl-4 list-disc">
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
                            : 'border-border hover:border-primary/50 hover:bg-muted'
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
                            <div className="p-4 bg-card border border-primary/20 text-primary rounded-2xl shadow-sm inline-flex items-center justify-center">
                              <Upload size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground break-all">{expertFile.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{(expertFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpertFile(null);
                              }}
                              className="px-4 py-2 bg-muted hover:bg-gray-200 text-foreground text-xs font-bold rounded-xl transition-all"
                            >
                              파일 재선택
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-muted text-muted-foreground border border-border rounded-2xl inline-flex items-center justify-center">
                              <Upload size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">인증 서류 파일 업로드</p>
                              <p className="text-xs text-muted-foreground mt-1">
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
                  <div className="p-8 bg-muted rounded-3xl border border-border inline-block mx-auto min-w-62.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-widest">
                      연동된 이메일
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div className="pt-6 space-y-4">
                    <button
                      onClick={() => {
                        logout();
                        setShowSettingsModal(false);
                      }}
                      className="w-full py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut size={20} /> 로그아웃 (Sign Out)
                    </button>

                    <div className="pt-4 border-t border-border">
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
