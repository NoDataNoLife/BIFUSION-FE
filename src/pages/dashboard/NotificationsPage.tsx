import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Search, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight,
  Info,
  XCircle,
  Clock
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 
    | 'AUGMENTATION_SUCCESS' 
    | 'AUGMENTATION_FAILED' 
    | 'PROJECT_INVITATION' 
    | 'INVITATION_ACCEPTED' 
    | 'INVITATION_REJECTED' 
    | 'EXPERT_APPROVED' 
    | 'EXPERT_REJECTED' 
    | 'RECIPE_REVIEW_REQUESTED' 
    | 'RECIPE_APPROVED' 
    | 'RECIPE_REJECTED' 
    | 'RECIPE_REVIEW' 
    | 'SYSTEM';
  category: 'AUGMENTATION' | 'PROJECT' | 'EXPERT' | 'COMMUNITY' | 'SYSTEM';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  isDeleted?: boolean;
  actionUrl?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-001',
    type: 'RECIPE_APPROVED',
    category: 'EXPERT',
    title: '레시피 검수 승인 완료',
    description: '요청하신 "고해상도 흉부 CT 노이즈 감소 파이프라인"의 전문가 검수가 최종 승인되었습니다.',
    timestamp: '10분 전',
    isRead: false,
    actionUrl: '/dashboard/expert',
  },
  {
    id: 'notif-002',
    type: 'PROJECT_INVITATION',
    category: 'PROJECT',
    title: '새로운 팀 프로젝트 초대',
    description: '김연구자님이 "폐 질환 AI 진단 멀티모달 프로젝트" 팀원으로 초대했습니다.',
    timestamp: '1시간 전',
    isRead: false,
    actionUrl: '/dashboard/community',
  },
  {
    id: 'notif-003',
    type: 'AUGMENTATION_SUCCESS',
    category: 'AUGMENTATION',
    title: '데이터 증강 작업 완료',
    description: 'Job #AUG-8921의 합성 데이터 500장이 성공적으로 생성 및 저장되었습니다.',
    timestamp: '3시간 전',
    isRead: true,
    actionUrl: '/dashboard/assets',
  },
  {
    id: 'notif-004',
    type: 'RECIPE_REVIEW',
    category: 'COMMUNITY',
    title: '새로운 레시피 리뷰/댓글',
    description: '이선우님이 회원님의 연구 쇼케이스에 새로운 검증 피드백을 남겼습니다.',
    timestamp: '어제',
    isRead: true,
    actionUrl: '/dashboard/community',
  },
  {
    id: 'notif-005',
    type: 'EXPERT_APPROVED',
    category: 'EXPERT',
    title: '의료 전문가 인증 승인',
    description: '제출하신 전문의 자격 증빙이 승인되어 이제 검수관으로 활동하실 수 있습니다.',
    timestamp: '2일 전',
    isRead: true,
    actionUrl: '/dashboard/expert',
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'AUGMENTATION_SUCCESS':
        return <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl"><Sparkles size={20} /></div>;
      case 'AUGMENTATION_FAILED':
        return <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl"><XCircle size={20} /></div>;
      case 'PROJECT_INVITATION':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        return <div className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl"><Users size={20} /></div>;
      case 'EXPERT_APPROVED':
      case 'RECIPE_APPROVED':
      case 'RECIPE_REVIEW_REQUESTED':
        return <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl"><ShieldCheck size={20} /></div>;
      case 'EXPERT_REJECTED':
      case 'RECIPE_REJECTED':
        return <div className="p-3 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-2xl"><Info size={20} /></div>;
      case 'RECIPE_REVIEW':
        return <div className="p-3 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-2xl"><MessageSquare size={20} /></div>;
      default:
        return <div className="p-3 bg-muted text-muted-foreground border border-border rounded-2xl"><Bell size={20} /></div>;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    handleMarkAsRead(item.id);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (item.isDeleted) return false;
    if (filterUnreadOnly && item.isRead) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isDeleted).length;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            알림 기록
          </h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            진행 중인 작업, 팀 협업, 전문가 검증 등 모든 알림을 확인하고 관리하세요.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-5 py-3 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-2xl font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <CheckCheck size={16} /> 모두 읽음 처리
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="알림 제목 또는 내용을 검색하세요..."
            className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-3xl shadow-xs text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
          />
        </div>

        {/* Category Pills & Unread Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: '전체' },
              { id: 'EXPERT', label: '전문가/검수' },
              { id: 'AUGMENTATION', label: '데이터 증강' },
              { id: 'PROJECT', label: '팀/프로젝트' },
              { id: 'COMMUNITY', label: '커뮤니티' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterUnreadOnly}
              onChange={(e) => setFilterUnreadOnly(e.target.checked)}
              className="w-4 h-4 text-primary rounded-md border-border focus:ring-primary"
            />
            <span>읽지 않은 알림만 보기 ({unreadCount})</span>
          </label>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="py-24 text-center bg-card rounded-[2.5rem] border border-border space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mx-auto text-muted-foreground">
              <Bell size={28} />
            </div>
            <h3 className="text-lg font-bold text-foreground">표시할 알림이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              새로운 소식이 도착하면 이곳에 안전하게 기록됩니다.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-start gap-5 group relative ${
                !item.isRead
                  ? 'bg-card border-primary/30 shadow-md shadow-primary/5 hover:border-primary'
                  : 'bg-card/70 border-border hover:bg-card hover:border-border/80'
              }`}
            >
              {/* Unread Indicator Dot */}
              {!item.isRead && (
                <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-primary/20 animate-pulse" />
              )}

              {/* Icon */}
              {getNotificationIcon(item.type)}

              {/* Content */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-3 mb-1">
                  <h3
                    className={`text-base font-black leading-tight ${
                      !item.isRead ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Clock size={12} /> {item.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-3">
                  {item.description}
                </p>

                {item.actionUrl && (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-primary group-hover:underline">
                    바로가기 <ArrowRight size={13} />
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                {!item.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(item.id);
                    }}
                    title="읽음 표시"
                    className="p-2.5 bg-muted hover:bg-green-50 hover:text-green-600 rounded-xl text-muted-foreground transition-colors cursor-pointer"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(item.id);
                  }}
                  title="알림 삭제"
                  className="p-2.5 bg-muted hover:bg-red-50 hover:text-red-600 rounded-xl text-muted-foreground transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
