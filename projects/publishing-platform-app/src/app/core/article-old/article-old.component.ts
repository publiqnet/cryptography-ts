import { Component, ElementRef, Inject, OnDestroy, OnInit, Optional, PLATFORM_ID, ViewChild } from '@angular/core';
import { makeStateKey, Title, TransferState } from '@angular/platform-browser';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, isPlatformServer, PlatformLocation } from '@angular/common';


import { filter, flatMap, map, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as memoryCache from 'memory-cache';

import { ArticleService } from '../services/article.service';
import { NotificationService } from '../services/notification.service';
import { AccountService } from '../services/account.service';
import { ContentService } from '../services/content.service';
import { ErrorEvent, ErrorService } from '../services/error.service';
import { DialogService } from '../services/dialog.service';
import { SeoService } from '../services/seo.service';
import { Content } from '../services/models/content';
import { ChannelService } from '../services/channel.service';
import { Account } from '../services/models/account';
import { PublicationService } from '../services/publication.service';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppComponent } from '../../app.component';

declare const __sharethis__;

interface Map {
  [K: string]: number;
}

const CHANNEL_CURRENT_ARTICLE = makeStateKey('channel_current_article');

@Component({
  selector: 'app-article-old',
  templateUrl: './article-old.component.html',
  styleUrls: ['./article-old.component.scss']
})
export class ArticleOldComponent implements OnInit, OnDestroy {
  public article;
  public fullAccount;
  public loading = true;
  public image: string;
  private articleHash: string;
  public accountInfo;
  public ogDescriptionLength = 140;
  public likeFeedbackStatus = 0;
  public reportFeedbackStatus = 0;
  private previousTitle: string;
  dialogopend = false;
  haveTags = false;
  haveAuthor = false;
  articleTagsContents: Content[] = [];
  articleAuthorContents: Content[] = [];
  historyList = [];
  openedHistoryContents = {};
  thisYear = new Date().getFullYear();
  @ViewChild('targetHistory', {static: false}) elHistoryTarget: ElementRef;

  private unsubscribe$ = new ReplaySubject<void>(1);


  static getAbbreviatedText(limit, text) {
    if (text && text.length) {
      const descWithoutTags = text.replace(/<[^>]+>/g, '');
      if (descWithoutTags.length > limit) {
        for (let i = limit; i < descWithoutTags.length; i++) {
          if (' \t\n\r\v'.indexOf(descWithoutTags[i]) > -1) {
            let resultText = descWithoutTags.substr(0, i);

            if (resultText.substring(resultText.length - 1) == ',') {
              resultText = resultText.substring(0, resultText.length - 1);
            }

            return resultText;
          }
        }
      } else {
        return descWithoutTags;
      }
    } else {
      return `PUBLIQ is a blockchain distributed media ecosystem owned,
                    governed and operated by a global independent community,
                    whose members enjoy unlimited potential of free expression,
                    enterprising and full protection of their identity and IP rights`;
    }
  }

  constructor(
    private titleService: Title,
    public articleService: ArticleService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private contentService: ContentService,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request: any,
    private platformLocation: PlatformLocation,
    public errorService: ErrorService,
    public dialogService: DialogService,
    private seo: SeoService,
    public channelService: ChannelService,
    private state: TransferState,
    private publicationService: PublicationService,
    public translateService: TranslateService
  ) {
  }

  setArticleMetaTags(article, url) {
    const {meta} = article;
    const config = {
      title: meta.title,
      description: meta.headline || meta.title,
      image: meta.social_image_hash || meta.thumbnail_hash || meta.image_hash || 'https://publiq.network/media/images/92169.png',
      url
    };
    this.seo.generateTags(config, 'article');
  }

  ngOnInit() {
    // if (isPlatformServer(this.platformId)) {
    //   const storyId = this.activatedRoute.snapshot.params['id'];
    //   const host = this.request.get('host');
    //
    //   if (host) {
    //     const splitHost = host.split('.');
    //     const channel = splitHost[0];
    //     const articlesDataCache = memoryCache.get(`${channel}_articles`);
    //     let articlesData;
    //     if (!articlesDataCache) {
    //       articlesData = {};
    //     } else {
    //       articlesData = articlesDataCache;
    //     }
    //     if (articlesData[storyId]) {
    //       const historyList = articlesData[storyId];
    //       const currentContent = historyList.find(x => (x.ds_id && x.ds_id == storyId) || (x._id && x._id == storyId));
    //       const url = this.request.protocol + '://' + this.request.headers.host + this.request.originalUrl;
    //       this.setArticleMetaTags(currentContent, url);
    //     } else {
    //       // Todo: move into service
    //       this.http.post(environment.daemon_https_address, {
    //         'id': 0,
    //         'method': 'call',
    //         'params': [0, 'get_content_history', [storyId]]
    //       }).pipe(
    //         flatMap((historyData: any) => {
    //           const historyList = historyData.result;
    //           const currentContent = historyList.find(x => x.ds_id == storyId);
    //           if (currentContent.ds_id && currentContent.ds_id === storyId) {
    //             return this.http.get(`${environment.ds_backend}/content/${storyId}`).pipe(
    //               map((data: any) => {
    //                 if (data && data != 'null' && data.meta) {
    //
    //                   if (data && data.created && data.created.slice(-1) !== 'Z') {
    //                     data.created = data.created + 'Z';
    //                   }
    //
    //                   if (data.content) {
    //                     data.meta.tags = AppComponent.generateTags(data.meta.tags);
    //                     // Todo: JSON.parse should be inside of try-catch
    //                     data.content.data = JSON.parse(new Buffer(new Buffer(data.content.data).toString(), 'hex').toString());
    //
    //                     data.full_account = currentContent.full_account;
    //                     data.created = this.getCorrectDateFormat(currentContent.created);
    //                     data.published = this.getCorrectDateFormat(currentContent.published);
    //                     data.meta.revision = currentContent.meta.revision;
    //                     data.meta.origin = currentContent.meta.origin;
    //                     if (data._id) {
    //                       data.ds_id = data._id;
    //                     }
    //
    //                     historyList.forEach((obj, key) => {
    //                       if ((obj.ds_id && obj.ds_id === storyId) || (obj._id && obj._id === storyId)) {
    //                         historyList[key] = data;
    //                       }
    //                     });
    //
    //                     articlesData[data._id] = historyList;
    //                     this.state.set(CHANNEL_CURRENT_ARTICLE, memoryCache.put(`${channel}_articles`, articlesData[data._id]));
    //                     const url = this.request.protocol + '://' + this.request.headers.host + this.request.originalUrl;
    //                     this.setArticleMetaTags(data, url);
    //                   }
    //                 }
    //               })
    //             );
    //           }
    //         })
    //       ).subscribe();
    //     }
    //   }
    // }


    if (isPlatformBrowser(this.platformId)) {
      this.previousTitle = this.titleService.getTitle();
      this.activatedRoute.params
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((params: Params) => {
          const articleId: string = (this.articleHash = params['id']);
          const articleDataFromServer = this.state.get(
            CHANNEL_CURRENT_ARTICLE,
            null as any
          );
          if (articleDataFromServer) {
            this.historyList = articleDataFromServer;
            const currentContent = articleDataFromServer.find(
              x => x._id && x._id == articleId
            );
            if (
              currentContent &&
              currentContent._id &&
              currentContent._id == articleId
            ) {
              const dsIdArray = [];
              dsIdArray.push(currentContent._id);

              this.publicationService
                .getArticlePublication(dsIdArray)
                .pipe(
                  takeUntil(this.unsubscribe$)
                )
                .subscribe((pubs: Array<any>) => {
                  pubs.forEach(publication => {
                    if (currentContent._id === publication.dsId) {
                      currentContent.publication = publication.publication;
                    }
                  });
                });

              if (currentContent.full_account) {
                currentContent.full_account = new Account(
                  currentContent.full_account
                );
                this.fullAccount = currentContent.full_account;
              }
              this.articleService.getArticleByIdData = currentContent;
              this.articleService.getArticleByIdDataChanged.next(currentContent);
            } else {
              this.articleService.getContentHistory(articleId);
            }
          } else {
            this.articleService.getContentHistory(articleId);
          }

          this.loadPubliqAnalytics();
        });

      if (this.accountService.loggedIn()) {
        this.contentService.loadFeedback(this.articleHash);
        this.accountService.updatePreferredArticle(this.articleHash);
      } else {
        this.accountService.accountUpdated$
          .pipe(
            filter(result => result != null),
            takeUntil(this.unsubscribe$)
          )
          .subscribe(acc => {
            this.accountInfo = acc;
            this.contentService.loadFeedback(this.articleHash);
            this.accountService.updatePreferredArticle(this.articleHash);
          });
      }

      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: ErrorEvent) => {
          const errorMessages = this.translateService.instant('error');
          if (['loadFeedback', 'loadArticleTagsContents', 'loadArticleAuthorContentsData'].includes(data.action)) {
            console.log(data.message);
          } else if (['addFeedbackReport', 'addFeedbackLike'].includes(data.action)) {
            this.notificationService.error(errorMessages['feedback_not_submitted']);
          } else if (['getArticleById'].includes(data.action)) {
            this.loading = false;
            this.notificationService.error(data.message);
            this.router.navigate(['/page-not-found']);
          }
        });

      this.contentService.feedbackChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(feedback => {
            this.likeFeedbackStatus = feedback.like ? 1 : 0;
            this.reportFeedbackStatus = feedback.report ? 1 : 0;
          }
        );

      this.contentService.feedbackReportDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((feedbackReportData) => {
          this.reportFeedbackStatus = 1;
          this.likeFeedbackStatus = 0;
          const message = this.translateService.instant('success');
          this.notificationService.success(message['feedback_submitted']);
        });

      this.contentService.feedbackLikeDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((feedbackReportData) => {
          this.reportFeedbackStatus = 0;
          this.likeFeedbackStatus = 1;
          const message = this.translateService.instant('success');
          this.notificationService.success(message['feedback_submitted']);
        });

      this.articleService.getArticleByIdDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
            if (data) {
              this.article = data;
              if (this.fullAccount) {
                this.article.full_account = this.fullAccount;
              }

              if (this.historyList) {
                const currentContent = this.historyList.find(
                  x => x.ds_id && x.ds_id == data._id
                );
                if (currentContent) {
                  this.article.meta.revision = currentContent.meta.revision;
                  this.article.created = this.getCorrectDateFormat(currentContent.created);
                  this.article.published = this.getCorrectDateFormat(currentContent.published);
                }
              }

              const tags = data.meta['tags'] || data.meta['displayTags'];
              const result = tags.map(a => (a.value ? a.value : ''));

              if (result && !this.haveTags) {
                this.haveTags = true;
                this.articleService.loadArticleTagsContents(result);
              }
              const identifier = data['author'] || data['publisher'];
              if (identifier && !this.haveAuthor) {
                this.haveAuthor = true;
                this.articleService.loadArticleAuthorContentsData(identifier);
              }

              if (this.article && this.article.meta && this.article.content) {
                this.updateOgMetaTags();
              }

              if (this.isAdult() && !this.dialogopend) {
                this.dialogopend = true;
                setTimeout(() => {
                  const messages = this.translateService.instant('dialog.info');
                  this.dialogService.openInfoDialog('for_adult', messages['for_adult_title'], this.articleService.dialogConfig)
                    .pipe(
                      takeUntil(this.unsubscribe$)
                    )
                    .subscribe(response => {
                      if (response) {
                        localStorage.setItem('for_adult', '1');
                        this.generateAndShowArticle();
                        return true;
                      } else {
                        this.platformLocation.back();
                        return false;
                      }
                    });
                });
              } else {
                this.generateAndShowArticle();
              }

              if (this.channelService.shareThis) {
                setTimeout(
                  () =>
                    __sharethis__.loader['inline-share-buttons']({
                      enabled: true
                    }),
                  1000
                );
              }

              if (this.article.meta.revision) {
                const mainArticle = this.historyList.find(
                  x => x.meta.revision == ''
                );
                const idHash =
                  mainArticle && mainArticle.ds_id
                    ? mainArticle.ds_id
                    : mainArticle ? mainArticle._id : null;
                this.articleService.articleEventEmitter.emit({
                  isHistory: true,
                  articleHash: this.articleHash,
                  mainArticleHash: idHash
                });
                this.articleService.isHistoryArticleOpened = true;
              } else if (this.articleService.isHistoryArticleOpened) {
                this.articleService.isHistoryArticleOpened = false;
                this.articleService.articleEventEmitter.emit({
                  isHistory: false,
                  articleHash: this.articleHash
                });
              }
            }
          }
        );

      this.articleService.getArticleHistoryByIdDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
            if (data) {
              const currentContent = this.historyList.find(
                x => x.ds_id && x.ds_id == data._id
              );

              if (currentContent) {
                data.created = this.getCorrectDateFormat(currentContent.created);
                data.published = this.getCorrectDateFormat(currentContent.published);
                data.full_account = new Account(currentContent.full_account);
              }
              this.openedHistoryContents[data._id] = data;
            }
          }
        );

      this.articleService.articleTagsContentsDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          (data: Content[]) => {
            this.haveTags = false;
            this.haveAuthor = false;
            if (data && data.length) {
              data = this.removeCurrentArticleFromList(data);
              if (data.length > 0) {
                this.articleTagsContents = data;
              }
            }
          }
        );

      this.articleService.articleAuthorContentsDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: Content[]) => {
            if (data && data.length > 0) {
              data = this.removeCurrentArticleFromList(data);
              if (data.length > 0) {
                this.articleAuthorContents = data;
              }
            }
          }
        );

      this.articleService.getContentHistoryDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
            if (data) {
              this.historyList = data;
              const currentContent = this.historyList.find(
                x => x.ds_id == this.articleHash
              );
              if (currentContent) {
                this.fullAccount = currentContent.full_account;
                if (
                  currentContent.ds_id &&
                  currentContent.ds_id === this.articleHash
                ) {
                  this.articleService.getArticleById(currentContent.ds_id, false);
                }
              } else {
                this.router.navigate(['/page-not-found']);
              }
            }
          }
        );
    }
  }

  loadPubliqAnalytics() {
    if (this.channelService.pixelId && this.articleHash && window['PALib']) {
      new window['PALib'].PATracker(this.channelService.pixelId).track(
        'article',
        this.articleHash
      );
    }
  }

  removeCurrentArticleFromList(list: any[]) {
    const id = this.article['_id'] || this.article['ds_id'];
    if (list.length > 0) {
      list.forEach((article: Content, index) => {
        if (article.ds_id === id) {
          list.splice(index, 1);
        }
      });

      if (list.length === 4) {
        list.pop();
      }
    }
    return list;
  }

  generateAndShowArticle() {
    this.articleService.setHeaderArticleMeta(this.article);
    this.titleService.setTitle(this.article.meta.title);

    const tags = [];
    this.article.meta.tags.forEach(element => {
      tags.push(element.value);
    });
    // update tag rates in local storage
    this.updateGuestFavouriteTags(tags);

    const imageHashSmall = this.article.meta.image_hash.replace(
      'original',
      'thumb'
    );
    if (!this.article.content) {
      this.image = imageHashSmall;
    } else {
      if (!this.image) {
        const imgThumb = new Image();
        imgThumb.src = imageHashSmall;
        imgThumb.onload = () => {
          if (!this.image) {
            this.image = imgThumb.src;
          }
        };
      }

      if (this.article.meta.image_hash) {
        const imgHash = new Image();
        imgHash.src = this.article.meta.image_hash;
        imgHash.onload = () => {
          this.image = imgHash.src;
        };
      } else {
        this.image = '';
      }
    }

    this.loading = false;
  }

  updateOgMetaTags() {
    // const ogdescription = ArticleComponent.getAbbreviatedText(
    //   this.ogDescriptionLength,
    //   this.article.content.data.text
    // );
    // const description = this.article.meta.headline
    //   ? this.article.meta.headline
    //   : ogdescription;
    // const image = this.article.meta.image_hash
    //   ? this.article.meta.image_hash
    //   : 'https://publiq.network/media/images/92169.png';
    // const url = (this.platformLocation as any).location.href;
    //
    // this.seo.generateTags({
    //   title: this.article.meta.title,
    //   description: description,
    //   image: image,
    //   url: url
    // });
  }

  private updateGuestFavouriteTags(tags: Array<string>) {
    if (tags.length == 0) {
      return;
    }
    const presentFavouriteTags = JSON.parse(
      localStorage.getItem(this.articleService.guestFavouriteTagsKey)
    );
    // initialize with an empty map object if there are no favourite tags
    const updatedFavouriteTags: Map = presentFavouriteTags || {};
    tags.forEach(tag => {
      // foreach tag in the present article increment the tag view count in local storage
      updatedFavouriteTags[tag] = updatedFavouriteTags[tag] + 1 || 1;
    });
    localStorage.setItem(
      this.articleService.guestFavouriteTagsKey,
      JSON.stringify(updatedFavouriteTags)
    );
  }

  public report() {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog()
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          if (this.accountService.loggedIn()) {
            this.contentService.loadFeedback(this.articleHash);
            return true;
          }
        });
      return false;
    }

    this.dialogService.openReportDialog()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(reasonId => {
        if (reasonId && (reasonId >= 1 && reasonId <= 5) && this.articleHash) {
          this.contentService.addFeedbackReport(
            this.articleHash,
            reasonId,
            this.article.full_account.id
          );
        }
      });
  }

  public reportLike() {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog()
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          if (this.accountService.loggedIn()) {
            return true;
          }
        });
      return false;
    }
    if (this.likeFeedbackStatus != 1) {
      if (
        this.articleHash &&
        this.article.full_account &&
        this.article.full_account.id &&
        typeof this.likeFeedbackStatus !== 'undefined'
      ) {
        this.contentService.addFeedbackLike(
          this.articleHash,
          this.likeFeedbackStatus,
          this.article.full_account.id
        );
      } else {
        const message = this.translateService.instant('error');
        this.notificationService.error(message['feedback_not_submitted']);
      }
    }
  }

  getLikeFeedbackActiveStatus() {
    return this.likeFeedbackStatus ? true : false;
  }

  getReportFeedbackActiveStatus() {
    return this.reportFeedbackStatus ? true : false;
  }

  getCorrectDateFormat(date) {
    return date && date.slice(-1) !== 'Z' ? date + 'Z' : date;
  }

  checkImageHashExist(article: Content) {
    let fullName = article.full_account ? article.full_account : '';
    if (article.full_account) {
      fullName = article.full_account;
    } else if (article.full_account) {
      fullName = article.full_account;
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

  isMyContent() {
    return this.accountService.accountInfo &&
    this.article &&
    this.article.full_account
      ? this.accountService.accountInfo.publicKey == this.article.full_account.publicKey
      : false;
  }

  isAdult() {
    if (isPlatformBrowser(this.platformId)) {
      const forAdult = localStorage.getItem('for_adult') ? true : false;

      return !forAdult &&
      this.article &&
      this.article.meta &&
      !this.isMyContent() &&
      (this.article.meta.for_adults == true ||
        this.article.meta.for_adults == 'true')
        ? true
        : false;
    }
  }

  showHistoryData(historyItem) {
    if (!this.openedHistoryContents.hasOwnProperty(historyItem.ds_id)) {
      this.articleService.getArticleHistoryById(historyItem.ds_id);
    }
  }

  scrollToHistory() {
    if (
      isPlatformBrowser(this.platformId) &&
      !this.article.meta.revision &&
      this.elHistoryTarget &&
      this.elHistoryTarget.nativeElement
    ) {
      this.elHistoryTarget.nativeElement.scrollIntoView({
        top: this.elHistoryTarget.nativeElement.offsetTop - 30,
        behavior: 'smooth'
      });
    }
  }

  toAuthorPage() {
    if (this.article) {
      const articlePublisher = (this.article.full_account && this.article.full_account.name) ? this.article.full_account.name : this.article.publisher;
      this.router.navigate([`/a/${articlePublisher}`]);
    }
  }

  redirectToSource(source: string) {
    if (isPlatformBrowser(this.platformId)) {
      let url = '';
      if (!/^http[s]?:\/\//.test(source)) {
        url += 'http://';
      }
      url += source;
      window.open(url, '_blank');
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();

      this.seo.generateTags(this.channelService.channelConfig, 'website');

      this.articleService.setHeaderArticleMeta(null);
      document.querySelector('mat-toolbar').classList.remove('shrink');

      (document.querySelector('.reading-progress') as HTMLElement).style.width =
        '0';
      this.fullAccount = '';
      this.historyList = [];
      this.openedHistoryContents = {};
      if (this.articleService.isHistoryArticleOpened) {
        this.articleService.articleEventEmitter.emit({isHistory: false});
      }
      this.titleService.setTitle(
        this.channelService.mainTitle
          ? this.channelService.mainTitle
          : this.previousTitle
      );
    }
  }
}
