import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Bell, 
  Star, 
  MessageCircle, 
  X, 
  Check
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'job_complete' | 'job_failed' | 'team_invite' | 'system_notice' | 'expert_review' | 'comment';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNotifications: Notification[] = [
  {
    id: 'NOT-001',
    type: 'job_complete',
    title: '데이터 증강 작업 완료',
    description: 'Lung Cancer Detection 프로젝트의 증강 작업 10개가 성공적으로 완료되었습니다.',
    timestamp: new Date(),
    isRead: false,
    link: '/dashboard/projects/1/jobs/JOB-001/result',
  },
  {
    id: 'NOT-002',
    type: 'team_invite',
    title: '새로운 팀 초대',
    description: '조현희님이 "Brain MRI Analysis" 프로젝트에 초대했습니다.',
    timestamp: new Date(),
    isRead: false,
    link: '/dashboard/projects',
  },
  {
    id: 'NOT-003',
    type: 'expert_review',
    title: '전문가 인증 승인 완료',
    description: '제출하신 전문가 인증이 검수 완료되어 승인되었습니다.',
    timestamp: new Date(),
    isRead: true,
    link: '/dashboard/profile',
  },
  {
    id: 'NOT-004',
    type: 'comment',
    title: '새로운 댓글',
    description: '김성한님이 "High-Res Enhancement" 레시피에 댓글을 남겼습니다.',
    timestamp: new Date(),
    isRead: true,
    link: '/dashboard/community',
  },
  {
    id: 'NOT-005',
    type: 'job_failed',
    title: '작업 실패',
    description: 'CT Scan 프로젝트의 증강 작업 2개가 실패했습니다. 로그를 확인해주세요.',
    timestamp: new Date(),
    isRead: true,
  },
];

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_complete':
        return <div className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl"><CheckCircle className="w-5 h-5" /></div>;
      case 'job_failed':
        return <div className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl"><XCircle className="w-5 h-5" /></div>;
      case 'team_invite':
        return <div className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl"><Users className="w-5 h-5" /></div>;
      case 'expert_review':
        return <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl"><Star className="w-5 h-5" /></div>;
      case 'comment':
        return <div className="p-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-xl"><MessageCircle className="w-5 h-5" /></div>;
      default:
        return <div className="p-2 bg-muted text-muted-foreground border border-border rounded-xl"><Bell className="w-5 h-5" /></div>;
    }
  };

  const getRelativeTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return date.toLocaleDateString();
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Notification Panel */}
      <div className="absolute top-16 right-8 w-[420px] bg-card rounded-[2.5rem] shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              알림 센터 <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">{notifications.filter(n => !n.isRead).length}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={markAllAsRead}
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
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => {
                  if (notification.link) {
                    onClose();
                    navigate(notification.link);
                  }
                }}
                className={`group p-4 rounded-3xl transition-all cursor-pointer flex gap-4 items-start ${
                  notification.isRead ? 'opacity-60 bg-muted/20 border border-border' : 'bg-card shadow-sm border border-border hover:border-primary/40'
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-black text-foreground truncate tracking-tight">{notification.title}</h4>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getRelativeTime(notification.timestamp)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">{notification.description}</p>
                  
                  {!notification.isRead && (
                    <div className="mt-3 flex justify-end">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
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
