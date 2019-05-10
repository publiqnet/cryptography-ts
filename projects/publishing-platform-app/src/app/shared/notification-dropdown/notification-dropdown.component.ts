import { Component, OnInit, Output, EventEmitter, ElementRef, AfterViewChecked, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserNotificationService } from '../../core/services/user-notification.service';
import { UserNotification } from '../../core/services/models/UserNotification';
import { UserNotificationType } from '../../core/models/enumes';
import { PublicationService } from '../../core/services/publication.service';
import { WalletService } from '../../core/services/wallet.service';
import { Publication } from '../../core/services/models/publication';

@Component({
    selector: 'app-notification-dropdown',
    templateUrl: './notification-dropdown.component.html',
    styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit, AfterViewChecked, OnDestroy {
    @Output('changeNote') noteHideEmitter: EventEmitter<any> = new EventEmitter();
    @Output('unreadCount') unreadCountEmitter: EventEmitter<any> = new EventEmitter();
    @Input() disableScroll;


    start = 0;
    width = 320;
    end = 10;
    unreadCount: number;
    userPage = false;
    loadContent = false;
    time: any[];
    scrollElement = null;
    config = {
        handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch']
    };

    userNotifications: UserNotification[];
    private unsubscribe$ = new ReplaySubject<void>(1);

    emitHide = () => {
        this.noteHideEmitter.emit(null);
    }


    constructor(
        public userNotificationService: UserNotificationService,
        private router: Router,
        private el: ElementRef,
        public publicationsService: PublicationService,
        private walletService: WalletService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        if (window.innerWidth < 768) {
            this.width = window.innerWidth;
        }
        // load the initial batch of notifications and create a stream
        this.userNotificationService.loadNotifications()
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe();

        // subscribe to the notification changes
        this.userNotificationService.notificationsChanged$
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe(
            () => {
                this.unreadCount = this.userNotificationService.unreadCount;
                this.userNotifications = this.userNotificationService.userNotifications;
                this.unreadCountEmitter.emit(this.unreadCount);
            }
        );
    }

    deleteNotification(uNotification: UserNotification): void {
        this.userNotificationService.deleteNotification(uNotification);
    }

    readAll(event?): void {
        event.stopPropagation();
        this.userNotificationService.readAllNotifications();
    }

    toggleStatus(uNotification: UserNotification, event?) {
        event.stopPropagation();
        this.userNotificationService.toggleStatus(
            uNotification,
            !uNotification.isRead
        );
    }

    goNotificationPage(uNotification: UserNotification): void {

        this.userNotificationService.toggleStatus(uNotification, true);

        if (
            [
                UserNotificationType.NEW_ARTICLE,
                UserNotificationType.REPORTED_ARTICLE,
                UserNotificationType.PUBLICATION_NEW_ARTICLE
            ].includes(uNotification.type.keyword) &&
            uNotification.data
        ) {
            this.router.navigate([`/s/${uNotification.data}`]);
        } else if (uNotification.type.keyword === UserNotificationType.PUBLICATION_INVITATION_NEW) {
            this.publicationsService.tabIndexInv = 2;
            this.router.navigate([`/p/my-publications`]);
        } else if (uNotification.type.keyword === UserNotificationType.PUBLICATION_REQUESTS) {
            this.publicationsService.tabIndexReq = 3;
            this.router.navigate([
                `/p/${uNotification.publication.slug}`
            ]);
        } else if (uNotification.type.keyword === UserNotificationType.NEW_TRANSFER) {
            this.walletService.selectedTabIndex = this.walletService.tabs.transaction;
            this.router.navigate([`/wallet`]);
        }

        this.emitHide();
    }

    getPerformerLink(notify: UserNotification) {
        // this probably should be fixed, but is the only way for now
        let name = '';
        if (notify.performer.firstName) {
            name += notify.performer.firstName;
        }
        if (name && notify.performer.lastName) {
            name += ` ${notify.performer.lastName}`;
        }

        name = name || notify.performer.publicKey;
        return `<a href="/a/${notify.performer.publicKey}">${name}</a>`;
    }

    getPublicationLink(pub: Publication) {
        return `<a href="/p/${pub.slug}">${pub.title}</a>`;
    }

    onImageNotFound(uNotification: UserNotification): void {
        uNotification.performer.image = '';
    }

    ngAfterViewChecked(): void {
        // should be changed to hostlistener
        if (
            this.el.nativeElement.querySelector('.inner-ul') &&
            !this.scrollElement &&
            !this.disableScroll
        ) {
            this.scrollElement = this.el.nativeElement.querySelector('.inner-ul');
            this.scrollElement.addEventListener(
                'scroll',
                this.scroll.bind(this),
                true
            );
        } else if (
            this.el.nativeElement.querySelector('.inner-ul') &&
            this.disableScroll &&
            !this.scrollElement
        ) {
            this.scrollElement = this.el.nativeElement.parentNode;
            document.addEventListener('scroll', this.scroll.bind(this), true);
        }
    }

    scroll(event): void {
        if (
            (event.target.scrollingElement &&
                event.target.scrollingElement.offsetHeight +
                event.target.scrollingElement.scrollTop ==
                event.target.scrollingElement.scrollHeight) ||
            event.target.offsetHeight + event.target.scrollTop >
            event.target.scrollHeight
        ) {
            // -1 means there are no more notifications to load
            if (this.userNotificationService.notificationPage === -1) {
                return;
            }

            // show loading spinner and get older notifications
            this.loadContent = true;
            this.userNotificationService.loadNotifications().subscribe({
                // hide spinner no matter what
                complete: () => {
                    this.loadContent = false;
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.unsubscribe$.next();
            this.unsubscribe$.complete();
            this.userNotificationService.reset();
        }
    }
}
