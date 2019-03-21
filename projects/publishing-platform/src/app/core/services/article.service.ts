import { EventEmitter, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { Buffer } from 'buffer';
import { filter, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AccountService } from './account.service';
import { Account } from './models/account';
import { Content, PageOptions } from './models/content';
import { OrderOptions } from './content.service';
import { ErrorService } from './error.service';
import { ChannelService } from './channel.service';
import { PublicationService } from './publication.service';
import { Publication } from './models/publication';
import { HttpRpcService } from './httpRpc.service';
import { Boost } from './models/boost';

@Injectable()
export class ArticleService {
    ids: any = [];

    public guestFavouriteTagsKey = 'guest_favourite_tags';
    public userFavouriteTagsKey = 'user_favourite_tags';

    public dialogConfig = {
        maxWidth: '100vw',
        width: '100%',
        height: '100%'
    };
    private readonly apiUrl = `${environment.backend}/api/v1`;
    identifier = 0;
    public headerArticleMeta = new BehaviorSubject<any>(null);

    sponsoredArticlesChanged = new BehaviorSubject<Content[]>([]);

    homepageArticles: Content[] = [];

    termArticlesChanged = new Subject<any>();
    termArticles: any = [];

    getPublicationDataByTermChanged = new Subject<any>();
    getPublicationDataByTerm: any = [];

    getStoriesDataByTermChanged = new Subject<any>();
    getStoriesDataByTerm: any = [];

    getArticlesByTagDataChanged = new Subject<any>();
    getArticlesByTagData: any = [];

    getMyStoriesDataChanged = new Subject<any>();
    getMyStoriesData: any = [];

    suggestContentsByTagsDataChanged = new Subject<Content[]>();
    suggestContentsByTagsData: Content[] = [];

    authorsContentsChanged = new Subject<Content[]>();
    authorsContents: Content[] = [];

    authorContentsChanged = new Subject<Content[]>();
    authorContents: Content[] = [];

    authorsFeedbackChanged = new Subject<any>();
    authorsFeedback: any = [];

    authorStoriesViewsChanged = new Subject<any>();
    authorStoriesViews: any = [];

    // getArticleByIdDataChanged = new Subject<any>();
    getArticleByIdDataChanged = new BehaviorSubject<any>(null);
    getArticleByIdData;

    getArticleHistoryByIdDataChanged = new BehaviorSubject<any>(null);
    getArticleHistoryByIdData;

    getContentViewsDataChanged = new Subject<any>();
    getContentViewsData;

    getContentHistoryDataChanged = new Subject<any>();
    getContentHistoryData;

    articleTagsContentsDataChanged: EventEmitter<Content[]> = new EventEmitter();
    articleTagsContentsData: Content[];

    articleAuthorContentsDataChanged: EventEmitter<Content[]> = new EventEmitter();
    articleAuthorContentsData: Content[];

    boostedArticlesDataChanged = new Subject();
    listPromoByDsIdChanged = new Subject<Boost[]>();
    contentExSponsoredChanged = new Subject<Content[]>();
    homepageTagStoriesViewsChanged = new Subject<any[]>();
    homepageAuthorStoriesViewsChanged = new Subject<any[]>();


    lastArticle = null;
    public isHistoryArticleOpened = false;
    public boostedArticlesCount = 0;

    public articleEventEmitter: EventEmitter<any> = new EventEmitter(true);

    private data: any;

    private static generateTags(metaTags) {
        let result;
        if (typeof metaTags === 'string') {
            result = [{display: metaTags, value: metaTags}];
        } else if (Array.isArray(metaTags)) {
            result = metaTags.map(tag => {
                return {display: tag, value: tag};
            });
        } else if (typeof metaTags === 'undefined') {
            result = [];
        }

        return result;
    }

    constructor(
        private http: HttpClient,
        private accountService: AccountService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private httpRpcService: HttpRpcService,
        private errorService: ErrorService,
        private channelService: ChannelService,
        private publicationService: PublicationService
    ) {
    }

    loadSponsoredArticles(count = 30, boost = 5): void {
        if (isPlatformBrowser(this.platformId)) {
            // let channel = this.channelService.channel ? this.channelService.channel : '';
            const channelAuthors = this.channelService.getChannelAuthors();
            this.httpRpcService
                .call({
                    params: [
                        0,
                        'search_content_ex_sponsored',
                        ['', '', channelAuthors, '-published', '', '0.0.0', '', boost, count]
                    ]
                })
                .pipe(filter(result => result != null))
                .pipe(map(res => this.homePagePurifyContent(res)))
                .subscribe(
                    (result: { boostedArticlesCount: number, articles: Content[] }) => {
                        const data = this.fixTimeString(result.articles);
                        const dsIdArray = [];
                        data.forEach((article: Content) => {
                            dsIdArray.push(article.ds_id);
                        });
                        this.publicationService
                            .getArticlePublication(dsIdArray)
                            .subscribe((pubs: Array<any>) => {
                                if (pubs.length) {
                                    data.map((article: Content) => {
                                        pubs.forEach(publication => {
                                            if (article.ds_id === publication.dsId) {
                                                article.publication = publication.publication;
                                            }
                                        });
                                    });
                                }
                                this.sponsoredArticlesChanged.next(data.slice());
                            });
                    },
                    error => this.errorService.handleError('loadSponsoredArticles', error)
                );
        }
    }

    searchContentExSponsored(blockId, count, boosted): void {
        const channel = !(this.channelService.channel && ChannelService.isChannelMain(this.channelService.channel)) ? this.channelService.channel : '';
        const channelAuthors = this.channelService.getChannelAuthors();

        this.httpRpcService
            .call({
                params: [
                    0,
                    'search_content_ex_sponsored',
                    ['', channel, channelAuthors, '-published', '', blockId, '', boosted, count]
                ]
            })
            .pipe(
                filter(result => result != null),
                map(result => {
                    const stories = [];
                    const dsIds = [];
                    result.map(obj => {
                        const boosted = obj[0];
                        const content = obj[1];

                        content['boosted'] = boosted;
                        stories.push(content);
                        dsIds.push(obj[1]['ds_id']);
                    });

                    this.getContentViews(dsIds);
                    this.publicationService.loadStoriesPublicationByDsId(dsIds);
                    return this.mainPurifyContent(stories);
                })
            )
            .subscribe((data: Content[]) => {
                this.contentExSponsoredChanged.next(data);
            }, error => this.errorService.handleError('searchContentExSponsored', error));
    }

    fixTimeString(data) {
        if (isPlatformBrowser(this.platformId)) {
            data.forEach(obj => {
                if (obj && obj.created) {
                    if (obj.created.slice(-1) !== 'Z') {
                        obj.created = obj.created + 'Z';
                    }
                }
            });

            return data;
        }
    }


    loadSuggestContentsByTags(withAuthorTags = false, forPage: PageOptions = PageOptions.default, count = 3) {
        const favouriteTagsJson = withAuthorTags ?
            localStorage.getItem(this.userFavouriteTagsKey)
            :
            localStorage.getItem(this.guestFavouriteTagsKey);

        if (!favouriteTagsJson) {
            return;
        }
        const arrayParsedObj = (function (targetTags) {
            const parseResult = [];
            for (const key in targetTags) {
                if (targetTags.hasOwnProperty(key)) {
                    const nextTag = [];
                    nextTag.push(key);
                    nextTag.push(targetTags[key]);
                    parseResult.push(nextTag);
                }
            }
            return parseResult;
        }(JSON.parse(favouriteTagsJson)));

        const channel = !(this.channelService.channel && ChannelService.isChannelMain(this.channelService.channel)) ? this.channelService.channel : '';
        const channelAuthors = this.channelService.getChannelAuthors();

        this.httpRpcService
            .call({
                params: [
                    0,
                    'suggest_contents_by_tags',
                    [channel, channelAuthors, arrayParsedObj, count]
                ]
            })
            .pipe(
                filter(result => result != null),
                map(res => this.mainPurifyContent(res))
            )
            .subscribe((data: Content[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    data = this.fixTimeString(data);

                    const dsIdArray = [];
                    data.forEach((article: Content) => {
                        dsIdArray.push(article.ds_id);
                    });
                    if (forPage === PageOptions.homepageTagStories) {
                        this.publicationService.loadStoriesPublicationByDsId(dsIdArray, PageOptions.homepageTagStories);
                        this.getContentViews(dsIdArray, PageOptions.homepageTagStories);
                    } else {
                        this.publicationService.loadStoriesPublicationByDsId(dsIdArray);
                        this.getContentViews(dsIdArray, PageOptions.homepageTagStories);
                    }

                    this.suggestContentsByTagsData = data.slice();
                    this.suggestContentsByTagsDataChanged.next(this.suggestContentsByTagsData);
                }
            }, error => this.errorService.handleError('loadSuggestContentsByTags', error));
    }

    sortTags(obj: object) {
        return Object.keys(obj).sort(function (a, b) {
            return obj[b] - obj[a];
        });
    }

    getAuthorsArticles() {
        return this.authorsContents.slice();
    }

    loadHompageAuthorsArticles(subscribers, forPage: PageOptions = PageOptions.default, count = 3): void {
        if (isPlatformBrowser(this.platformId)) {
            const channel = this.channelService.channel && !(ChannelService.isChannelMain(this.channelService.channel)) ? this.channelService.channel : '';

            this.httpRpcService
                .call({
                    params: [
                        0,
                        'search_content_by_authors',
                        [subscribers, channel, count]
                    ]
                })
                .pipe(
                    filter(result => result != null),
                    map(res => this.mainPurifyContent(res))
                )
                .subscribe(
                    (data: Content[]) => {
                        if (forPage === PageOptions.homepageAuthorStories) {
                            data  = data.sort( () => Math.random() - 0.5).slice(0, 6);
                        }
                        const dsIdArray = [];
                        data.forEach((article: Content) => {
                            if (article && article.created) {
                                if (article.created.slice(-1) !== 'Z') {
                                    article.created = article.created + 'Z';
                                }
                            }
                            dsIdArray.push(article.ds_id);
                        });

                        this.publicationService.loadStoriesPublicationByDsId(dsIdArray, PageOptions.homepageAuthorStories);
                        this.getContentViews(dsIdArray, PageOptions.homepageAuthorStories);

                        this.authorsContents = data.slice();
                        this.authorsContentsChanged.next(this.authorsContents);
                    },
                    error => this.errorService.handleError('loadHompageAuthorsArticles', error)
                );
        }
    }

    loadAuthorStories(authorId: string, count: number, blockId: string): void {
        if (isPlatformBrowser(this.platformId)) {
            const channel = !(this.channelService.channel && ChannelService.isChannelMain(this.channelService.channel)) ? this.channelService.channel : '';

            this.httpRpcService
                .call({
                    params: [0, 'search_content_by_authors2', [[authorId], channel, '-time', blockId, count]]
                })
                .pipe(
                    filter(result => result != null),
                    map(res => this.mainPurifyContent(res))
                )
                .subscribe((data: Content[]) => {
                        data = this.fixTimeString(data);
                        const dsIdArray = [];
                        data.forEach((article: Content) => {
                            dsIdArray.push(article.ds_id);
                        });
                        this.publicationService
                            .getArticlePublication(dsIdArray)
                            .subscribe((pubs: any[]) => {
                                if (pubs && pubs.length) {
                                    data.map((article: Content) => {
                                        pubs.forEach(publication => {
                                            if (article.ds_id === publication.dsId) {
                                                article.publication = publication.publication;
                                            }
                                        });
                                    });
                                }
                                this.authorContents = data;
                                this.authorContentsChanged.next(this.authorContents.slice());
                                this.loadStoriesViewsByDsId(dsIdArray);
                            });
                    },
                    error => this.errorService.handleError('loadAuthorStories', error)
                );
        }
    }

    loadAuthorFeedback(id: string): void {
        if (isPlatformBrowser(this.platformId)) {
            const url = this.apiUrl + `/user/author-contents-stats/${id}`;
            this.http.get(url).subscribe(
                data => {
                    this.authorsFeedback = data;
                    this.authorsFeedbackChanged.next(data);
                },
                error => this.errorService.handleError('loadAuthorFeedback', error)
            );
        }
    }

    loadStoriesViewsByDsId(ids: string[]): void {
        if (isPlatformBrowser(this.platformId)) {
            const url = `${environment.ds_backend}/content/views`;
            this.http
                .post(url, {ids: ids})
                .pipe(filter(res => res != null))
                .subscribe((data: any[]) => {
                        this.authorStoriesViews = data;
                        this.authorStoriesViewsChanged.next(this.authorStoriesViews.slice());
                    },
                    error =>
                        this.errorService.handleError('loadStoriesViewsByDsId', error, url)
                );
        }
    }

    mainPurifyContent(data: any, filter?: string): Content[] {
        const contents: Content[] = [];
        data.map(content => {
            if (
                typeof content.meta === 'undefined' ||
                typeof content.meta.headline === 'undefined'
            ) {
                return false;
            }

            if (filter && content.author !== filter) {
                return false;
            }

            content.meta.tags = ArticleService.generateTags(content.meta.tags);

            content.meta.displayTags = content.meta.tags.map(t => {
                if (t.display) {
                    return t.display;
                } else if (t.name) {
                    return t.name;
                }
            });

            if (content.full_account) {
                content.full_account = new Account(content.full_account);
            }

            if (content['boosts'] && content['boosts'].length) {
                content['boosts'] = content['boosts'].map(boostObj => new Boost(boostObj));
            }
            contents.push(new Content(content));
        });

        return contents;
    }

    homePagePurifyContent(data: any, filter?: string): { boostedArticlesCount: number, articles: Content[] } {
        const contents: Content[] = [];
        let boostedArticlesCount = 0;
        data.map((dataArr: any[]) => {
            if (dataArr[0]) {
                boostedArticlesCount++;
            }
            return {...dataArr[1], boosted: dataArr[0]};
        }).map(content => {
            if (
                typeof content.meta === 'undefined' ||
                typeof content.meta.headline === 'undefined'
            ) {
                return false;
            }

            if (filter && content.author !== filter) {
                return false;
            }

            content.meta.tags = ArticleService.generateTags(content.meta.tags);

            content.meta.displayTags = content.meta.tags.map(t => {
                if (t.display) {
                    return t.display;
                } else if (t.name) {
                    return t.name;
                }
            });

            if (content.full_account) {
                content.full_account = new Account(content.full_account);
            }

            contents.push(new Content(content));
        });
        return {boostedArticlesCount, articles: contents};
    }

    getArticleById(id: string, needFullAccount = true): void {
        const url = `${environment.ds_backend}/content/${id}`;
        if (isPlatformBrowser(this.platformId)) {
            this.http.get(url).subscribe(
                (data: Content) => {
                    if (data && data.created && data.created.slice(-1) !== 'Z') {
                        data.created = data.created + 'Z';
                    }
                    if (data['content']) {
                        data['meta'].tags = ArticleService.generateTags(data['meta'].tags);

                        data['content'].data = JSON.parse(
                            new Buffer(
                                new Buffer(data['content'].data).toString(),
                                'hex'
                            ).toString()
                        );
                        const dsIdArray = [];
                        dsIdArray.push(data['_id']);
                        this.publicationService
                            .getArticlePublication(dsIdArray)
                            .subscribe((res: Array<any>) => {
                                if (res.length !== 0) {
                                    data['publication'] = res[0].publication;
                                }
                                if (needFullAccount) {
                                    const identifier = data['author'] || data['publisher'];
                                    this.httpRpcService
                                        .call({
                                            params: [0, 'get_accounts', [[identifier]]]
                                        })
                                        .pipe(
                                            filter(account => account != 'undefined' || account != null)
                                        )
                                        .pipe(map(account => new Account(account[0])))
                                        .subscribe(
                                            fullAccount => {
                                                data['full_account'] = fullAccount;

                                                this.getArticleByIdData = data;
                                                this.getArticleByIdDataChanged.next(
                                                    this.getArticleByIdData
                                                );
                                            },
                                            () => {
                                                this.errorService.handleError(
                                                    'getArticleById',
                                                    {status: 409, error: {message: 'article_not_found'}},
                                                    url
                                                );
                                            }
                                        );
                                } else {
                                    this.getArticleByIdData = data;
                                    this.getArticleByIdDataChanged.next(this.getArticleByIdData);
                                }
                            });


                    } else {
                        this.errorService.handleError(
                            'getArticleById',
                            {status: 409, error: {message: 'article_not_found'}},
                            url
                        );
                    }
                },
                () =>
                    this.errorService.handleError(
                        'getArticleById',
                        {status: 409, error: {message: 'article_not_found'}},
                        url
                    )
            );
        }
    }

    getArticleHistoryById(id: string): void {
        const url = `${environment.ds_backend}/content/${id}`;
        if (isPlatformBrowser(this.platformId)) {
            this.http.get(url).subscribe(
                (data: Content) => {
                    if (data && data.created && data.created.slice(-1) !== 'Z') {
                        data.created = data.created + 'Z';
                    }
                    if (data['content']) {
                        data['meta'].tags = ArticleService.generateTags(data['meta'].tags);

                        data['content'].data = JSON.parse(
                            new Buffer(
                                new Buffer(data['content'].data).toString(),
                                'hex'
                            ).toString()
                        );

                        this.getArticleHistoryByIdData = data;
                        this.getArticleHistoryByIdDataChanged.next(
                            this.getArticleHistoryByIdData
                        );
                    } else {
                        this.errorService.handleError(
                            'getArticleHistoryById',
                            {status: 409, error: {message: 'article_not_found'}},
                            url
                        );
                    }
                },
                error =>
                    this.errorService.handleError(
                        'getArticleById',
                        {status: 409, error: {message: 'article_not_found'}},
                        url
                    )
            );
        }
    }

    getStoriesByTag(searchTerms: string, blochId: string, count: number) {
        if (isPlatformBrowser(this.platformId)) {
            const channel = !(this.channelService.channel && ChannelService.isChannelMain(this.channelService.channel)) ? this.channelService.channel : '';
            const channelAuthors = this.channelService.getChannelAuthors();
            this.httpRpcService.call({
                params: [
                    0,
                    'get_channel_contents',
                    [[searchTerms], channel, channelAuthors, OrderOptions.created_asc, blochId, count]
                ]
            })
                .pipe(
                    filter(result => result != null),
                    map((stories: any[]) => {
                        if (stories && stories.length) {
                            const dsIdArray = [];
                            stories.forEach((story: Content) => {
                                dsIdArray.push(story.ds_id);
                            });
                            this.publicationService.loadStoriesPublicationByDsId(dsIdArray);
                            this.loadStoriesViewsByDsId(dsIdArray);
                        }
                        return this.mainPurifyContent(stories);
                    })
                )
                .subscribe((data: Content[]) => {
                        this.getArticlesByTagData = data;
                        this.getArticlesByTagDataChanged.next(this.getArticlesByTagData);
                    },
                    error => this.errorService.handleError('getStoriesByTag', error)
                );
        }
    }

    getMyStories(userPublicKey: string, blockId: string, count: number, term: string = '',
                 order: OrderOptions = OrderOptions.default, type = ''
    ) {
        const channel = !(this.channelService.channel && ChannelService.isChannelMain(this.channelService.channel)) ? this.channelService.channel : '';
        const channelAuthors = this.channelService.getChannelAuthors();
        this.httpRpcService
            .call({
                params: [
                    0,
                    'search_content_ex2',
                    [
                        term, channel, channelAuthors, order, userPublicKey, blockId, type, count
                    ]
                ]
            })
            .pipe(
                filter(result => (result != null)),
                map(contents => {
                        const result = [];
                        const dsIds = [];
                        if (contents) {
                            contents.map(item => {
                                if (item[0]) {
                                    if (item[1] && item[1].length) {
                                        item[0]['boosts'] = item[1];
                                    }
                                    result.push(item[0]);
                                    dsIds.push(item[0]['ds_id']);
                                }
                            });
                            this.publicationService.loadStoriesPublicationByDsId(dsIds);
                        }

                        return this.mainPurifyContent(result, this.accountService.getAccount().id);
                    }
                )
            )
            .subscribe((data: Content[]) => {
                this.getMyStoriesData = data;
                this.getMyStoriesDataChanged.next(this.getMyStoriesData);
            });
    }


    getUserBoostedArticles(accountId, promoter = '', limit = 1000) {
        this.httpRpcService
            .call({
                params: [
                    0,
                    'list_promos',
                    [accountId, promoter, 1, +(new Date(new Date().toISOString()).getTime() / 1000).toFixed(), '', limit]
                ]
            }).subscribe(res => {
            this.boostedArticlesDataChanged.next(res);
        });
    }

    getListPromoByDsId(dsId: string): void {
        const requestObj = {params: [0, 'list_promos_by_URI', [dsId]]};
        this.httpRpcService.call(requestObj)
            .pipe(
                filter(data => data != null),
                map((data: any[]) => {
                    if (data.length) {
                        return data.map(boostObj => new Boost(boostObj));
                    }
                    return [];
                })
            )
            .subscribe((res: Boost[]) => {
                    this.listPromoByDsIdChanged.next(res);
                }, error => this.errorService.handleError('getListPromoByDsId', error)
            );
    }

    getArticlesByTerm(term = '', order: OrderOptions, user = '', itemId = '', type = '', count = 10): void {
        if (isPlatformBrowser(this.platformId)) {
            const channel = !ChannelService.isChannelMain(this.channelService.channel)
                ? this.channelService.channel
                : '';
            const channelAuthors = this.channelService.getChannelAuthors();

            const dataFromWs = this.httpRpcService
                .call({
                    params: [
                        0,
                        'search_term',
                        [
                            term,
                            channel,
                            channelAuthors,
                            order,
                            user,
                            itemId || '0.0.0',
                            type,
                            count
                        ]
                    ]
                })
                .pipe(filter(result => result != null))
                .pipe(
                    map(data => {
                        const result = [];
                        let accountMeta;

                        if (data.account.length) {
                            const realAccounts = [];
                            data.account.map((obj) => {
                                if (obj.meta) {
                                    accountMeta = JSON.parse(obj.meta);
                                    if ((accountMeta.first_name && accountMeta.first_name.trim().length)
                                        || (accountMeta.last_name && accountMeta.last_name.trim().length)) {
                                        realAccounts.push(obj);
                                    }
                                }
                            });
                            data.account = realAccounts;

                            if (data.account.length) {
                                if (data.account.length > 3) {
                                    result.push({more_accounts: true});
                                    data.account = data.account.slice(0, 3);
                                } else {
                                    result.push({accounts_list: true});
                                }

                                data.account.map((obj) => {
                                    result.push(new Account(obj));
                                });
                            }
                        }

                        if (data.content.length) {
                            if (data.content.length > 3) {
                                result.push({more_contents: true});
                                data.content = data.content.slice(0, 3);
                            } else {
                                result.push({contents_list: true});
                            }

                            data.content.map(obj => {
                                result.push(new Content(obj));
                            });
                        }
                        return result;
                    })
                )
                .pipe(map(res => this.mainPurifyHeaderSearch(res)));

            const publicationData = this.http.post(this.apiUrl + '/publication/search', {'searchWord': term})
                .pipe(filter(result => result != null))
                .pipe(
                    map(data => {
                        const result = [];
                        if (Object.keys(data).length) {
                            if (Object.keys(data).length > 3) {
                                result.push({more_publications: true});
                                data = {'0': data[0], '1': data[1], '2': data[2]};
                            } else {
                                result.push({publications_list: true});
                            }

                            Object.keys(data).forEach(function (key) {
                                data[key]['publicationItem'] = true;
                                result.push(new Publication(data[key]));
                            });
                        }

                        return result;
                    })
                )
                .pipe(map(res => this.mainPurifyHeaderSearch(res)));

            forkJoin([dataFromWs, publicationData])
                .subscribe(results => {
                        this.termArticles = results[0].concat(results[1]);
                        this.termArticlesChanged.next(this.termArticles);
                    },
                    error => this.errorService.handleError('getArticlesByTerm', error)
                );
        }
    }

    getStoriesByTerm(term: string, itemId: string, count: number, order: OrderOptions = OrderOptions.published_asc, user = '', type = '') {
        if (isPlatformBrowser(this.platformId)) {
            const channel = !(this.channelService.channel && ChannelService.isChannelMain(this.channelService.channel)) ? this.channelService.channel : '';
            const channelAuthors = this.channelService.getChannelAuthors();
            const sponsordCount = Math.round(count * 0.1);
            this.httpRpcService
                .call({
                    'params': [0, 'search_content_ex_sponsored', [term, channel, channelAuthors, order, '', itemId, '', sponsordCount, count]]
                })
                .pipe(
                    filter(result => result != null),
                    map(res => {
                        const stories = [];
                        const dsIds = [];
                        res.map(obj => {
                            const boosted = obj[0];
                            const content = obj[1];

                            content['boosted'] = boosted;
                            stories.push(content);
                            dsIds.push(obj[1]['ds_id']);
                        });

                        this.getContentViews(dsIds);
                        return this.mainPurifyContent(stories);
                    })
                )
                .subscribe(
                    data => {
                        this.getStoriesDataByTerm = data;
                        this.getStoriesDataByTermChanged.next(this.getStoriesDataByTerm);
                    },
                    error => this.errorService.handleError('getStoriesByTerm', error)
                );
        }
    }

    getPublicationsByTerm(term) {
        this.http.post(this.apiUrl + '/publication/search', {'searchWord': term})
            .pipe(filter(result => result != null))
            .pipe(map(res => this.mainPurifyHeaderSearch(res)))
            .subscribe(
                data => {
                    this.getPublicationDataByTerm = data;
                    this.getPublicationDataByTermChanged.next(this.getPublicationDataByTerm);
                },
                error => this.errorService.handleError('getPublicationsByTerm', error)
            );
    }

    getHeaderArticleMeta() {
        return this.headerArticleMeta;
    }

    setHeaderArticleMeta(data) {
        return this.headerArticleMeta.next(data);
    }

    getContentViews(ids: string[], forPage: PageOptions = PageOptions.default): void {
        if (isPlatformBrowser(this.platformId) && ids && ids.length) {
            const url = `${environment.ds_backend}/content/views`;
            this.http
                .post(url, {ids: ids})
                .pipe(filter(data => data != null))
                .subscribe((data: any[]) => {
                        if (forPage === PageOptions.homepageTagStories) {
                            this.homepageTagStoriesViewsChanged.next(data);
                        } else if (forPage === PageOptions.homepageAuthorStories) {
                            this.homepageAuthorStoriesViewsChanged.next(data);
                        } else {
                            this.getContentViewsData = data;
                            this.getContentViewsDataChanged.next(this.getContentViewsData);
                        }
                    },
                    error => {
                        this.getContentViewsData = [];
                        this.getContentViewsDataChanged.next(this.getContentViewsData);
                        this.errorService.handleError('getContentViews', error, url);
                    }
                );
        }
    }

    public getAccountToken() {
        return this.accountService.accountInfo &&
        this.accountService.accountInfo.token
            ? this.accountService.accountInfo.token
            : null;
    }

    loadArticleAuthorContentsData(authorId: string, count = 4): void {
        if (isPlatformBrowser(this.platformId)) {
            const channel = this.channelService.channel
                ? this.channelService.channel
                : '';
            this.httpRpcService
                .call({
                    params: [0, 'search_content_by_authors', [[authorId], channel, count]]
                })
                .pipe(filter(result => result != null))
                .pipe(map(res => this.mainPurifyContent(res)))
                .subscribe(
                    (data: Content[]) => {
                        data = this.fixTimeString(data);
                        const dsIdArray = [];
                        data.forEach((article: Content) => {
                            dsIdArray.push(article.ds_id);
                        });
                        this.publicationService
                            .getArticlePublication(dsIdArray)
                            .subscribe((pubs: Array<any>) => {
                                if (pubs.length) {
                                    data.map((article: Content) => {
                                        pubs.forEach(publication => {
                                            if (article.ds_id === publication.dsId) {
                                                article.publication = publication.publication;
                                            }
                                        });
                                    });
                                }
                                this.articleAuthorContentsData = data.slice();
                                this.articleAuthorContentsDataChanged.emit(
                                    this.articleAuthorContentsData
                                );
                            });
                    },
                    error =>
                        this.errorService.handleError(
                            'loadArticleAuthorContentsData',
                            error
                        )
                );
        }
    }

    loadArticleTagsContents(tags: string[], count = 4): void {
        if (isPlatformBrowser(this.platformId)) {
            const channel = this.channelService.channel
                ? this.channelService.channel
                : '';
            const channelAuthors = this.channelService.getChannelAuthors();
            this.httpRpcService
                .call({
                    params: [
                        0,
                        'get_channel_contents',
                        [tags, channel, channelAuthors, '', '0.0.0', count]
                    ]
                })
                .pipe(filter(result => result != null))
                .pipe(map(res => this.mainPurifyContent(res)))
                .subscribe(
                    data => {
                        const dsIdArray = [];
                        data.forEach((article: Content) => {
                            dsIdArray.push(article.ds_id);
                        });
                        this.publicationService
                            .getArticlePublication(dsIdArray)
                            .subscribe((pubs: Array<any>) => {
                                if (pubs.length) {
                                    data.map((article: Content) => {
                                        pubs.forEach(publication => {
                                            if (article.ds_id === publication.dsId) {
                                                article.publication = publication.publication;
                                            }
                                        });
                                    });
                                }
                                this.articleTagsContentsData = data.slice();
                                this.articleTagsContentsDataChanged.emit(
                                    this.articleTagsContentsData
                                );
                            });
                    },
                    error =>
                        this.errorService.handleError('loadArticleTagsContents', error)
                );
        }
    }

    hasSeperator(beforeArticles, afterArticles) {
        return beforeArticles &&
        beforeArticles.length &&
        afterArticles &&
        afterArticles.length
            ? true
            : false;
    }

    getContentHistory(dsId: string): void {
        this.httpRpcService
            .call({
                params: [0, 'get_content_history', [dsId]]
            })
            .subscribe(
                (data: any) => {
                    if (data) {
                        data.map(data => {
                            data['full_account'] = new Account(data['full_account']);
                        });
                        this.getContentHistoryData = data;
                        this.getContentHistoryDataChanged.next(data);
                    }
                },
                error => this.errorService.handleError('getContentHistory', error)
            );
    }

    mainPurifyHeaderSearch(data: any) {
        data.map(el => {
            if (el.author) {
                if (typeof el.meta.headline === 'undefined') {
                    return false;
                }
            }

            if (el.author) {
                el.meta.tags = ArticleService.generateTags(el.meta.tags);

                el.meta.displayTags = el.meta.tags.map(t => {
                    if (t.display) {
                        return t.display;
                    } else if (t.name) {
                        return t.name;
                    }
                });
                el.isContent = true;

                el.full_account = new Account(el.full_account);

                return el;
            } else if (el.more_contents || el.contents_list) {
                el.isContent = true;
                return el;
            } else if (el.more_publications || el.publications_list || el.publicationItem == true) {
                el.isPublication = true;
                return el;
            } else {
                el.isAccount = true;
                return el;
            }
        });

        return data;
    }

    cropStoryCover(imageData) {
        const url = this.apiUrl;
        if (isPlatformBrowser(this.platformId)) {
            this.http
                .put(this.apiUrl + '/crop-cover-image', imageData, {
                    headers: new HttpHeaders({'X-API-TOKEN': this.getAccountToken()})
                })
                .subscribe(
                    data => {
                    },
                    error => this.errorService.handleError('cropStoryCover', error, url)
                );
        }
    }
}
