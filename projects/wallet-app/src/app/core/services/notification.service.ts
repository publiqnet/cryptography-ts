import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export enum NotificationTypeList {
    success,
    error,
    info,
    warning
}

export interface Notification {
    message: string;
    type: NotificationTypeList;
}

@Injectable()
export class NotificationService {

    /**
     * @type {Subject<Notification>}
     */
    public message = new Subject<Notification>();

    success(messageText: string) {
        this.message.next({message: messageText, type: NotificationTypeList.success});
    }

    error(messageText: string) {
        this.message.next({message: messageText, type: NotificationTypeList.error});
    }

    info(messageText: string) {
        this.message.next({message: messageText, type: NotificationTypeList.info});
    }

    warning(messageText: string) {
        this.message.next({message: messageText, type: NotificationTypeList.warning});
    }
}
