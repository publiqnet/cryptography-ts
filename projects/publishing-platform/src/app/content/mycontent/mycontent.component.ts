import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subject, Subscription, zip } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ArticleService } from '../../core/services/article.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { DialogService } from '../../core/services/dialog.service';
import { ContentService, OrderOptions } from '../../core/services/content.service';
import { AccountService } from '../../core/services/account.service';
import { MatDialog } from '@angular/material';
import { NewstorySubmission2Component } from '../../core/newstory-submission2/newstory-submission2.component';
import { takeUntil, map } from 'rxjs/operators';
import { HttpRpcService } from '../../core/services/httpRpc.service';
import { Publication } from '../../core/services/models/publication';
import { PublicationService } from '../../core/services/publication.service';
import { AuthorStats } from '../../core/services/models/authorStats';
import { Content } from '../../core/services/models/content';


@Component({
    selector: 'app-mycontent',
    templateUrl: './mycontent.component.html',
    styleUrls: ['./mycontent.component.scss', '../../../assets/css/screen.scss']
})
export class MycontentComponent implements OnInit, OnDestroy {
    public publishedContent: Content[] = [];
    public drafts: Array<any>;
    public pendingProcess: boolean;
    public loading = true;
    private subscriptions: Subscription = new Subscription();

    public openedContents = {};
    private unsubscribe$ = new Subject<void>();
    publications: Array<Publication> = [];

    private storiesDefaultCount = 30;
    private startFromBlock = '0.0.0';
    public seeMoreChecker = false;
    public allStoriesCount = 0;
    seeMoreLoading = false;
    resetStartBlock = false;


    constructor(
        private articleService: ArticleService,
        private router: Router,
        private notificationService: NotificationService,
        private errorService: ErrorService,
        public dialogService: DialogService,
        private httpRpcService: HttpRpcService,
        private publicationService: PublicationService,
        @Inject(PLATFORM_ID) private platformId: Object,
        public accountService: AccountService,
        public t: TranslateService,
        private dialog: MatDialog,
        private contentService: ContentService
    ) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.accountService.accountInfo && this.accountService.accountInfo.name) {
                this.articleService.getMyStories(this.accountService.accountInfo.name, this.startFromBlock, this.storiesDefaultCount + 1);
                this.accountService.loadAuthorStats(this.accountService.accountInfo.name);

                this.contentService.pendingProcess.pipe(takeUntil(this.unsubscribe$)).subscribe((res: boolean) => {
                    this.startFromBlock = '0.0.0';
                    this.resetStartBlock = true;
                    this.articleService.getMyStories(
                        this.accountService.accountInfo.name, this.startFromBlock, this.storiesDefaultCount + 1
                    );
                });
            }
            this.router.routeReuseStrategy.shouldReuseRoute = function () {
                return false;
            };
            this.subscriptions.add(
                this.errorService.errorEventEmiter.subscribe((data: ErrorEvent) => {
                    if (['getUserDrafts', 'deleteDraft', 'deleteAllDrafts'].includes(data.action)) {
                        this.notificationService.error(data.message);
                    }
                })
            );
            this.publicationService.getMyPublications();
            this.subscriptions.add(
                this.accountService.authorStatsDataChanged.subscribe((stats: AuthorStats) => {
                    this.allStoriesCount = stats.articlesCount;
                })
            );

            this.subscriptions.add(
                zip(
                    this.articleService.getMyStoriesDataChanged,
                    this.publicationService.loadStoriesPublicationByDsIdDataChanged
                ).subscribe((data: any []) => {
                        if (data) {

                            if (data[0].length > this.storiesDefaultCount) {
                                const lastIndex = data[0].length - 1;
                                if (data[0][lastIndex].id !== this.startFromBlock) {
                                    this.startFromBlock = data[0][lastIndex].id;
                                    data[0].pop();
                                }
                            }

                            const stories: Content[] = data[0];
                            const publications = data[1];

                            if (stories && stories.length) {
                                if (this.resetStartBlock) {
                                    this.publishedContent = [];
                                }
                                if (publications && publications.length) {
                                    stories.map(nextStory => {
                                        publications.map(item => {
                                            if (item['dsId'] == nextStory['ds_id']) {
                                                nextStory['publication'] = item['publication'];
                                            }
                                        });
                                    });
                                }
                                this.publishedContent =
                                    (this.publishedContent && this.publishedContent.length)
                                    ?
                                    this.publishedContent.concat(stories)
                                    :
                                    stories;

                                this.pendingProcess = false;
                                this.seeMoreChecker = (stories.length >= this.storiesDefaultCount) /*&& (this.publishedContent.length < this.allStoriesCount)*/;
                            }
                        }
                        this.seeMoreLoading = false;
                        this.loading = false;
                    }, err => {
                        this.pendingProcess = false;
                        this.loading = false;
                    }
                )
            );
            this.subscriptions.add(
                zip(
                  this.publicationService.myPublications,
                  this.publicationService.myMemberships.pipe(map((res: any[]) => res.map(el => el.publication)))
                )
                  .pipe(map((results: any[]) => {
                    return results[0].concat(results[1]);
                  }))
                  .subscribe((publications: any[]) => {
                    this.publications = publications;
                  })
              );
            this.subscriptions.add(
                this.articleService.getUserDraftsDataChanged.subscribe(data => {
                        this.drafts = data;
                        this.loading = false;
                    }
                )
            );

            this.subscriptions.add(
                this.articleService.deleteDraftDataChanged.subscribe(draft => {
                        if (draft !== 'undefined' && this.drafts && draft in this.drafts) {
                            this.drafts.splice(draft, 1);
                        }
                    }
                )
            );

            this.subscriptions.add(
                this.articleService.deleteAllDraftsDataChanged.subscribe(draft => {
                    this.articleService.getUserDraftsData = [];
                    this.articleService.getUserDraftsDataChanged.next(this.articleService.getUserDraftsData);
                })
            );
        }
    }

    seeMore() {
        this.seeMoreLoading = true;
        this.resetStartBlock = false;
        this.articleService.getMyStories(this.accountService.accountInfo.name, this.startFromBlock, this.storiesDefaultCount + 1);
    }

    openDialogSubmission2(ds_id: string): void {
        const dialogRef = this.dialog.open(NewstorySubmission2Component, {
            width: '460px',
            // padding: '36px 40px',
            panelClass: 'newstory-submission'
        }).afterClosed().subscribe(done => {
            if (done) {
                if (!this.accountService.accountInfo.balance || this.accountService.accountInfo.balance < done.boostMoney) {
                    this.notificationService.error(this.errorService.getError('boost_content_balance_error'));
                    return false;
                }
                const titleText = this.t.instant('dialog.password.title');
                const descriptionText = this.t.instant('dialog.password.boost_story');
                this.dialogService.openInputPasswordDialog('show-private-key', titleText, descriptionText, {
                    maxWidth: '600px',
                    panelClass: 'modal-padding'
                }).subscribe(data => {
                    if (data && data.password) {
                        this.pendingProcess = true;
                        this.loading = true;
                        this.contentService.articleBoost(data.password, ds_id, done);
                    }
                });
            }
        });
    }

    cancelPromotion(id) {
        const titleText = this.t.instant('dialog.password.title');
        const descriptionText = this.t.instant('dialog.password.boost_story_cancel');
        this.dialogService.openInputPasswordDialog('show-private-key', titleText, descriptionText, {
            maxWidth: '600px',
            panelClass: 'modal-padding'
        }).subscribe(data => {
            if (data && data.password) {
                this.pendingProcess = true;
                this.loading = true;
                this.contentService.cancelArticleBoosting(data.password, id);
            }
        });
    }

    onTabChange(e) {
        if (e.index === 1) {
            if (!this.drafts) {
                this.loading = true;
                this.getDrafts();
            }
        }
    }

    getDrafts() {
        this.articleService.getUserDrafts();
    }

    deleteDraft(id: string, index: number) {
        this.dialogService.openConfirmDialog('').subscribe(result => {
            if (result) {
                this.articleService.deleteDraft(id, true, index);
                return true;
            }
            return false;
        });
    }

    editDraft(id: string) {
        this.router.navigate([`/content/editdraft/${id}`]);
    }

    showContentHistoryList(publishedContentItem) {
        if (
            publishedContentItem.meta.origin.length &&
            !this.openedContents.hasOwnProperty(publishedContentItem.ds_id)
        ) {
            this.httpRpcService
                .call({
                    params: [0, 'get_content_history', [publishedContentItem.ds_id]]
                })
                .subscribe(
                    (data: any) => {
                        this.openedContents[publishedContentItem.ds_id] = data;
                    },
                    error => console.log(error)
                );
        }
    }

    redirectArticle(article, $event) {
        $event.stopPropagation();

        if (isPlatformBrowser(this.platformId)) {
            this.articleService.getArticleByIdDataChanged.next(article);
            this.router.navigate([`/s/${article.ds_id}`]);
        }
    }

    editArticle(article, $event) {
        $event.stopPropagation();

        if (isPlatformBrowser(this.platformId)) {
            this.articleService.getArticleByIdDataChanged.next(article);
            this.router.navigate([`/content/edit/${article.ds_id}`]);
        }
    }

    getImage(article) {
        return this.hasImage(article)
            ? article.meta.thumbnail_hash.replace('original', 'thumb')
            : '/assets/no-image-article.jpg';
    }

    deleteAllDrafts() {
        this.dialogService.openConfirmDialog('').subscribe(result => {
            if (result) {
                this.articleService.deleteAllDrafts();
                return true;
            }
            return false;
        });
    }

    hasImage(article) {
        return !!(
            article.meta.thumbnail_hash &&
            article.meta.thumbnail_hash !== '' &&
            !article.meta.thumbnail_hash.startsWith('http://127.0.0.1')
        );
    }

    changePublication(ds, event) {
        const slug = event.value;
        this.publicationService.addPublicationToStory(ds, slug).subscribe(
            () => {
                this.notificationService.success('Your publication successfully changed');
            }
        );
    }

    publicationSelectClick(event) {
        event.stopPropagation();
    }

    getCorrectDateFormat(date) {
        return date && date.slice(-1) !== 'Z' ? date + 'Z' : date;
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.openedContents = {};
            this.subscriptions.unsubscribe();
            this.unsubscribe$.next();
            this.unsubscribe$.complete();

            this.publishedContent = [];
            this.articleService.getMyStoriesData = [];
            this.articleService.getMyStoriesDataChanged.next([]);
            this.publicationService.loadStoriesPublicationByDsIdDataChanged.next([]);
            this.startFromBlock = '0.0.0';
        }
    }
}