import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { filter, switchMap } from 'rxjs/operators';
import { Content } from '../../core/services/models/content';
import { AccountService } from '../../core/services/account.service';
import { LoginDialogComponent } from '../../core/login-dialog/login-dialog.component';
import { PublicationService } from '../../core/services/publication.service';
import { PublicationSubscribersResponse } from '../../core/services/models/publication';
import { environment } from '../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../core/services/channel.service';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';


@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit, OnDestroy {
  loadingPublication = true;
  articlesLoaded = false;
  canFollow = true;
  becomeMem = false;
  notMember = true;
  averageColor;
  imagePath: string = environment.backend + '/uploads/publications/';
  subscribers: number;
  articles: number;
  articlesResponse;
  dsIdArray: Array<string>;
  publicationArticles: Content[];
  publication;
  authorArticlesViwes;
  owner;
  membersCount;
  currentUser;
  subscriptions: Subscription = new Subscription();
  previousTitle = '';
  requestId;
  myPublication = false;

  constructor(
    private accountService: AccountService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId,
    private publicationService: PublicationService,
    public channelService: ChannelService,
    private titleService: Title,
    private seoService: SeoService,
  ) { }

  ngOnInit() {

    // this.subscriptions.add(
    //   this.accountService.accountUpdated$
    //     .pipe(filter(result => result != null))
    //     .subscribe(acc => {
    //       this.currentUser = acc;
    //       // this.publicationService.getMyPublications();
    //     })
    // );


    this.articlesLoaded = true;
    this.subscriptions.add(this.route.params
      .subscribe(param => {
        this.accountService.accountUpdated$
          .pipe(
            // filter(result => result != null),
            switchMap(acc => {
              this.currentUser = acc;
              return this.publicationService.getPublicationBySlug(param.slug);
            })
            ).subscribe(pub => {
              this.myPublication = false;
            this.publication = pub;
          this.owner = this.currentUser && this.currentUser.name === this.publication.owner.username;
            if (this.publication.logo && !this.publication.cover) {
              this.publicationService.getAverageRGB(this.publication);
            }
            this.publicationService.checkPublication(this.publication.slug).then(
              res => {
                this.myPublication = res;
              }
            );
            const title = this.publication.title;
            const description = this.publication.description;
            const image = this.publication.socialImage || this.publication.cover ? this.imagePath + this.publication.socialImage || this.publication.cover : 'https://publiq.network/media/images/92169.png';
            const url = environment.main_site_url  + this.router.url;
            this.seoService.generateTags({
              title, description, image, url
            });
            if (isPlatformBrowser(this.platformId)) {
              this.getMyRequests();
              this.getMyMembership();
              this.publicationService.loadSubscribers(this.publication.slug);
              this.getPublicationArticles();
            }
            this.publicationService.subscribersChanged.subscribe(
              (res: Array<PublicationSubscribersResponse>) => {
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
            );
          });
      }));

    this.subscriptions.add(this.publicationService.averageRGBChanged.subscribe(data => {
        this.averageColor = data.color;
    }));
  }

  setOwner(owner) {
    this.owner = owner.user.username === this.currentUser.name;
  }


  getMyRequests() {
    this.publicationService.myRequests.subscribe((req: Array<any>) => {
      if (req) {
        req.forEach(elem => {
          if (elem.publication.slug === this.publication.slug) {
            this.becomeMem = true;
            this.requestId = elem.id;
          }
        });
      }
    });
  }

  getMyMembership() {
    this.publicationService.myMemberships.subscribe((mem: Array<any>) => {
      const arr = [];
      if (mem) {
        mem.forEach(elem => {
          if (elem.publication.slug === this.publication.slug) {
            this.notMember = false;
          }
        });
      }
    });
  }

  getPublicationArticles() {
    this.publicationService
    .getPublicationArticles(this.publication.slug)
    .subscribe(articles => {
      this.articlesResponse = articles;
      this.dsIdArray = this.articlesResponse.map(element => {
        return element.dsId;
      });
      this.articles = this.dsIdArray.length;
      this.loadingPublication = false;
      // this.publicationService
      //   .getContentsByDsId(this.dsIdArray)
      //   .subscribe(
      //     (data: Content[]) => {
      //       this.publicationArticles = data;
      //       console.log('pub articles', this.publicationArticles);
      //       this.loadingPublication = false;
      //       this.articles = data.length;
      //     },
      //     error => console.log(error)
      //   );
    });
  }

  componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }
  rgbToHex(r, g, b) {
    return (
      '#' +
      this.componentToHex(r) +
      this.componentToHex(g) +
      this.componentToHex(b)
    );
  }

  follow() {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    } else {
      this.publicationService.follow(this.publication.slug).subscribe(res => {
        this.canFollow = false;
        this.publicationService.loadSubscribers(this.publication.slug);
      });
    }
  }

  unfollow() {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }
    this.publicationService.unfollow(this.publication.slug).subscribe(res => {
      this.canFollow = true;
      this.publicationService.loadSubscribers(this.publication.slug);
    });
  }

  becomeMember(slug) {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }
    this.publicationService.becomeMember(slug).subscribe(res => {
      this.becomeMem = true;
      this.publicationService.getMyPublications();
    });
  }

  cancelBecomeMember(slug) {
    this.publicationService.cnacelRequest(this.requestId).subscribe(
      () => {
        this.becomeMem = false;
        this.publicationService.getMyPublications();
      }
    );
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '500px'
    });
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
      }
    });
  }

  ngOnDestroy() {
    this.seoService.generateTags(this.channelService.channelConfig, 'website');
    this.subscriptions.unsubscribe();
  }
}
