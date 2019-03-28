import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

import { AccountService } from '../../core/services/account.service';
import { PublicationService } from '../../core/services/publication.service';
import { Publication, PublicationSubscribersResponse } from '../../core/services/models/publication';
import { environment } from '../../../environments/environment';
import { ChannelService } from '../../core/services/channel.service';
import { SeoService } from '../../core/services/seo.service';
import { PublicationMemberStatusType } from '../../core/models/enumes';
import { DialogService } from '../../core/services/dialog.service';


@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit, OnDestroy {
  loading = true;
  articlesLoaded = false;
  canFollow = true;
  subscribers: number;
  articles: number;
  articlesResponse;
  dsIdArray: Array<string>;
  publication: Publication;
  currentUser;
  private unsubscribe$ = new ReplaySubject<void>(1);
  slug: string;

  constructor(
    private accountService: AccountService,
    public dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    public channelService: ChannelService,
    private titleService: Title,
    private seoService: SeoService,
  ) {
  }

  ngOnInit() {

    this.articlesLoaded = true;

    this.route.params
      .pipe(
        debounceTime(500),
        switchMap((data: Params) => {
          this.slug = data.slug;
          return this.accountService.accountUpdated$;
        }),
        switchMap((data: any) => {
          this.currentUser = data;
          return this.publicationService.getPublicationBySlug(this.slug);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((pub: Publication) => {
        this.loading = false;
        this.setSeo();

        this.publication = pub;


        /*if (isPlatformBrowser(this.platformId)) {
          this.publicationService.loadSubscribers(this.publication.slug);
          this.getPublicationArticles();
        }
        this.publicationService.subscribersChanged
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe((res: Array<PublicationSubscribersResponse>) => {
              if (this.accountService.accountInfo) {
                this.subscribers = res.length;
                const userName = this.accountService.accountInfo.name;
                res.forEach((elem: PublicationSubscribersResponse) => {
                  if (userName === elem.subscriber.username) {
                    this.canFollow = false;
                  }
                });
              }
            }
          );*/
      });
  }

  get MemberStatus() {
    return PublicationMemberStatusType;
  }

  private setSeo(): void {
    if (!this.publication) {
      return;
    }
    const title = this.publication.title;
    const description = this.publication.description;
    const image = this.publication.socialImage || this.publication.cover
      ? this.publication.socialImage || this.publication.cover
      : 'https://publiq.network/media/images/92169.png';
    const url = environment.main_site_url + this.router.url;
    this.seoService.generateTags({title, description, image, url});
  }

  getPublicationArticles() {
    this.publicationService
      .getPublicationArticles(this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(articles => {
        this.articlesResponse = articles;
        this.dsIdArray = this.articlesResponse.map(element => {
          return element.dsId;
        });
        this.articles = this.dsIdArray.length;
        this.loading = false;
      });
  }

  follow() {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog().pipe(takeUntil(this.unsubscribe$)).subscribe();
      return false;
    } else {
      this.publicationService.follow(this.publication.slug)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.canFollow = false;
          this.publicationService.loadSubscribers(this.publication.slug);
        });
    }
  }

  unfollow() {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog().pipe(takeUntil(this.unsubscribe$)).subscribe();
      return false;
    }
    this.publicationService.unfollow(this.publication.slug)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.canFollow = true;
        this.publicationService.loadSubscribers(this.publication.slug);
      });
  }

  requestBecomeMember(slug: string) {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog().pipe(takeUntil(this.unsubscribe$)).subscribe();
      return false;
    }
    this.publicationService.requestBecomeMember(slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.publication.memberStatus = this.MemberStatus.requested_to_be_a_contributor);
  }

  cancelBecomeMember(slug: string) {
    this.publicationService.cancelBecomeMember(slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.publication.memberStatus = this.MemberStatus.no_info);
  }

  acceptInvitationBecomeMember(slug: string) {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog().pipe(takeUntil(this.unsubscribe$)).subscribe();
      return false;
    }
    this.publicationService.acceptInvitationBecomeMember(slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(res => {
        console.log('res3 --- ', res);
      });
  }

  rejectInvitationBecomeMember(slug: string) {
    if (!this.accountService.loggedIn()) {
      this.dialogService.openLoginDialog().pipe(takeUntil(this.unsubscribe$)).subscribe();
      return false;
    }
    this.publicationService.rejectInvitationBecomeMember(slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(res => {
        console.log('res4 --- ', res);
      });
  }

  ngOnDestroy() {
    this.seoService.generateTags(this.channelService.channelConfig, 'website');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
