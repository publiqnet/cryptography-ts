import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Optional } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { ReplaySubject } from 'rxjs';
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

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
import { ContentService } from '../../core/services/content.service';
import { DraftData } from '../../core/services/models/draft';
import { DraftService } from '../../core/services/draft.service';
import { NgxMasonryOptions } from 'ngx-masonry';

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
  yourAccount = false;
  articlesLoaded = false;
  resetStartBlock = false;
  public publishedContent: Content[] = [];
  editedContents = [];
  public loading = true;
  listType = 'grid';
  public drafts: Array<any>;
  public contentData = {
    slug: '5ceb9fc82765246c6cc55b47',
    author: {
      slug: '1.0.2',
      first_name: 'Gohar',
      last_name: 'Avetisyan',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
    },
    created: '11 dec 2019',
    published: '12 dec 2019',
    title: 'In the flesh: translating 2d scans into 3d prints',
    tags: [
      '2017',
      'DEVELOPER',
      'FULLSTACK'
    ],
    image: 'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    publication: {
      'title': 'UX Planet',
      'slug': 'ux_planet'
    },
    view_count: '1K'
  };
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
    private contentService: ContentService,
    private draftService: DraftService,
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

    if (this.accountService.accountInfo && this.accountService.accountInfo.publicKey) {
      this.articleService.getMyStories(this.accountService.accountInfo.publicKey, this.startFromBlock, this.storiesDefaultCount + 1);
      // this.accountService.loadAuthorStats(this.accountService.accountInfo.publicKey);

      this.contentService.pendingProcess.pipe(takeUntil(this.unsubscribe$)).subscribe((res: boolean) => {
        this.startFromBlock = '0.0.0';
        this.resetStartBlock = true;
        this.articleService.getMyStories(
          this.accountService.accountInfo.publicKey, this.startFromBlock, this.storiesDefaultCount + 1
        );
      });
    }

    this.contentService.getMyContents()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((contents: any) => {
        this.publishedContent = contents.data;
        this.editContents();
      });

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
          } else if (['getUserDrafts', 'deleteDraft', 'deleteAllDrafts'].includes(data.action)) {
            this.notification.error(data.message);
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

  tabChange(e) {
    this.selectedTab = e;
    if (e == 2 && !this.drafts ) {
      this.loading = true;
      this.getDrafts();
    }
  }

  accountClick(e) {
    console.log(e);
  }

  publicationClick(e) {
    console.log(e);
  }

  tagClick(e) {
    console.log(e);
  }

  contentClick(e) {
    console.log(e);
  }

  editContents() {
    this.editedContents = this.publishedContent.slice(0)
      .map(
        (content: any) => {
          return {
            title: content.title,
            slug: content.uri,
            image: content.cover ? content.cover.url : null,
            author : {
              slug: content.author.address,
              first_name: content.author.firstName,
              image: content.author.image,
              last_name: content.author.lastName
            }
          };
        }
      );
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
      this.clearAuthorData();
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
