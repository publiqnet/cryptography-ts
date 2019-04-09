import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { interval, Subscription, Subject, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AccountService } from './account.service';
import {
  UserNotificationResponse,
  UserNotification
} from './models/UserNotification';
import { ErrorService } from './error.service';
import { UserNotificationType } from '../models/enumes';


@Injectable()
export class UserNotificationService {
  readonly apiUrl: string = `${environment.backend}/api/v1`;
  readonly streamIntervalSeconds: number = 30;
  notificationPage = 0;
  unreadCount = 0;
  userNotifications: UserNotification[] = [];

  // =====DO NOT GIVE A DEFAULT VALUE!!!============
  streamSubscription: Subscription;
  // ===============================================
  notificationsChanged$: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private errorService: ErrorService
  ) { }

  loadNotifications(limit = 10, order = 'DESC'): Observable<boolean> {
    if (this.notificationPage < 0) {
      // if in some unknown case the page stays -1
      return of(false);
    }
    return this.doRequest(
      'GET',
      `/user-notification`,
      null,
      new HttpParams()
        .set('page', this.notificationPage.toString())
        .set('limit', limit.toString())
        .set('order', order)
    ).pipe(
      map(this.normalizeNotifications.bind(this)),
      map((response: UserNotificationResponse) => {
        this.notificationPage = response.userNotifications.length
          ? ++this.notificationPage
          : -1;

        this.unreadCount = response.unreadCount;
        this.userNotifications = this.userNotifications.concat(
          response.userNotifications
        );
        this.notificationsChanged$.next();

        // ask for new notifications every x seconds
        this.startStream(this.streamIntervalSeconds);
        return true;
      }),
      catchError(error => {
        // catch the error in the pipe, handle it, but still return a result like nothing happened
        this.errorService.handleError('loadNotifications', error);
        return of(false);
      })
    );
  }

  loadNewNotifications(): void {
    const lastId = this.userNotifications.length
      ? this.userNotifications[0].id
      : 0;

    this.doRequest('GET', `/user-notification/new/${lastId}`)
      .pipe(map(this.normalizeNotifications.bind(this)))
      .subscribe(
        (response: UserNotificationResponse) => {
          this.unreadCount =
            this.unreadCount + response.userNotifications.length;
          this.userNotifications = response.userNotifications.concat(
            this.userNotifications
          );
          this.notificationsChanged$.next();
        },
        error => this.errorService.handleError('loadNewNotifications', error)
      );
  }

  readAllNotifications(): void {
    this.userNotifications.forEach((uNot: UserNotification) => {
      uNot.isRead = true;
    });

    this.unreadCount = 0;
    this.notificationsChanged$.next();

    this.doRequest('POST', `/user-notification`).subscribe(null, error =>
      this.errorService.handleError('readAllNotifications', error)
    );
  }

  deleteNotification(uNotification: UserNotification): void {
    if (uNotification.isRead === false) {
      this.unreadCount--;
    }
    this.userNotifications = this.userNotifications.filter(
      (uNot: UserNotification) => {
        return uNot.id != uNotification.id;
      }
    );
    this.notificationsChanged$.next();

    this.doRequest(
      'DELETE',
      `/user-notification/${uNotification.id}`
    ).subscribe(null, error =>
      this.errorService.handleError('deleteNotification', error)
    );
  }

  toggleStatus(uNotification: UserNotification, readStatus: boolean): void {
    if (uNotification.isRead !== readStatus) {
      uNotification.isRead = readStatus;
      readStatus ? this.unreadCount-- : this.unreadCount++;
      this.notificationsChanged$.next();
    }

    this.doRequest(
      'POST',
      `/user-notification/${readStatus ? '' : 'unread/'}${uNotification.id}`
    ).subscribe(null, error =>
      this.errorService.handleError('unreadSingle', error)
    );
  }

  reset(): void {
    this.userNotifications = [];
    this.unreadCount = 0;
    this.notificationPage = 0;
    this.notificationsChanged$.next();
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }

  private normalizeNotifications(response: UserNotificationResponse): UserNotificationResponse {
    let hasRecivedTransfer = false;
    response.userNotifications.forEach((uNot: UserNotification) => {
      // fix broken image field
      if (
        !uNot.notification.performer.image
        || uNot.notification.performer.image.startsWith('http://127.0.0.1')
      ) {
        uNot.notification.performer.image = '';
      }
      // if the notification type is 'transfer'
      if (uNot.notification.type.id === UserNotificationType.NEW_TRANSFER) {
        hasRecivedTransfer = true;
        // hide user's name
        // uNot.notification.performer.firstName = '';
        // uNot.notification.performer.lastName = '';
      }
    });
    if (hasRecivedTransfer && this.streamSubscription) {
      this.accountService.loadBalance();
    }
    return response;
  }

  private getAccountToken() {
    return this.accountService.accountInfo &&
      this.accountService.accountInfo.token
      ? this.accountService.accountInfo.token
      : null;
  }

  private doRequest(method: string, path: string, body: {} = null, params?: HttpParams): Observable<Object> {
    return this.http.request(method, `${this.apiUrl}${path}`, {
      headers: new HttpHeaders({ 'X-API-TOKEN': this.getAccountToken() }),
      body,
      params
    });
  }

  private startStream(streamIntervalSeconds: number): void {
    if (!this.streamSubscription) {
      this.streamSubscription = interval(streamIntervalSeconds * 1000).subscribe(
        () => {
          this.loadNewNotifications();
        }
      );
    }
  }
}
