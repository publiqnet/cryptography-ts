import { Publication } from './publication';

export interface Notification {
  performer: {
    id: number;
    firstName?: string;
    lastName?: string;
    publiqId: string;
    username: string;
    image: string;
  };
  data: {};
  type: { id: number; body: string; link?: string };
  created_at: number;
  publication: Publication;
}

export interface UserNotification {
  id: number;
  isRead: boolean;
  notification: Notification;
}

export interface UserNotificationResponse {
  unreadCount?: number;
  userNotifications?: UserNotification[];
}
