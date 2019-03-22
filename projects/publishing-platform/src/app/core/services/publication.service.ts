import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

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
  averageRGBChanged: Subject<any> = new Subject<any>();
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

  createPublication(data) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend + '/api/v1/publication/create',
      data,
      header
    );
  }

  editPublication(data, slug) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend + '/api/v1/publication/' + slug + '/update',
      data,
      header
    );
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

  getPublicationBySlug(slug) {
    const channel = this.channelService.channel || 'stage';
    return this.http.get(environment.backend + '/api/v1/publication/' + slug, {headers: {'X-API-CHANNEL': channel}});
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

  getImages(path) {
    return environment.backend + '/uploads/publications/' + path;
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

  deletePublication(slug) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.delete(
      `${environment.backend}/api/v1/publication/${slug}`,
      header
    );
  }

  becomeMember(slug) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      environment.backend + '/api/v1/publication/' + slug + '/become-a-member',
      {slug},
      header
    );
  }

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

  cnacelRequest(body) {
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.post(
      `${environment.backend}/api/v1/publication/cancel-request/${body}`,
      {},
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

  checkPublication(slug): Promise<boolean> {
    return new Promise(resolve => {
      let pubArr = [];
      this.myPublications.subscribe((publications: Array<Publication>) => {
        if (publications) {
          pubArr = publications;
          this.myMemberships
            .subscribe((publications: Array<Publication>) => {
              if (publications) {
                if (pubArr || publications) {
                  pubArr.concat(publications).forEach(pub => {
                    if ((!pub.publication && pub.slug === slug) || (pub.publication && pub.publication.slug === slug)) {
                      resolve(pub.status ? pub.status : 1);
                    }
                  });
                }
              }

            });
        }
      });
    });

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

  public follow(slug: string) {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }

      return this.http.put(
        `${environment.backend}/api/v1/publication/subscription/${slug}`,
        {},
        {headers: new HttpHeaders({'X-API-TOKEN': authToken})}
      );
    }
  }

  public unfollow(slug: string) {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const url =
        environment.backend + `/api/v1/publication/subscription/${slug}`;
      return this.http.delete(url, {
        headers: new HttpHeaders({'X-API-TOKEN': authToken})
      });
    }
  }

  deleteMembership(slug) {
    // /api/v1/publication/{slug}/delete-membership
    const authToken = this.getAccountToken();
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    return this.http.delete(
      `${environment.backend}/api/v1/publication/delete-membership/${slug}`,
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

  getAverageRGB(pub) {
    const imageUrl = this.imagePath + pub.logo;
    this.contentService.getImage(imageUrl).subscribe((data: File) => {
      if (data) {
        const image: any = new Image();
        const file: File = data;
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (loadEvent: any) => {
          image.src = loadEvent.target.result;
          image.origin = 'anonymus';
          setTimeout(() => {
            const imageColor = this.getImageColor(image);
            this.averageRGBChanged.next({'slug': pub.slug, 'color': imageColor});
          }, 100);
        };
        myReader.onerror = () => {
          this.errorService.handleError('getImage', {status: 404}, imageUrl);
        };

        myReader.readAsDataURL(file);
      } else {
        this.errorService.handleError('getImage', {status: 404}, imageUrl);
      }
    }, error => {
      this.errorService.handleError('getImage', {status: 404}, imageUrl);
    });
  }

  getImageColor(imageEl) {
    const blockSize = 5; // only visit every 5 pixels
    const defaultRGB = {r: 0, g: 0, b: 0}; // for non-supporting envs
    const canvas = document.createElement('canvas');
    const context = canvas.getContext && canvas.getContext('2d');
    let data,
      width,
      height,
      i = -4,
      length;
    const rgb = {r: 0, g: 0, b: 0};
    let count = 0;
    if (!context) {
      return defaultRGB;
    }
    height = canvas.height = imageEl.naturalHeight || imageEl.offsetHeight || imageEl.height;
    width = canvas.width = imageEl.naturalWidth || imageEl.offsetWidth || imageEl.width;
    context.drawImage(imageEl, 0, 0);
    try {
      data = context.getImageData(0, 0, width, height);
    } catch (e) {
      /* security error, img on diff domain */
      console.log(e);
      return defaultRGB;
    }
    length = data.data.length;
    while ((i += blockSize * 4) < length) {
      ++count;
      rgb.r += data.data[i];
      rgb.g += data.data[i + 1];
      rgb.b += data.data[i + 2];
    }
    // ~~ used to floor values
    rgb.r = Math.floor(rgb.r / count);
    rgb.g = Math.floor(rgb.g / count);
    rgb.b = Math.floor(rgb.b / count);
    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  }

  reset() {
    this.myPublications = new ReplaySubject(1);
    this.myMemberships = new ReplaySubject(1);
    this.myInvitations = new ReplaySubject(1);
    this.myRequests = new ReplaySubject(1);
    this.pendingPublications = new ReplaySubject(1);
  }
}
