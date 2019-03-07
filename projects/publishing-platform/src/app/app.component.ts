import { Component, HostListener, Inject, NgZone, OnDestroy, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { TransferState, makeStateKey, Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { APP_BASE_HREF, isPlatformBrowser, isPlatformServer, PlatformLocation } from '@angular/common';
import { REQUEST } from '@nguniversal/express-engine/tokens';

import { catchError, filter, flatMap, take } from 'rxjs/operators';
import { of, Subscription, Observable, EMPTY, BehaviorSubject, ReplaySubject } from 'rxjs';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import * as memoryCache from 'memory-cache';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { AccountService } from './core/services/account.service';
import { ChannelService } from './core/services/channel.service';
import { NotificationService } from './core/services/notification.service';
import { ErrorService } from './core/services/error.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SeoService } from './core/services/seo.service';
import { LinkService } from './core/services/link.service';
import { ContentService } from './core/services/content.service';
import { WalletService } from './core/services/wallet.service';
import { PublicationService } from './core/services/publication.service';

const HOMEPAGE_ARTICLES_KEY = makeStateKey('homepage_articles');
const CHANNEL = makeStateKey('channel');
const CHANNEL_CONFIG = makeStateKey('channel_config');
const CHANNEL_AUTHORS = makeStateKey('channel_authors');
const CHANNEL_CURRENT_ARTICLE = makeStateKey('channel_current_article');

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: [],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    ],
})
export class AppComponent implements OnInit, OnDestroy {
    homepageArticles;
    channel;
    test;

    routerSubscription: Subscription = Subscription.EMPTY;
    channelSettings = {};

    constructor(
        private router: Router,
        private http: HttpClient,
        private adapter: DateAdapter<any>,
        private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, // TODO - do not remove this row
        private accountService: AccountService,
        private channelService: ChannelService,
        private platformLocation: PlatformLocation,
        private errorService: ErrorService,
        private walletService: WalletService,
        private seoService: SeoService,
        private state: TransferState,
        private contentService: ContentService,
        private linkService: LinkService,
        private ngZone: NgZone,
        private notificationService: NotificationService,
        @Optional() @Inject(APP_BASE_HREF) private baseHref: string,
        @Inject(PLATFORM_ID) private platformId,
        @Optional() @Inject(REQUEST) private request: any,
        public translate: TranslateService,
        private publicationService: PublicationService
    ) {
    }


    static getDefaultChannelConfig() {
        const fullUrl = environment.main_site_url;
        return {
            'title': 'PUBLIQ – DECENTRALIZED MEDIA',
            'description': 'PUBLIQ is a blockchain distributed media ecosystem owned, ' +
                'governed and operated by a global independent community, whose members enjoy unlimited potential of free expression, enterprising and full protection of their identity and IP rights',
            'site_name': 'PUBLIQ',
            'copyright': 'PUBLIQ – DECENTRALIZED MEDIA',
            'shareThis': true,
            'pixelId': '',
            'image': 'https://publiq.network/media/images/79028.png',
            'css': '',
            'icon32': fullUrl + '/assets/favicon/favicon-32x32.png',
            'icon16': fullUrl + '/assets/favicon/favicon-16x16.png',
            'appleTouchIcon': fullUrl + '/assets/favicon/apple-touch-icon.png',
            'pages': []
        };
    }

    static generateTags(metaTags) {
        let result;
        if (typeof metaTags === 'string') {
            result = [{ display: metaTags, value: metaTags }];
        } else if (Array.isArray(metaTags)) {
            result = metaTags.map(tag => {
                return { display: tag, value: tag };
            });
        } else if (typeof metaTags === 'undefined') {
            result = [];
        }
        return result;
    }


    ngOnInit() {
        if (isPlatformServer(this.platformId)) {
            this.translate.use('en');
            const host = this.request.get('host');

            if (host) {
                const splitHost = host.split('.');
                const channel = splitHost.length === 3 ? splitHost[0] : '';
                this.channelService.channel = channel;
                this.state.set(CHANNEL, channel as any);

                const channelConfigCache = memoryCache.get(`${channel}_channel_config`);
                const channelAuthorsCache = memoryCache.get(`${channel}_authors`);
                // const homePageContentCache = memoryCache.get(`${channel}_homepage_articles`);
                if (channel.length !== 0) {
                    // Check if channel is main channel
                    if (ChannelService.isChannelMain(channel)) {
                        if (!channelConfigCache) {
                            const defaultConfigs = AppComponent.getDefaultChannelConfig();
                            this.state.set(CHANNEL_CONFIG, memoryCache.put(`${channel}_channel_config`, defaultConfigs));
                        } else {
                            this.state.set(CHANNEL_CONFIG, channelConfigCache);
                        }
                        // check if main channel has cached authors
                        if (!channelAuthorsCache) {
                            this.state.set(CHANNEL_AUTHORS, memoryCache.put(`${channel}_authors`, []));
                        } else {
                            this.state.set(CHANNEL_AUTHORS, channelAuthorsCache);
                        }
                        // check if main channel has cached homepage content
                        // if (!homePageContentCache) {
                        //   this.getHomePageContents(channel, []);
                        // } else {
                        //   this.state.set(HOMEPAGE_ARTICLES_KEY, homePageContentCache);
                        // }
                    } else {
                        // check if custom channel has cached config
                        if (!channelConfigCache) {
                            // get new config, set it in memory cache, state and update meta tags
                            this.channelService.getChannel(channel).subscribe(channelConfig => {
                                if (channelConfig) {
                                    this.state.set(CHANNEL_CONFIG, memoryCache.put(`${channel}_channel_config`, channelConfig));
                                    channelConfig['url'] = this.request.protocol + '://' + this.request.get('host') + this.request.originalUrl;
                                    this.seoService.generateTags(channelConfig, 'website');
                                    this.linkService.updateLinks(channelConfig);
                                }
                            }, (err) => {
                                console.log('error from getChannel', err.message);
                            });
                        } else {
                            // set cached channel config in state and update meta tags
                            this.state.set(CHANNEL_CONFIG, channelConfigCache);
                            channelConfigCache['url'] = this.request.protocol + '://' + this.request.get('host') + this.request.originalUrl;
                            this.seoService.generateTags(channelConfigCache, 'website');
                            this.linkService.updateLinks(channelConfigCache);
                        }

                        // check if custom channel has cached authors
                        if (!channelAuthorsCache) {
                            // load new authors, set in memory cache, state and call getHomePageContents() method
                            this.channelService.loadChannelAuthors();
                            this.channelService.channelAuthorsChanged.pipe(take(1), catchError(() => of([]))).subscribe(channelAuthors => {
                                this.state.set(CHANNEL_AUTHORS, memoryCache.put(`${channel}_authors`, channelAuthors || []));
                                // check if custom channel has homepage content
                                // if (!homePageContentCache) {
                                //   this.getHomePageContents(channel, channelAuthors || []);
                                // } else {
                                //   this.state.set(HOMEPAGE_ARTICLES_KEY, homePageContentCache);
                                // }
                            });
                        } else {
                            // set cached authors in state and call getHomePageContents() method if there is no cache for homepage content
                            this.state.set(CHANNEL_AUTHORS, channelAuthorsCache);
                            // if (!homePageContentCache) {
                            //   this.getHomePageContents(channel, channelAuthorsCache);
                            // } else {
                            //   this.state.set(HOMEPAGE_ARTICLES_KEY, homePageContentCache);
                            // }
                        }
                    }
                }
            }

        }

        if (isPlatformBrowser(this.platformId)) {
            this.accountService.logoutDataChanged.subscribe(() => this.publicationService.reset());

            const authToken = this.accountService.auth();
            if (authToken && !this.accountService.accountInfo) {
                this.accountService.loginSession();
            }

            // this.translate.use('en');
            // An EventEmitter to listen to lang change events
            this.translate.onLangChange.subscribe((params: LangChangeEvent) => {
                if (params && params.lang) {
                    const lang: string = params.lang == 'jp' ? 'ja-JP' : 'en';
                    this.adapter.setLocale(lang);

                    this.accountService.changeLang(params.lang);
                }
            });
            this.channelSettings = this.state.get(CHANNEL_CONFIG, {} as any);
            this.channelService.channelConfig = this.channelSettings;
            this.channelService.pages = this.channelSettings['pages'];
            this.channelService.pixelId = this.channelSettings['pixelId'];
            this.channelService.copyright = this.channelSettings['copyright'];
            this.channelService.shareThis = this.channelSettings['shareThis'];
            this.channelService.channel = this.state.get(CHANNEL, null as any);
            this.translate.use(localStorage.getItem('lang') || 'en');


            const channel = this.state.get(CHANNEL, null as any);

            if (!channel) {
                if (this.platformLocation['location']) {
                    const currLocationObj: Location = this.platformLocation['location'];
                    const host =
                        currLocationObj instanceof Location ? currLocationObj.host : '';
                    if (host) {
                        const splitHost = host.split('.');
                        if (splitHost.length === 3) {
                            const channel = splitHost[0];
                            if (
                                channel &&
                                !ChannelService.isChannelMain(channel)
                            ) {
                                this.channelService.channel = splitHost[0];
                                this.channelService.loadChannelAuthors();
                            }
                        } else {
                            this.channelService.setChannelAuthors(['']);
                        }
                    }
                }
            } else if (channel && !ChannelService.isChannelMain(channel)) {
                this.channelService.channel = channel;
                const channelAuthors = this.state.get(CHANNEL_AUTHORS, null as any);
                if (channelAuthors && channelAuthors.length) {
                    this.channelService.setChannelAuthors(channelAuthors);
                } else {
                    this.channelService.loadChannelAuthors();
                }
                this.accountService.accountUpdated$.subscribe(() => {
                    this.channelService.loadChannelAuthors();
                });
            }


            this.routerSubscription = this.router.events
                .pipe(filter(event => event instanceof NavigationEnd))
                .subscribe(event => {
                    this.accountService.showTagList$.emit(false);
                    this.accountService.showSearchBar$.emit(false);
                    document.body.scrollTop = document.documentElement.scrollTop = 0;

                });
        }
    }

    getHomePageContents(channel, channelAuthors) {
        this.contentService.getHomePageContent(channel, channelAuthors).subscribe(([contentData, views]) => {
            if (views) {
                views.map(view => {
                    contentData.map(content => {
                        if (content.ds_id == view._id) {
                            content.viewcount = view.viewcount;
                        }
                    });
                });
            }
            this.state.set(HOMEPAGE_ARTICLES_KEY, memoryCache.put(`${channel}_homepage_articles`, contentData));
        }, err => {
            console.log('error from getHomePageContent', err.message);
        });

    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.routerSubscription.unsubscribe();
            this.walletService.destroyExternalWsService();
        }
    }
}
