import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Publication } from './models/publication';
import { AccountService } from './account.service';
import { Content, PageOptions } from './models/content';
import { Account } from './models/account';
import { ErrorService } from './error.service';
import { ChannelService } from './channel.service';
import { ContentService } from './content.service';
import { HttpRpcService } from './httpRpc.service';
import { HttpHelperService, HttpMethodTypes } from 'shared-lib';
import { IPublications, Publications } from './models/publications';


@Injectable()
export class PublicationService {
  public tabIndexInv = 0;
  public tabIndexReq = 0;
  myPublications: ReplaySubject<any>;
  myMemberships: ReplaySubject<any>;
  myInvitations: ReplaySubject<any>;
  myRequests: ReplaySubject<any>;
  pendingPublications: ReplaySubject<any[]>;
  private subscribers;
  subscribersChanged = new Subject<any[]>();
  loadStoriesPublicationByDsIdDataChanged = new Subject<any[]>();
  homepageTagStoriesPublicationChanged = new Subject<Publication[]>();
  homepageAuthorStoriesPublicationChanged = new Subject<Publication[]>();
  imagePath: string = environment.backend + '/uploads/publications/';

  public publicationContent$ = new Subject();

  private readonly url = environment.backend + '/api/publication';

  constructor(
    private http: HttpClient,
    private httpHelper: HttpHelperService,
    private accountService: AccountService,
    private httpRpcService: HttpRpcService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private errorService: ErrorService,
    private channelService: ChannelService,
    private contentService: ContentService
  ) {
    this.reset();
  }

  createPublication(data: object | FormData): Observable<any> {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + '/create', data);
  }

  editPublication(data: object | FormData, slug: string): Observable<any> {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug, data);
  }

  getMyPublications() {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    this.http
      .get(environment.backend + '/api/v1/publication/my-publications', header)
      .subscribe((data: Array<Publication>) => {
        this.myPublications.next(data['owned']);
        this.myInvitations.next(data['invitations']);
        this.myMemberships.next(data['membership']);
        this.myRequests.next(data['requests']);
        return true;
      });
  }

  getMyPublications2() {
    return this.httpHelper.call(HttpMethodTypes.get, this.url + 's')
      .pipe(map((data: IPublications) => new Publications(data)));
  }

  getPublicationBySlug(slug: string | number): Observable<Publication> {
    return this.httpHelper.call(HttpMethodTypes.get, this.url + '/' + slug)
      .pipe(
        filter(data => data != null),
        map(data => new Publication(data))
      );
  }

  public getAccountToken() {
    return this.accountService.accountInfo &&
    this.accountService.accountInfo.token
      ? this.accountService.accountInfo.token
      : null;
  }

  addMember(body, slug) {
    const authToken = this.getAccountToken();
    const options: any = {headers: new HttpHeaders({'X-API-TOKEN': authToken}), observe: 'response'};
    return this.http.post<any>(
      environment.backend + '/api/v1/publication/' + slug + '/invite-a-member',
      {invitations: body},
      options
    );
  }

  getMembers(slug) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http
      .get(
        environment.backend + '/api/v1/publication/' + slug + '/members',
        header
      )
      .pipe(
        map((res: string) => {
          return res;
        })
      );
  }

  getPublicationArticles(slug) {
    return this.http.get(
      environment.backend + '/api/v1/publication/' + slug + '/articles'
    );
  }

  mainPurifyContent(data: any, filter?: string): Content[] {
    const contents: Content[] = [];
    data.map(content => {
      if (content.full_account) {
        content.full_account = new Account(content.full_account);
      }
      contents.push(new Content(content));
    });

    return contents;
  }

  removeArticle(dsId, slug) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend + '/api/v1/publication/' + slug + '/remove-article',
      {dsId: dsId},
      header
    );
  }

  deletePublication = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.delete, this.url + '/' + slug);

  requestBecomeMember = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug + '/request');

  cancelBecomeMember = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.delete, this.url + '/' + slug + '/request');

  acceptInvitationBecomeMember = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug + '/invitation/response');

  rejectInvitationBecomeMember = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.delete, this.url + '/' + slug + '/invitation/response');

  getContentsByDsId(dsIdArray: Array<string>) {
    this.httpRpcService
      .call({
        params: [0, 'get_contents', [dsIdArray]]
      })
      .pipe(
        map((result: Array<any>) => {
          const resArr = result.map(el => el[1]);
          return this.mainPurifyContent(resArr);
        })
      ).subscribe(res => {
      this.publicationContent$.next(res);
    });
  }

  acceptInvitation(body) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend + '/api/v1/publication/invitation-response',
      body,
      header
    );
  }

  acceptRequest(body) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend + '/api/v1/publication/membership-response',
      body,
      header
    );
  }

  addPublicationToStory(dsId, slug) {
    const body = {
      dsId: dsId,
      publication_slug: slug == 'none' ? '' : slug
    };
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend + '/api/v1/content/change-article-publication',
      body,
      header
    );
  }


  cnacelInvitation(body) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.delete(
      `${environment.backend}/api/v1/publication/cancel-invitation/${body}`,
      header
    );
  }

  getArticlePublication(dsArray) {
    return this.http.post(
      environment.backend + '/api/v1/content/publications',
      {articles: dsArray}
    );
  }

  loadStoriesPublicationByDsId(dsArray: string[], forPage: PageOptions = PageOptions.default): void {
    // const url = environment.backend + '/api/v1/content/publications';
    // this.http.post(url, {articles: dsArray})
    //     .pipe(
    //         filter(data => data != null),
    //         map((data: any[]) => {
    //                 data.map(item => {
    //                     if (item['publication']) {
    //                         item['publication'] = new Publication(item['publication']);
    //                     }
    //                 });
    //
    //                 return data;
    //             }
    //         )
    //     )
    //     .subscribe((publications) => {
    //         // @ts-ignore
    //         if (forPage === PageOptions.homepageTagStories) {
    //             this.homepageTagStoriesPublicationChanged.next(publications);
    //         } else if (forPage === PageOptions.homepageAuthorStories) {
    //             this.homepageAuthorStoriesPublicationChanged.next(publications);
    //         } else {
    //             this.loadStoriesPublicationByDsIdDataChanged.next(publications);
    //         }
    //     }, error => this.errorService.handleError('loadStoriesPublicationByDsId', error, url));
  }

  changeMemberStatus(member) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend +
      `/api/v1/publication/${member.slug}/change-member-status`,
      {publicKey: member.publicKey, status: member.status},
      header
    );
  }

  getUserFollowers() {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    const url =
      environment.backend + `/api/v1/user/subscription/user`;
    return this.http.get(url, header);
  }

  loadSubscribers(slug: string) {
    if (isPlatformBrowser(this.platformId)) {
      const url =
        environment.backend + `/api/v1/publication/subscribers/${slug}`;
      this.http.get(url).subscribe(
        res => {
          this.subscribers = res;
          this.subscribersChanged.next(this.subscribers.slice());
        },
        error => this.errorService.handleError('loadSubscribers', error, url)
      );
    }
  }

  public follow = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.put, this.url + '/subscription/' + slug);

  public unfollow = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.delete, this.url + '/subscription/' + slug);

  deleteMembership(slug) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.delete(
      this.url + `/delete-membership/${slug}`,
      header
    );
  }

  deleteMember(slug, publicKey) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.delete(
      `${
        environment.backend
        }/api/v1/publication/delete-member/${slug}/${publicKey}`,
      header
    );
  }

  reset() {
    this.myPublications = new ReplaySubject(1);
    this.myMemberships = new ReplaySubject(1);
    this.myInvitations = new ReplaySubject(1);
    this.myRequests = new ReplaySubject(1);
    this.pendingPublications = new ReplaySubject(1);
  }
}
