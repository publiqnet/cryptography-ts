import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Title, TransferState } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subscription, zip } from 'rxjs';

import { ArticleService } from '../services/article.service';
import { AccountService } from '../services/account.service';
import { Content, PageOptions } from '../services/models/content';
import { ErrorEvent, ErrorService } from '../services/error.service';
import { ChannelService } from '../services/channel.service';
import { PublicationService } from '../services/publication.service';
import { Preference } from '../services/models/preference';
import { SeoService } from '../services/seo.service';
import { take } from 'rxjs/operators';

declare var $: any;
const IMAGE_GIF = 'gif';

// const HOMEPAGE_ARTICLES_KEY = makeStateKey('homepage_articles');

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {
    public loading = true;
    private scrollListener;
    logined = false;
    public mainStoryImageHash: string;

    homepageStories: Content[] = [];
    homepageStoriesHeadPart: Content[] = [];
    homepageStoriesBodyPart: Content[] = [];
    homepageStoriesFooterPart: Content[] = [];
    homepageStoriesFooterPart1: Content[] = [];
    homepageStoriesFooterPart2: Content[] = [];

    tagsStories: Content[] = [];
    authorsStories: Content[] = [];

    subscriptions: Subscription = new Subscription();

    mainStory: Content;

    private startFromBlock = '0.0.0';
    private firstBlock = '0.0.0';
    private storiesDefaultCount = 30;
    private storiesDefaultSponsoredCount = 5;
    private loadedStoriesSponsoredCount = 3;
    public seeMoreChecker = false;
    seeMoreLoading = false;
    private breakIntoPieces = true;
    public blockInfiniteScroll = false;
    requestMade = false;

    constructor(
        public articleService: ArticleService,
        private titleService: Title,
        private seoService: SeoService,
        @Inject(PLATFORM_ID) private platformId: Object,
        public accountService: AccountService,
        private state: TransferState,
        private errorService: ErrorService,
        private router: Router,
        private channelService: ChannelService,
        private publicationService: PublicationService
    ) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {

            if (this.channelService.channel && !(ChannelService.isChannelMain(this.channelService.channel))) {
                if (!this.channelService.getChannelAuthors().length) {
                    this.channelService.loadChannelAuthors();
                } else {
                  this.requestMade = true;
                    this.articleService.searchContentExSponsored(this.firstBlock, this.storiesDefaultCount + 1, this.storiesDefaultSponsoredCount);
                }
            } else {
                this.articleService.searchContentExSponsored(this.firstBlock, this.storiesDefaultCount + 1, this.storiesDefaultSponsoredCount);
            }

            this.subscriptions.add(
                this.errorService.errorEventEmiter.subscribe((error: ErrorEvent) => {
                        this.loading = false;
                        if (['loadSuggestContentsByTags', 'searchContentExSponsored', 'loadHompageAuthorsArticles'].includes(error.action)) {
                            console.log(error.action, error.message);
                        }
                    }
                )
            );

            this.subscriptions.add(
                this.channelService.channelAuthorsChanged.pipe(take(1)).subscribe(res => {
                  if (!this.requestMade) {
                    this.articleService.searchContentExSponsored(this.firstBlock, this.storiesDefaultCount + 1, this.storiesDefaultSponsoredCount);
                  }
                })
            );

            this.subscriptions.add(
                zip(
                    this.articleService.contentExSponsoredChanged,
                    this.publicationService.loadStoriesPublicationByDsIdDataChanged,
                    this.articleService.getContentViewsDataChanged
                ).subscribe((data: any[]) => {
                    const stories: Content[] = data[0];
                    const publications: any[] = data[1];
                    const views: any[] = data[2];

                    if (stories.length > this.storiesDefaultCount) {
                        const lastIndex = stories.length - 1;
                        if (stories[lastIndex].id !== this.startFromBlock) {
                            this.startFromBlock = stories[lastIndex].id;
                            stories.pop();
                        }
                    }
                    this.seeMoreChecker = (stories.length >= this.storiesDefaultCount);

                    if (!this.mainStory) {
                        this.getMainStory(stories);
                        if (this.mainStory && this.mainStory.meta) {
                            this.loadMainStoryImage(this.mainStory.meta.image_hash);
                        }
                    }

                    stories.forEach((story: Content) => {
                        if (views.length) {
                            views.forEach(view => {
                                if (story.ds_id == view._id) {
                                    story.viewcount = view.viewcount;
                                }
                                if (this.mainStory) {
                                    if (this.mainStory.ds_id == view._id) {
                                        this.mainStory.viewcount = view.viewcount;
                                    }
                                }
                            });
                        }

                        if (publications.length) {
                            publications.forEach(nextPublication => {
                                if (story.ds_id == nextPublication.dsId) {
                                    story.publication = nextPublication.publication;
                                }
                                if (this.mainStory) {
                                    if (this.mainStory.ds_id == nextPublication.dsId) {
                                        this.mainStory.publication = nextPublication.publication;
                                    }
                                }
                            });
                        }
                    });

                    if (stories && stories.length) {
                        if (this.breakIntoPieces) {
                            // this.articleService.homepageArticles = stories.slice();
                            this.homepageStories = stories;
                            this.loading = false;
                            this.homepageStoriesHeadPart = this.homepageStories.slice(0, 11);
                            if (this.homepageStories.length > 11) {
                                this.homepageStoriesBodyPart = this.homepageStories.slice(11, 17);
                                if (this.homepageStories.length > 17) {
                                    this.homepageStoriesFooterPart = this.homepageStories.slice(17, this.homepageStories.length);
                                }
                            }
                            if (this.homepageStoriesFooterPart.length > 0) {
                                this.homepageStoriesFooterPart1 = this.homepageStoriesFooterPart.slice(
                                    0,
                                    Math.floor(this.homepageStoriesFooterPart.length / 2)
                                );
                                this.homepageStoriesFooterPart2 = this.homepageStoriesFooterPart.slice(
                                    Math.floor(this.homepageStoriesFooterPart.length / 2),
                                    this.homepageStoriesFooterPart.length
                                );
                            }
                        } else {
                            if (this.logined) {
                                this.homepageStoriesFooterPart2 = (this.homepageStoriesFooterPart2 && this.homepageStoriesFooterPart2.length) ? this.homepageStoriesFooterPart2.concat(stories) : stories;
                            } else {
                                this.homepageStoriesFooterPart = (this.homepageStoriesFooterPart && this.homepageStoriesFooterPart.length) ? this.homepageStoriesFooterPart.concat(stories) : stories;
                            }

                            this.blockInfiniteScroll = false;
                        }
                    }
                    this.seeMoreLoading = false;
                })
            );

            if (this.channelService.channelConfig) {
                this.seoService.generateTags(this.channelService.channelConfig);
            }


            // todo unused for now(31-01-2019)
            /*this.homepageStories = this.articleService.getHomePageArticles();
            if (this.homepageStories.length) {
              this.articleService.homepageArticlesChanged.next(this.homepageStories);
            } else {
              this.homepageStories = this.state.get(
                HOMEPAGE_ARTICLES_KEY,
                null as any
              );
              if (this.homepageStories && this.homepageStories.length) {
                const dsIdArray = [];
                this.homepageStories.forEach((article: Content) => {
                  dsIdArray.push(article.ds_id);
                });
                this.publicationService
                  .getArticlePublication(dsIdArray)
                  .subscribe((pubs: Array<any>) => {
                    if (pubs) {
                      this.homepageStories.map((article: Content) => {
                        pubs.forEach(publication => {
                          if (article.ds_id === publication.dsId) {
                            article.publication = publication.publication;
                          }
                        });
                      });
                    }
                    this.calculateMainArticlesCount = false;
                    this.loading = false;
                    this.homepageStories = this.articleService.fixTimeString(
                      this.homepageStories
                    );
                    this.homepageStories = this.articleService.getLastArticle(
                      this.homepageStories
                    );
                    this.articleService.homepageArticlesChanged.next(
                      this.homepageStories
                    );
                  });
              } else {
                this.calculateMainArticlesCount = true;
                this.homepageStories = this.articleService.getHomePageArticles();

                if (this.channelService.channel) {
                  if (!this.channelService.getChannelAuthors().length) {
                    this.channelService.loadChannelAuthors();
                  } else {
                    this.articleService.loadHomepageArticles();
                  }
                } else {
                  this.articleService.loadHomepageArticles();
                }
              }
            }*/


            const title = this.titleService.getTitle();

            if (!this.channelService.mainTitle) {
                this.channelService.mainTitle = title;
            }
            this.titleService.setTitle(this.channelService.mainTitle);

            if (!this.accountService.loggedIn()) {
                this.articleService.loadSuggestContentsByTags(false, PageOptions.homepageTagStories);
            }

            this.subscriptions.add(
                this.accountService.accountUpdated$.subscribe(
                    data => {
                        if (data && data.token) {
                            this.logined = true;
                            this.accountService.getSubscriptionAndPreferences();
                        } else {
                            this.logined = false;
                        }
                    }
                )
            );

            this.subscriptions.add(
                this.accountService.logoutDataChanged.subscribe(data => {
                        this.logined = false;
                    }
                )
            );

            this.subscriptions.add(
                zip(
                    this.articleService.suggestContentsByTagsDataChanged,
                    this.publicationService.homepageTagStoriesPublicationChanged,
                    this.articleService.homepageTagStoriesViewsChanged
                ).subscribe((data: any[]) => {
                    const stories: Content[] = data[0];
                    const publications: any[] = data[1];
                    const views: any[] = data[2];

                    stories.forEach((story: Content) => {
                        if (views.length) {
                            views.forEach(view => {
                                if (story.ds_id == view._id) {
                                    story.viewcount = view.viewcount;
                                }
                            });
                        }

                        if (publications.length) {
                            publications.forEach(nextPublication => {
                                if (story.ds_id == nextPublication.dsId) {
                                    story.publication = nextPublication.publication;
                                }
                            });
                        }
                    });

                    this.loading = false;
                    this.tagsStories = stories;
                })
            );

            this.subscriptions.add(
                zip(
                    this.articleService.authorsContentsChanged,
                    this.publicationService.homepageAuthorStoriesPublicationChanged,
                    this.articleService.homepageAuthorStoriesViewsChanged
                ).subscribe((data: any[]) => {
                    const stories: Content[] = data[0];
                    const publications: any[] = data[1];
                    const views: any[] = data[2];

                    stories.forEach((story: Content) => {
                        if (views.length) {
                            views.forEach(view => {
                                if (story.ds_id == view._id) {
                                    story.viewcount = view.viewcount;
                                }
                            });
                        }

                        if (publications.length) {
                            publications.forEach(nextPublication => {
                                if (story.ds_id == nextPublication.dsId) {
                                    story.publication = nextPublication.publication;
                                }
                            });
                        }
                    });
                    this.authorsStories = stories;
                })
            );

            this.subscriptions.add(
                this.accountService.subscriptionPreferencesDataChanged.subscribe((result: Preference) => {
                        const subscribersList = [];
                        if (result.subscriptions) {
                            result.subscriptions.forEach(value => {
                                if (value && value.user && value.user.username) {
                                    subscribersList.push(value.user.username);
                                }
                            });
                        }

                        if (result.authors) {
                            result.authors.forEach(value => {
                                if (value && value.author && value.author.username && (this.accountService.accountInfo && value.author.username != this.accountService.accountInfo.name)) {
                                    subscribersList.push(value.author.username);
                                }
                            });
                        }

                        if (subscribersList && subscribersList.length) {

                            this.articleService.loadHompageAuthorsArticles(subscribersList, PageOptions.homepageAuthorStories);

                            /*this.authorsStories = this.articleService.getAuthorsArticles();

                            if (!this.authorsStories.length) {
                                this.articleService.loadHompageAuthorsArticles(subscribersList, PageOptions.homepageAuthorStories);
                            }*/
                        }

                        this.articleService.loadSuggestContentsByTags(true, PageOptions.homepageTagStories);
                    }
                )
            );

            this.scrollListener = this.bodyScrollListener.bind(this);
            window.onscroll = this.scrollListener;
        }
    }

    bodyScrollListener(e): void {
        if (isPlatformBrowser(this.platformId)) {
            const scrollTop = document.querySelector('html').scrollTop || document.body.scrollTop;
            document.querySelector('mat-toolbar').classList[scrollTop > 150 ? 'add' : 'remove']('shrink-n');
        }
    }

    hasThumbImage(story: Content): boolean {
        return !!(
            story.meta.thumbnail_hash &&
            story.meta.thumbnail_hash !== '' &&
            !story.meta.thumbnail_hash.startsWith('http://127.0.0.1')
        );
    }

    checkImageHashExist(): string | any {
        let fullName = this.mainStory.full_account
            ? this.mainStory.full_account
            : '';
        if (this.mainStory.full_account) {
            fullName = this.mainStory.full_account;
        } else if (this.mainStory.full_account) {
            fullName = this.mainStory.full_account;
        } else {
            fullName = '';
        }
        const meta = fullName.meta ? fullName.meta : '';
        const image = meta.image_hash ? meta.image_hash : '';

        return !!(
            fullName &&
            meta &&
            image &&
            image !== '' &&
            !image.startsWith('http://127.0.0.1') &&
            image.indexOf('_thumb') !== -1
        )
            ? image
            : 'none';
    }

    getImage(story: Content): string | any {
        return this.hasThumbImage(story)
            ? story.meta.thumbnail_hash
            : '/assets/no-image-article.jpg';
    }

    redirect(story: Content): void {
        this.articleService.getArticleByIdDataChanged.next(story);
        this.router.navigate([`s/${story.ds_id}`]);
        return;
    }

    goToPublicationPage(slug: string): void {
        this.router.navigate(['/p/' + slug]);
        return;
    }

    loadMainStoryImage(imageHash: string): void {
        const imageHashSmall = imageHash.replace('original', 'thumb');

        if (!this.mainStoryImageHash) {
            const imgThumb = new Image();
            imgThumb.src = imageHashSmall;
            imgThumb.onload = () => {
                if (!this.mainStoryImageHash) {
                    this.mainStoryImageHash = imgThumb.src;
                }
            };
        }

        const imgHash = new Image();
        imgHash.src = imageHash;
        imgHash.onload = () => {
            this.mainStoryImageHash = imgHash.src;
        };
    }

    getCorrectDateFormat(date) {
        return date && date.slice(-1) !== 'Z' ? date + 'Z' : date;
    }

    getMainStory(data: Content[]): Content[] {
        if (isPlatformBrowser(this.platformId)) {
            let storyFound = false;

            data.forEach((obj, index) => {
                const mainImageExtension = obj.meta.image_hash.split('.').pop();
                if (
                    !storyFound &&
                    obj.meta &&
                    obj.meta.image_hash &&
                    obj.meta.image_hash !== '' &&
                    !obj.meta.image_hash.startsWith('http://127.0.0.1') &&
                    !obj.boosted && mainImageExtension && mainImageExtension != IMAGE_GIF
                ) {
                    this.mainStory = obj;
                    storyFound = true;
                    data.splice(index, 1);
                }
            });

            return data;
        }
    }

    seeMore() {
        this.breakIntoPieces = false;
        this.seeMoreLoading = true;
        this.blockInfiniteScroll = true;
        this.articleService.searchContentExSponsored(this.startFromBlock, this.storiesDefaultCount + 1, this.loadedStoriesSponsoredCount);
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            document.querySelector('mat-toolbar').classList.remove('shrink-n');
            window.onscroll = null;
            this.logined = false;
            this.subscriptions.unsubscribe();
            this.startFromBlock = '0.0.0';
            this.articleService.contentExSponsoredChanged.next([]);
            this.publicationService.loadStoriesPublicationByDsIdDataChanged.next([]);
            this.articleService.getContentViewsDataChanged.next([]);
        }
    }
}



