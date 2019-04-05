import { NotificationStatus } from '../enumes';

export interface INotification {
    message: string;
    type: NotificationStatus;
}
