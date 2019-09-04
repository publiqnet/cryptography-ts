import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subject, from } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Publication } from './models/publication';
import { PageOptions, Content } from './models/content';
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

  constructor(private httpHelperService: HttpHelperService, private httpObserverService: HttpObserverService) { }

  public set RefreshObserver(name: any) {
    if (this.observers.hasOwnProperty(name)) {
      this.observers[name].refresh = true;
    }
  }

  createPublication: (data: (object | FormData)) => Observable<any> = (data: object | FormData): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + '/create', data)
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  editPublication = (data: object | FormData, slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + '/' + slug, data)
      .pipe(
        tap(() => this.RefreshObserver = 'getMyPublications'),
        filter(data => data != null),
        map(data => new Publication(data))
      );
  }

  getMyPublications: () => Observable<any> = () => {
    const callData: any = this.observers['getMyPublications'];
    return this.httpObserverService.observerCall(callData.name, this.httpHelperService.call(HttpMethodTypes.get, this.url + 's-related')
      .pipe(
        filter(data => data != null),
        map((data: IPublications) => new Publications(data)),
        tap((data: Publications) => { callData.refresh = false; this.myPublications$.next(data); })
      ), callData.refresh);
  }

  getMyPublicationsByType = (type: string) => {
    return this.httpHelperService.call(HttpMethodTypes.get, this.url + 's-related' + `/${type}`)
      .pipe(map((data: IPublications) => new Publications(data)));
  }

  getPublicationBySlug = (slug: string | number): Observable<Publication> => {
    const authToken = localStorage.getItem('auth') ? localStorage.getItem('auth') : '';
    return this.httpHelperService.call(HttpMethodTypes.get, this.url + '/' + slug, null, null, false, !!authToken)
      .pipe(
        filter(data => data != null),
        map(data => new Publication(data))
      );
  }

  addMember = (body: any, slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + '/' + slug + '/invite-a-member', { invitations: body });
  }

  inviteBecomeMember = (body: object[], slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + '/' + slug + '/invitation', { invitations: body }, [], true);
  }

  getMembers: (slug: string) => Observable<any> = (slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.get, this.url + `/${slug}/` + 'members');
  }

  getPublicationArticles = (slug: string): Observable<any> => this.httpHelperService.customCall(HttpMethodTypes.get, this.url + `/${slug}/` + 'articles');

  getPublicationStories(slug: string, count = 20, boostedCount = 0, fromUri = null) {
    return this.httpHelperService.customCall(HttpMethodTypes.get, this.url + `/${slug}/contents/${count}/${boostedCount}/${fromUri}`).pipe(map(contentData => {
      contentData.data = contentData.data.map(nextContent => new Content(nextContent));
      return contentData;
    }));
  }

  removeArticle: (dsId: string, slug: string) => Observable<any> = (dsId: string, slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + `/${slug}/` + 'remove-article', { dsId: dsId });
  }

  deletePublication = (slug: string): Observable<any> => this.httpHelperService.call(HttpMethodTypes.delete, this.url + '/' + slug);

  requestBecomeMember = (slug: string): Observable<any> => this.httpHelperService.call(HttpMethodTypes.post, this.url + '/' + slug + '/request');

  cancelBecomeMember = (slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.delete, this.url + '/' + slug + '/request')
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  acceptInvitationBecomeMember = (slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + '/' + slug + '/invitation/response')
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  rejectInvitationBecomeMember = (slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.delete, this.url + '/' + slug + '/invitation/response')
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  acceptInvitation = (body: any): Observable<any> => this.httpHelperService.call(HttpMethodTypes.post, this.url + '/invitation-response', body);

  acceptRejectRequest = (slug: string, publicKey: string, action: 'accept' | 'reject'): Observable<any> => {
    const method = action == 'accept' ? HttpMethodTypes.post : HttpMethodTypes.delete;
    return this.httpHelperService.call(method, this.url + `/${slug}/request/response/${publicKey}`)
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  cancelInvitationBecomeMember = (slug: string, identifier: string) => {
    return this.httpHelperService.call(HttpMethodTypes.delete, this.url + `/${slug}/invitation/cancel/${identifier}`)
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  addPublicationToStory(dsId: string, slug: string): Observable<any> {
    const body = { dsId: dsId, publication_slug: slug == 'none' ? '' : slug };
    return this.httpHelperService.call(HttpMethodTypes.post, environment.backend + '/api/v1/content/change-article-publication', body);
  }

  cancelInvitation = (body: any): Observable<any> => this.httpHelperService.call(HttpMethodTypes.delete, `${this.url}/cancel-invitation/${body}`);

  getPublications(fromSlug = null, count: number = 10): Observable<any> {
    console.log('tttt');
    return this.httpHelperService.call(HttpMethodTypes.get, `${this.url}s/${count}/${fromSlug}`)
      .pipe(
        filter(data => data != null),
        map(publicationsData => {
          publicationsData.publications = publicationsData.publications.map(nextPublication => new Publication(nextPublication));
          return publicationsData;
        })
      );
  }

  getArticlePublication = (dsArray: any[]): Observable<any> => this.httpHelperService.customCall(HttpMethodTypes.post, this.url + 's-related', { articles: dsArray });

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

  changeMemberStatus = (slug: string, requestData: object): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + `/${slug}/change-member-status`, requestData)
      .pipe(tap(() => this.RefreshObserver = 'getMyPublications'));
  }

  getUserFollowers: () => Observable<any> = (): Observable<any> => {
    const url = environment.backend + `/api/v1/user/subscription/user`;
    return this.httpHelperService.call(HttpMethodTypes.get, url);
  }

  getPublicationSubscribers = (slug: string): Observable<any> => this.httpHelperService.call(HttpMethodTypes.get, this.url + `/subscribers/${slug}`);

  follow = (slug: string): Observable<any> => this.httpHelperService.call(HttpMethodTypes.post, this.url + `/${slug}/subscribe`);

  unfollow = (slug: string): Observable<any> => this.httpHelperService.call(HttpMethodTypes.delete, this.url + `/${slug}/subscribe`);

  deleteMembership: (slug: string) => Observable<any> = (slug: string): Observable<any> => {
    return this.httpHelperService.call(HttpMethodTypes.post, this.url + `/delete-membership/${slug}`);
  }

  deleteMember(slug: string, publicKey: any) {
    return this.httpHelperService.call(HttpMethodTypes.delete, `${this.url}/${slug}/delete-member/${publicKey}`);
  }

  reset() {
    this.myPublications$ = new BehaviorSubject(null);
  }
}
