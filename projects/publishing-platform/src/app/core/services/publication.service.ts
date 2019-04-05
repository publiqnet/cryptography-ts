import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Publication } from './models/publication';
import { PageOptions } from './models/content';
import { HttpHelperService, HttpMethodTypes, HttpObserverService } from 'helper-lib';
import { IPublications, Publications } from './models/publications';


@Injectable()
export class PublicationService {
  public tabIndexInv = 0;
  public tabIndexReq = 0;

  private observers: object = {
    'getMyPublications': { name: '_getMyPublications', refresh: false }
  };

  myPublications$: BehaviorSubject<Publications | null> = new BehaviorSubject(null);

  loadStoriesPublicationByDsIdDataChanged = new Subject<any[]>();
  homepageTagStoriesPublicationChanged = new Subject<Publication[]>();
  homepageAuthorStoriesPublicationChanged = new Subject<Publication[]>();

  private readonly url = environment.backend + '/api/publication';

  constructor(private httpHelper: HttpHelperService, private httpObserverService: HttpObserverService) {}

  public set RefreshObserver(name: any) {
    if (this.observers.hasOwnProperty(name)) {
      this.observers[name].refresh = true;
    }
  }

  createPublication: (data: (object | FormData)) => Observable<any> = (data: object | FormData): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + '/create', data)
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  editPublication = (data: object | FormData, slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug, data)
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  getMyPublications: () => Observable<any> = () => {
    const callData: any = this.observers['getMyPublications'];
    return this.httpObserverService.observerCall(callData.name, this.httpHelper.call(HttpMethodTypes.get, this.url + 's')
      .pipe(
        filter(data => data != null),
        map((data: IPublications) => new Publications(data)),
        tap((data: Publications) => { callData.refresh = false; this.myPublications$.next(data); })
      ), callData.refresh);
  }

  getMyPublicationsByType = (type: string) => {
    return this.httpHelper.call(HttpMethodTypes.get, this.url + 's' + `/${type}`)
      .pipe(map((data: IPublications) => new Publications(data)));
  }

  getPublicationBySlug = (slug: string | number): Observable<Publication> => {
    return this.httpHelper.call(HttpMethodTypes.get, this.url + '/' + slug)
      .pipe(
        filter(data => data != null),
        map(data => new Publication(data))
      );
  }

  addMember = (body: any, slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug + '/invite-a-member', {invitations: body});
  }

  inviteBecomeMember = (body: object[], slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug + '/invitation', {invitations: body});
  }

  getMembers: (slug: string) => Observable<any> = (slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.get, this.url + `/${slug}/` + 'members');
  }

  getPublicationArticles = (slug: string): Observable<any> => this.httpHelper.customCall(HttpMethodTypes.get, this.url + `/${slug}/` + '/articles');

  removeArticle: (dsId: string, slug: string) => Observable<any> = (dsId: string, slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + `/${slug}/` + 'remove-article', {dsId: dsId});
  }

  deletePublication = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.delete, this.url + '/' + slug);

  requestBecomeMember = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug + '/request');

  cancelBecomeMember = (slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.delete, this.url + '/' + slug + '/request')
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  acceptInvitationBecomeMember = (slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + '/' + slug + '/invitation/response');
  }

  rejectInvitationBecomeMember = (slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.delete, this.url + '/' + slug + '/invitation/response');
  }

  acceptInvitation = (body: any): Observable<any> => this.httpHelper.call(HttpMethodTypes.post, this.url + '/invitation-response', body);

  acceptRejectRequest = (slug: string, publicKey: string, action: 'accept' | 'reject'): Observable<any> => {
    const method = action == 'accept' ? HttpMethodTypes.post : HttpMethodTypes.delete;
    return this.httpHelper.call(method, this.url + `/${slug}/request/response/${publicKey}`)
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  addPublicationToStory(dsId: string, slug: string): Observable<any> {
    const body = {dsId: dsId, publication_slug: slug == 'none' ? '' : slug};
    return this.httpHelper.call(HttpMethodTypes.post, environment.backend + '/api/v1/content/change-article-publication', body);
  }

  cancelInvitation = (body: any): Observable<any> => this.httpHelper.call(HttpMethodTypes.delete, `${this.url}/cancel-invitation/${body}`, );

  getArticlePublication = (dsArray: any[]): Observable<any> => this.httpHelper.customCall(HttpMethodTypes.post, this.url + 's', {articles: dsArray});

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

  changeMemberStatus = (member: any): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + `${member.slug}/change-member-status`, {
      publicKey: member.publicKey,
      status: member.status
    });
  }

  getUserFollowers: () => Observable<any> = (): Observable<any> => {
    const url = environment.backend + `/api/v1/user/subscription/user`;
    return this.httpHelper.call(HttpMethodTypes.get, url);
  }

  getPublicationSubscribers = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.get, this.url + `/subscribers/${slug}`);

  follow = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.put, this.url + '/subscription/' + slug);

  unfollow = (slug: string): Observable<any> => this.httpHelper.call(HttpMethodTypes.delete, this.url + '/subscription/' + slug);

  deleteMembership: (slug: string) => Observable<any> = (slug: string): Observable<any> => {
    return this.httpHelper.call(HttpMethodTypes.post, this.url + `/delete-membership/${slug}`);
  }

  deleteMember(slug: string, publicKey: any) {
    return this.httpHelper.call(HttpMethodTypes.delete, `${this.url}/delete-member/${slug}/${publicKey}`);
  }

  reset() {
    this.myPublications$ = new BehaviorSubject(null);
  }
}
