import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XCircle, 
  Users, 
  Bell, 
  MessageCircle, 
  X, 
  Check,
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useNotificationStore, type NotificationItem } from '../../store/useNotificationStore';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    softDeleteNotification 
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'AUGMENTATION_SUCCESS':
        return <div className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl shrink-0"><Sparkles className="w-5 h-5" /></div>;
      case 'AUGMENTATION_FAILED':
        return <div className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl shrink-0"><XCircle className="w-5 h-5" /></div>;
      case 'PROJECT_INVITATION':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        return <div className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl shrink-0"><Users className="w-5 h-5" /></div>;
      case 'EXPERT_APPROVED':
      case 'RECIPE_APPROVED':
      case 'DATASET_VERIFIED':
      case 'AUGMENTATION_INSPECTION_APPROVED':
        return <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl shrink-0"><ShieldCheck className="w-5 h-5" /></div>;
      case 'EXPERT_REJECTED':
      case 'RECIPE_REJECTED':
      case 'DATASET_VERIFY_REJECTED':
      case 'AUGMENTATION_INSPECTION_REJECTED':
        return <div className="p-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl shrink-0"><Info className="w-5 h-5" /></div>;
      case 'RECIPE_REVIEW':
      case 'QNA_ANSWERED':
      case 'RECRUITMENT_APPLY':
      case 'RECRUITMENT_ACCEPTED':
      case 'RECRUITMENT_REJECTED':
        return <div className="p-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-xl shrink-0"><MessageCircle className="w-5 h-5" /></div>;
      default:
        return <div className="p-2 bg-muted text-muted-foreground border border-border rounded-xl shrink-0"><Bell className="w-5 h-5" /></div>;
    }
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (diff < 60) return '방금 전';
      if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const resolveTargetLink = (item: NotificationItem) => {
    switch (item.type) {
      case 'AUGMENTATION_SUCCESS':
      case 'AUGMENTATION_FAILED':
        return item.targetId ? `/dashboard/projects/${item.targetId}` : '/dashboard/projects';
      case 'PROJECT_INVITATION':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        return '/dashboard/projects';
      case 'EXPERT_APPROVED':
      case 'EXPERT_REJECTED':
        return '/dashboard/profile';
      case 'AUGMENTATION_INSPECTION_APPROVED':
      case 'AUGMENTATION_INSPECTION_REJECTED':
      case 'RECIPE_REVIEW_REQUESTED':
      case 'RECIPE_APPROVED':
      case 'RECIPE_REJECTED':
        return '/dashboard/expert';
      case 'RECIPE_REVIEW':
      case 'QNA_ANSWERED':
      case 'RECRUITMENT_APPLY':
      case 'RECRUITMENT_ACCEPTED':
      case 'RECRUITMENT_REJECTED':
        return '/dashboard/community';
      default:
        return '/dashboard/notifications';
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.notificationId);
    onClose();
    const link = resolveTargetLink(item);
    navigate(link);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    softDeleteNotification(notificationId);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Notification Panel */}
      <div className="absolute top-16 right-8 w-105 bg-card rounded-[2.5rem] shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              알림 센터 <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">{unreadCount}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => markAllAsRead()}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-primary transition-all cursor-pointer"
              title="모두 읽음 처리"
            >
              <Check className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-125 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.notificationId}
                onClick={() => handleItemClick(notification)}
                className={`group relative p-4 rounded-3xl transition-all cursor-pointer flex gap-4 items-start ${
                  notification.isRead ? 'opacity-60 bg-muted/20 border border-border' : 'bg-card shadow-sm border border-border hover:border-primary/40'
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-black text-foreground truncate tracking-tight">{notification.title}</h4>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getRelativeTime(notification.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">{notification.content}</p>
                  
                  {!notification.isRead && (
                    <div className="mt-3 flex justify-end">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Soft Delete Action Button */}
                <button
                  onClick={(e) => handleDelete(e, notification.notificationId)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted text-muted-foreground hover:text-red-500 rounded-lg transition-all absolute top-3 right-3 cursor-pointer"
                  title="알림 삭제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-muted text-muted-foreground rounded-3xl flex items-center justify-center mx-auto">
                <Bell size={32} />
              </div>
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">새로운 알림이 없습니다</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <button 
          onClick={() => {
            onClose();
            navigate('/dashboard/notifications');
          }}
          className="w-full py-5 bg-muted/40 border-t border-border text-xs font-black text-muted-foreground hover:text-primary hover:bg-muted transition-all uppercase tracking-widest cursor-pointer"
        >
          전체 알림 기록 보기
        </button>
      </div>
    </>
  );
}
