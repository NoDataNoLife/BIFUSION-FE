import api from './axios';
import type { NotificationItem } from '../store/useNotificationStore';
export async function respondToInvitation(invitation: NonNullable<NotificationItem['invitation']>, action: 'ACCEPT' | 'REJECT') {
  if (invitation.status !== 'PENDING' || !Number.isSafeInteger(invitation.projectId) || invitation.projectId <= 0 || !Number.isSafeInteger(invitation.invitationId) || invitation.invitationId <= 0) throw new Error('응답할 수 없는 초대입니다. 알림을 새로고침해 주세요.');
  const response = await api.patch(`/projects/${invitation.projectId}/invitations/${invitation.invitationId}`, { action });
  if (response.data?.success === false) throw new Error(response.data.message || '초대에 응답하지 못했습니다.');
}
