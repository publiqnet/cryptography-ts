import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Optional } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Account } from '../../core/services/models/account';
import { NotificationService } from '../../core/services/notification.service';
import { AccountService } from '../../core/services/account.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { Content } from '../../core/services/models/content';
import { DialogService } from '../../core/services/dialog.service';
import { ContentService } from '../../core/services/content.service';
import { DraftData } from '../../core/services/models/draft';
import { DraftService } from '../../core/services/draft.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { UtilService } from '../../core/services/util.service';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss']
})
export class AuthorComponent implements OnInit, OnDestroy {

  public isMasonryLoaded = false;
  public myOptions: NgxMasonryOptions = {
    transitionDuration: '0s',
    itemSelector: '.story--grid',
    gutter: 10
  };
  private authorId: string;
  shortName;
  loadingAuthor = true;
  avatarUrl: string;
  canFollow = true;
  isCurrentUser = false;
  articlesLoaded = false;
  public publishedContent: Content[] = [];
  public loading = true;
  listType = 'grid';
  public drafts: Array<any>;
  private unsubscribe$ = new ReplaySubject<void>(1);
  selectedTab: string;
  tabs = [
    {
      'value': '1',
      'text': 'Stories',
      'active': false
    },
    {
      'value': '2',
      'text': 'Drafts',
      'active': true
    }
  ];
  author: Account;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notification: NotificationService,
    private accountService: AccountService,
    public dialogService: DialogService,
    private errorService: ErrorService,
    private contentService: ContentService,
    private draftService: DraftService,
    public utilService: UtilService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        debounceTime(500),
        switchMap((params: Params) => {
          this.authorId = params['id'];
          return this.accountService.accountUpdated$;
        }),
        switchMap((data: any) => {
          if (this.authorId === 'undefined') {
            this.router.navigate(['/']);
            return;
          }
          return this.accountService.getAuthorByPublicKey(this.authorId);
        }),
        switchMap((author: Account) => {
          this.author = author;
          if (this.author.image) {
            this.avatarUrl = this.author.image;
          }
          this.shortName = this.author.shortName ? this.author.shortName : '';
          this.canFollow = this.author.isSubscribed == 0 || this.author.isSubscribed == -1;
          this.loadingAuthor = false;
          this.articlesLoaded = true;
          if (this.accountService.loggedIn() && this.author && this.accountService.accountInfo.publicKey == this.author.publicKey) {
            this.isCurrentUser = true;
            return this.contentService.getMyContents();
          } else {
            return this.contentService.getContents(this.authorId);
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((contents: any) => {
        this.publishedContent = contents.data;
      }, error => this.errorService.handleError('loadAuthorData', error));

    this.accountService.followAuthorChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
          this.accountService.getAuthorByPublicKey(this.author.publicKey);
          this.canFollow = false;
        }
      );
    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
          if (data.action === 'loadAuthorData') {
            this.router.navigate(['/page-not-found']);
          } else if (data.action == 'loadAuthorStories') {
            console.log('--error--', data.message);
          } else if (['getUserDrafts', 'deleteDraft', 'deleteAllDrafts'].includes(data.action)) {
            this.notification.error(data.message);
          }
        }
      );
  }

  tabChange(e) {
    this.selectedTab = e;
    if (e == 2 && !this.drafts) {
      this.loading = true;
      this.getDrafts();
    }
  }

  getDrafts() {
    this.draftService.getUserDrafts()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((drafts: DraftData[]) => {
        this.drafts = drafts;
        this.loading = false;
      });
  }

  deleteDraft(id: number, index: number) {
    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        switchMap(() => this.draftService.delete(id)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        if (this.drafts && index in this.drafts) {
          this.drafts.splice(index, 1);
        }
      });
  }

  editDraft(id: string) {
    this.router.navigate([`/content/editdraft/${id}`]);
  }

  deleteAllDrafts() {
    this.dialogService.openConfirmDialog('')
      .pipe(
        filter(result => result),
        tap(() => this.loading = true),
        switchMap(() => this.draftService.deleteAll()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.drafts = [];
        this.loading = false;
      });
  }

  onLayoutComplete(event) {
    if (event && event.length > 1) {
      this.isMasonryLoaded = true;
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.articlesLoaded = false;
      this.isCurrentUser = false;
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
