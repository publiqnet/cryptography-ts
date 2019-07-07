import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NotificationService, NotificationTypeList } from '../services/notification.service';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ContentService } from '../services/content.service';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit, OnDestroy {
  account: any = true;
  navIsFixed: boolean;
  isBrowser = false;
  public loading = false;
  private actionClass: string;
  hideFooter = false;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private contentService: ContentService,
    private notification: NotificationService,
    private snackBar: MatSnackBar,
    private accountService: AccountService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      this.hideFooter = false;

      this.notification.message
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
            if (data.type === NotificationTypeList.success) {
              this.actionClass = 'notification-success';
            } else if (data.type === NotificationTypeList.error) {
              this.actionClass = 'notification-error';
            } else if (data.type === NotificationTypeList.info) {
              this.actionClass = 'notification-info';
            } else if (data.type === NotificationTypeList.warning) {
              this.actionClass = 'notification-warning';
            } else if (data.type === NotificationTypeList.autoSave) {
              this.actionClass = 'notification-autoSave';
            }

            setTimeout(() => this.openSnackBar(data.message, ''));
          }
        );

      this.accountService.accountUpdated$
        .subscribe(result => {
          this.account = Boolean(result);
        });

      this.contentService.hideFooter$
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(visibility => this.hideFooter = visibility);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      if (
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop > 100
      ) {
        this.navIsFixed = true;
      } else if (
        (this.navIsFixed && window.pageYOffset) ||
        document.documentElement.scrollTop ||
        document.body.scrollTop < 10
      ) {
        this.navIsFixed = false;
      }
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      (function smoothScroll() {
        const currentScroll =
          document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(smoothScroll);
          window.scrollTo(0, currentScroll - currentScroll / 5);
        }
      })();
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, <MatSnackBarConfig>{
      duration: 3000,
      panelClass: [this.actionClass]
    });
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
