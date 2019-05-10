import { Publication } from './publication';
import { UserNotificationType } from '../../models/enumes';
import { environment } from '../../../../environments/environment';


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

export interface UserNotificationOptions {
  id?: number;
  isRead?: boolean;
  performer?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    publicKey?: string;
    image?: string;
  };
  data?: {};
  type?: { keyword: UserNotificationType; bodyEn: string; bodyJp?: string };
  created_at?: number;
  publication?: Publication;
}

export class UserNotification {
  id?: number;
  isRead?: boolean;
  performer?: {
    id: number;
    firstName?: string;
    lastName?: string;
    publicKey?: string;
    image?: string;
  };
  data?: {};
  type?: { keyword: UserNotificationType; bodyEn: string; bodyJp?: string };
  created_at?: number;
  publication?: Publication;

  constructor(options?: UserNotificationOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        this[i] = options[i];
      }
    }

    this['performer']['image'] = this['performer']['image'] ? environment.backend + '/' + this['performer']['image'] : '';
  }
}

export interface UserNotificationResponse {
  unreadCount?: number;
  notifications?: UserNotification[];
}
