import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ArticleService } from '../../core/services/article.service';
import { Account } from '../../core/services/models/account';
import { NotificationService } from '../../core/services/notification.service';
import { AccountService } from '../../core/services/account.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { Content } from '../../core/services/models/content';
import { SeoService } from '../../core/services/seo.service';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { DialogService } from '../../core/services/dialog.service';
import { AuthorStats } from '../../core/services/models/authorStats';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss']
})
export class AuthorComponent implements OnInit, OnDestroy {

  private authorId: string;
  shortName;
  loadingAuthor = true;
  avatarUrl: string;
  canFollow = true;
  yourAccount = false;
  articlesLoaded = false;

  private unsubscribe$ = new ReplaySubject<void>(1);

  author: Account;
  authorStories: Content[];
  lastLoadedStories: Content[];
  authorStats: AuthorStats = {isSubscribed: 0};
  public seeMoreChecker = false;
  seeMoreLoading = false;

  private startFromBlock = '0.0.0';
  private storiesDefaultCount = 30;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private notification: NotificationService,
    private accountService: AccountService,
    public dialogService: DialogService,
    private errorService: ErrorService,
    private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request: any
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.activatedRoute.params
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(params => {
          if (params['id'] === 'undefined') {
            this.router.navigate(['/']);
            return;
          }
          this.clearAuthorData();
          this.authorId = params['id'];
          this.accountService.getAccountByPublicKey(this.authorId);
          this.articleService.loadAuthorStories(this.authorId, this.storiesDefaultCount + 1, this.startFromBlock);
          this.accountService.loadAuthorStats(this.authorId);
        });

      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: ErrorEvent) => {
            if (['loadRpcAccount', 'loadAuthorStats', 'loadAuthorStories'].includes(data.action)) {
              console.log('--error--', data.message);
            } else if (['follow', 'unfollow'].includes(data.action)) {
              this.notification.error(data.message);
            }
          }
        );

      this.accountService.authorAccountChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((author: Account) => {
            this.author = author;
            this.avatarUrl = null;
            if (this.accountService.accountInfo && this.accountService.accountInfo.publicKey == this.author.publicKey) {
              this.yourAccount = true;
            }
            const url = isPlatformServer(this.platformId)
              ? this.request.protocol + '://' + this.request.get('host') + this.request.originalUrl
              : '';
            this.seo.generateTags({
              title: `${this.author.firstName || ''} ${this.author.lastName || ''}`.trim(),
              // image: this.author.meta['social_image_hash'] || this.author.meta.image_hash || null,
              url
            });

            // if (this.author.meta.image_hash) {
            //   this.avatarUrl = this.author.meta.image_hash;
            // }
            this.shortName = this.author.shortName ? this.author.shortName : '';

            this.loadingAuthor = false;
          }
        );

      this.articleService.authorContentsChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((stories: Content[]) => {
            if (stories && stories.length) {

              if (stories.length > this.storiesDefaultCount) {
                const lastIndex = stories.length - 1;
                if (stories[lastIndex].id !== this.startFromBlock) {
                  this.startFromBlock = stories[lastIndex].id;
                  stories.pop();
                }
              }

              this.lastLoadedStories = stories;
              this.articlesLoaded = true;
              this.authorStories = (this.authorStories && this.authorStories.length) ? this.authorStories.concat(stories) : stories;
              this.seeMoreChecker = (stories.length >= this.storiesDefaultCount)/* && (this.authorStories.length < this.authorStats.articlesCount)*/;
            } else {
              this.loadingAuthor = false;
              this.articlesLoaded = true;
            }
            this.seeMoreLoading = false;
          }
        );

      this.accountService.authorStatsDataChanged.subscribe((data: AuthorStats) => {
          this.authorStats = data;
          this.canFollow = data && (data.isSubscribed == 0 || data.isSubscribed == -1);
        }
      );

      this.accountService.followAuthorChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
            this.accountService.loadAuthorStats(this.author.publicKey);
            this.canFollow = false;
          }
        );

      this.accountService.unFollowAuthorChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
            this.accountService.loadAuthorStats(this.author.publicKey);
            this.canFollow = true;
          }
        );

      this.articleService.authorStoriesViewsChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
            if (data && this.lastLoadedStories) {
              this.lastLoadedStories.forEach(content => {
                data.forEach(story => {
                  if (content.ds_id == story._id) {
                    content.viewcount = story.viewcount;
                  }
                });
              });
            }
          }
        );
    }
  }

  seeMore() {
    this.seeMoreLoading = true;
    this.articleService.loadAuthorStories(this.authorId, this.storiesDefaultCount + 1, this.startFromBlock);
  }

  checkImageHashExist() {
    return false;
    // return !!(
    //   this.author &&
    //   this.author.image_hash &&
    //   this.author.image_hash !== '' &&
    //   !this.author.image_hash.startsWith('http://127.0.0.1') &&
    //   this.author.image_hash.indexOf('_thumb') !== -1
    // );
  }

  follow() {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }

    this.accountService.follow(this.author.publicKey);
  }

  unfollow() {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }
    this.accountService.unfollow(this.author.publicKey);
  }

  public openLoginDialog() {
    this.dialogService.openLoginDialog()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(response => {
        if (response) {
          if (
            this.accountService.accountInfo &&
            this.accountService.accountInfo.publicKey == this.author.publicKey
          ) {
            this.yourAccount = true;
          }
          this.accountService.loadAuthorStats(this.author.publicKey);
        }
      });
  }

  clearAuthorData() {
    this.seo.generateTags({}, 'website');
    this.articleService.authorContents = [];
    this.articleService.authorContentsChanged.next([]);
    this.startFromBlock = '0.0.0';
    this.authorStories = [];
    this.articlesLoaded = false;
    this.yourAccount = false;
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.clearAuthorData();
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
