import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Optional } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { ReplaySubject } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';

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
  selector: 'app-author-old',
  templateUrl: './author-old.component.html',
  styleUrls: ['./author-old.component.scss']
})
export class AuthorOldComponent implements OnInit, OnDestroy {

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
          this.clearAuthorData();
          if (this.accountService.loggedIn() && this.author && this.accountService.accountInfo.publicKey == this.author.publicKey) {
            this.yourAccount = true;
          }
          return this.accountService.getAuthorByPublicKey(this.authorId);
          // this.articleService.loadAuthorStories(this.authorId, this.storiesDefaultCount + 1, this.startFromBlock);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((author: Account) => {
        this.initAuthorData(author);
      }, error => this.errorService.handleError('loadAuthorData', error));

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
          if (data.action === 'loadAuthorData') {
            this.router.navigate(['/page-not-found']);
          } else if (data.action == 'loadAuthorStories') {
            console.log('--error--', data.message);
          } else if (['follow', 'unfollow'].includes(data.action)) {
            this.notification.error(data.message);
          }
        }
      );

    this.articleService.authorContentsChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
          console.log('articleService.authorContentsChanged');
          // if (stories && stories.length) {
          //
          //   if (stories.length > this.storiesDefaultCount) {
          //     const lastIndex = stories.length - 1;
          //     if (stories[lastIndex].id !== this.startFromBlock) {
          //       this.startFromBlock = stories[lastIndex].id;
          //       stories.pop();
          //     }
          //   }
          //
          //   this.lastLoadedStories = stories;
          //   this.articlesLoaded = true;
          //   this.authorStories = (this.authorStories && this.authorStories.length) ? this.authorStories.concat(stories) : stories;
          //   this.seeMoreChecker = (stories.length >= this.storiesDefaultCount)/* && (this.authorStories.length < this.authorStats.articlesCount)*/;
          // } else {
          //   this.loadingAuthor = false;
          //   this.articlesLoaded = true;
          // }
          // this.seeMoreLoading = false;
        }
      );

    // this.accountService.authorStatsDataChanged.subscribe((data: AuthorStats) => {
    //     this.authorStats = data;
    //     this.canFollow = data && (data.isSubscribed == 0 || data.isSubscribed == -1);
    //   }
    // );

    this.accountService.followAuthorChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
          this.accountService.getAuthorByPublicKey(this.author.publicKey);
          this.canFollow = false;
        }
      );

    this.accountService.unFollowAuthorChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
          this.accountService.getAuthorByPublicKey(this.author.publicKey);
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
                // if (content.ds_id == story._id) {
                //   content.viewcount = story.viewcount;
                // }
              });
            });
          }
        }
      );
  }

  initAuthorData(author) {
    this.author = author;
    this.avatarUrl = null;
    if (this.accountService.loggedIn() && this.accountService.accountInfo.publicKey == this.author.publicKey) {
      this.yourAccount = true;
    }
    const url = isPlatformServer(this.platformId)
      ? this.request.protocol + '://' + this.request.get('host') + this.request.originalUrl
      : '';
    this.seo.generateTags({
      title: `${this.author.firstName || ''} ${this.author.lastName || ''}`.trim(),
      image: this.author.image || null,
      url
    });

    if (this.author.image) {
      this.avatarUrl = this.author.image;
    }
    this.shortName = this.author.shortName ? this.author.shortName : '';
    this.canFollow = this.author.isSubscribed == 0 || this.author.isSubscribed == -1;
    this.loadingAuthor = false;
    this.articlesLoaded = true;
  }

  seeMore() {
    this.seeMoreLoading = true;
    this.articleService.loadAuthorStories(this.authorId, this.storiesDefaultCount + 1, this.startFromBlock);
  }

  checkImageHashExist() {
    return !!(
      this.author &&
      this.author.image &&
      this.author.image !== '' &&
      !this.author.image.startsWith('http://127.0.0.1')
    );
  }

  follow() {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }

    this.accountService.follow(this.author.publicKey)
      .pipe(
        switchMap((data: Params) => {
          this.canFollow = false;
          return this.accountService.getAuthorByPublicKey(this.authorId);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((author: Account) => {
        this.initAuthorData(author);
      });
  }

  unfollow() {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }

    this.accountService.unfollow(this.author.publicKey)
      .pipe(
        switchMap((data: Params) => {
          this.canFollow = true;
          return this.accountService.getAuthorByPublicKey(this.authorId);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((author: Account) => {
        this.initAuthorData(author);
      });
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
          this.accountService.getAuthorByPublicKey(this.author.publicKey);
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
