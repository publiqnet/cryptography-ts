import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormBuilder } from '@angular/forms';

import { ReplaySubject, combineLatest } from 'rxjs';
import { filter, skip, takeUntil, switchMap } from 'rxjs/operators';

import { PublicationService } from '../../core/services/publication.service';
import { DialogService } from '../../core/services/dialog.service';
import { AccountService } from '../../core/services/account.service';
import { Publication } from '../../core/services/models/publication';
import { parseZone } from 'moment';
import { ArticleService } from '../../core/services/article.service';
import { PublicationMemberStatusType } from '../../core/models/enumes';
import { Publications } from '../../core/services/models/publications';

@Component({
  selector: 'app-manage-publication',
  templateUrl: './manage-publication.component.html',
  styleUrls: ['./manage-publication.component.scss']
})
export class ManagePublicationComponent implements OnInit, OnDestroy, OnChanges {

  // @Input('currentUser') currentUser;
  // @Input('dsIdArray') dsIdArray: any[];
  @Input('publication') publication: Publication;
  slug: string;
  count = 0;
  coverImage;
  articlesRes;
  rawArticles;
  members: Array<any> = [];
  logoImage;
  coverFile;
  logoFile;
  searchBar = false;
  member;
  editors = [];
  pendings = [];
  initialLoading = true;
  contributors = [];
  subscribers: Array<any>;
  tabIndex;
  requests: Array<any>;
  followers: Array<any> = [];
  accountInfo;
  myStatus;
  articlesLoaded: boolean;
  seeMore = false;
  offset = 30;
  from = 0;
  to = this.offset;
  boostedOffset = 3;
  boostedFrom = 0;
  boostedTo = this.boostedOffset;
  nextPub = false;
  public addMemberBtn = false;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private FormBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public publicationService: PublicationService,
    public dialogService: DialogService,
    private accountService: AccountService,
    private articleService: ArticleService
  ) {
    this.accountInfo = accountService.accountInfo;
  }

  ngOnInit() {

    if (this.nextPub) {
      this.from = 0;
      this.to = this.offset;
      this.articlesRes = null;
      this.myStatus = 0;
      this.boostedOffset = 3;
      this.boostedFrom = 0;
      this.boostedTo = this.boostedOffset;
      this.seeMore = false;
      this.initialLoading = true;
    }

    // this.publicationForm.disable();
    /*

    this.route.params.pipe(
      switchMap((params) => {
        this.slug = params.slug;
        if (this.nextPub) {
          this.from = 0;
          this.to = this.offset;
          this.articlesRes = null;
          this.myStatus = 0;
          this.boostedOffset = 3;
          this.boostedFrom = 0;
          this.boostedTo = this.boostedOffset;
          this.seeMore = false;
          this.initialLoading = true;
        }
        return combineLatest(this.publicationService.publicationContent$, this.articleService.sponsoredArticlesChanged.pipe(skip(1)));
      }),
      switchMap(data => {
        this.getArticles(data);
        if (this.accountService.accountInfo) {
          this.publicationService.getMyPublications();
        }
        this.getFollowers();
        return this.publicationService.getPublicationBySlug(this.slug);
      }),
      switchMap((publ: Publication) => {
        this.publication = publ;

        this.publicationService.loadSubscribers(this.publication.slug);
        this.coverImage = this.publication.cover;
        this.logoImage = this.publication.logo;
        return this.publicationService.myPublications;
      }),
      filter((my: Array<Publication>) => {
        if (my && my.length && !this.myStatus) {
          this.getMyStatus(my);
        }
        if (this.myStatus) {
          return false;
        }
        return true;
      }),
      switchMap(res => {
        return this.publicationService.myMemberships;
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe((member: Array<Publication>) => {
        if (member && member.length && !this.myStatus) {
          this.getMyStatus(member);
        }
      });

      */


    /*this.publicationService.subscribersChanged.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(res => {
      this.subscribers = res.map(subscriber => {
        if (this.followers.includes(subscriber.subscriber.username)) {
          subscriber.subscriber.following = 'unfollow';
          return subscriber;
        } else {
          subscriber.subscriber.following = 'follow';
          return subscriber;
        }
      });
    });*/
  }

  get MemberStatus() {
    return PublicationMemberStatusType;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('publication' in changes) {
      if (this.publication) {
        console.log('this.publication --', this.publication);
        // this.publicationService.loadSubscribers(this.publication.slug);
        this.slug = this.publication.slug;
        this.coverImage = this.publication.cover;
        this.logoImage = this.publication.logo;
      }

      // Todo: need to be reviewed
      // if (this.dsIdArray && this.dsIdArray.length > 0) {
      //   const previous = changes['dsIdArray'].previousValue;
      //   const current = changes['dsIdArray'].currentValue;
      //   if (!previous || (previous[0] !== current[0])) {
      //     const count = Math.floor(this.dsIdArray.length / 10);
      //     this.articleService.loadSponsoredArticles(count, count);
      //     const sliced = this.dsIdArray.slice(this.from, this.to);
      //     this.articleService.getContentsByDsId(sliced);
      //   }
      // }
    }
  }

  getFollowers() {
    this.publicationService.getUserFollowers()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((followers: any[]) => {
        if (followers) {
          this.followers = followers.map(f => f.user.username);
        }
      });
  }


  follow(member, e, mode) {
    e.preventDefault();
    e.stopPropagation();
    this.accountService.follow(member.username);
    member.following = 'unfollow';
    if (mode === 'member') {
      const subscriber = this.subscribers.find(e => e.subscriber.username === member.username);
      if (subscriber) {
        subscriber.subscriber.following = 'unfollow';
      }
    } else if (mode === 'follower') {
      const editor = this.editors.find(e => e.user.username === member.username);
      const contributor = this.contributors.find(e => e.user.username === member.username);
      if (editor) {
        editor.user.following = 'unfollow';
      }
      if (contributor) {
        contributor.user.following = 'unfollow';
      }
      if (this.member.user.username === member.username) {
        this.member.user.following = 'unfollow';
      }
    }
  }

  unfollow(member, e, mode) {
    e.preventDefault();
    e.stopPropagation();
    this.accountService.unfollow(member.username);
    member.following = 'follow';
    if (mode === 'member') {
      const subscriber = this.subscribers.find(e => e.subscriber.username === member.username);
      if (subscriber) {
        subscriber.subscriber.following = 'follow';
      }
    } else if (mode === 'follower') {
      const editor = this.editors.find(e => e.user.username === member.username);
      const contributor = this.contributors.find(e => e.user.username === member.username);
      if (editor) {
        editor.user.following = 'follow';
      }
      if (contributor) {
        contributor.user.following = 'follow';
      }
      if (this.member.user.username === member.username) {
        this.member.user.following = 'follow';
      }
    }
  }

  cancel() {
    this.ngOnInit();
  }

  getMembers() {
    this.editors = [];
    this.pendings = [];
    this.contributors = [];
    this.publicationService.getMembers(this.publication.slug)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(res => {
        this.members = res['invitations'].concat(res['members']);
        this.members.forEach(member => {
            if (member.status === 2) {
              if (this.followers.includes(member.user.username)) {
                member.user.following = 'unfollow';
              } else {
                member.user.following = 'follow';
              }
              this.editors.push(member);
            } else if (member.status === 3) {
              if (member.user && this.followers.includes(member.user.username)) {
                member.user.following = 'unfollow';
              } else if (member.user && !this.followers.includes(member.user.username)) {
                member.user.following = 'follow';
              }
              this.contributors.push(member);
            } else if (member.status === 103 || member.status === 102) {
              if (member.user && this.followers.includes(member.user.username)) {
                member.user.following = 'unfollow';
              } else if (member.user && !this.followers.includes(member.user.username)) {
                member.user.following = 'follow';
              }
              this.pendings.push(member);
            } else if (member.status === 1) {
              this.member = member;
              if (this.followers.includes(this.member.user.username)) {
                this.member.user.following = 'unfollow';
              } else {
                this.member.user.following = 'follow';
              }
              this.requests = res['requests'];
            }
          }
        );
      });
  }

  getMyStatus(pubs) {
    pubs.forEach(pub => {
      if (pub.slug && pub.slug === this.publication.slug) {
        if (!pub.status) {
          this.myStatus = 1;
          this.getMembers();
        }
      } else if (
        pub.publication &&
        pub.publication.slug === this.publication.slug
      ) {
        this.myStatus = pub.status;
        if (this.myStatus == 2) {
          this.getMembers();
        }
      }
    });

    this.tabIndex = this.publicationService.tabIndexReq;
  }

  changeStatus(e, member) {
    const body = {
      publicKey: member.user.username,
      slug: this.publication.slug,
      status: e.value
    };
    this.publicationService.changeMemberStatus(body)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.getMembers());
  }

  selectCover(e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.addEventListener(
      'load',
      () => {
        this.coverImage = reader.result;
        this.coverFile = file;
      },
      false
    );
    reader.readAsDataURL(file);
  }

  selectLogo(e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.addEventListener(
      'load',
      () => {
        this.logoImage = reader.result;
        this.logoFile = file;
      },
      false
    );
    reader.readAsDataURL(file);
  }

  stopEventPropagation(e) {
    e.stopPropagation();
  }

  openArticle(ds) {
    this.router.navigate(['/s/' + ds]);
  }

  addMember() {
    this.searchBar = true;

    this.addMemberBtn = !this.addMemberBtn;
  }

  closeSearchBar() {
    this.searchBar = false;
    this.addMemberBtn = !this.addMemberBtn;
    this.getMembers();
  }

  deleteMember(member, i, e) {
    if (e) {
      e.stopPropagation();
    }
    // /api/v1/publication/{slug}/delete-member
    this.dialogService
      .openConfirmDialog('')
      .pipe(
        filter(result => result !== false),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.publicationService
          .deleteMember(this.publication.slug, member.user.username)
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe(res => {
            this.getMembers();
          });
      });
  }

  goToPage() {
    this.router.navigate([`/p/${this.publication.slug}`]);
  }

  memberRequest(request, status, index) {
    const body = {
      membershipId: request.id,
      status: status
    };
    this.publicationService.acceptRequest(body)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.getMembers();
      });
  }

  cancelMember(member, e) {
    if (e) {
      e.stopPropagation();
    }
    this.publicationService.cancelInvitation(member.id)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
          this.getMembers();
        }
      );
  }

  getArticles(data) {
    this.rawArticles = data[0].map(article => ({...article, created: parseZone(article.created).toISOString()}));
    const boostedArticles = data[1];
    if (boostedArticles && boostedArticles.length) {
      const slicedBoostedArticles = boostedArticles.slice(this.boostedFrom, this.boostedTo);
      slicedBoostedArticles.forEach(boostedArticle => {
        this.rawArticles.splice(Math.floor(Math.random() * this.rawArticles.length), 0, boostedArticle);
      });
      this.boostedFrom = this.boostedTo;
      this.boostedTo = this.boostedFrom + this.boostedOffset;
    }
    this.articlesRes = this.articlesRes && this.articlesRes.length ? this.articlesRes.concat(this.rawArticles) : this.rawArticles;
    // this.seeMore = this.dsIdArray.length > this.offset && this.to < this.dsIdArray.length;
    this.initialLoading = false;
    this.articlesLoaded = true;
    this.nextPub = true;
  }

  getImage(article) {

    return this.hasImage(article)
      ? article.meta.image_hash.replace('original', 'thumb')
      : '/assets/no-image-article.jpg';
  }

  hasImage(article) {
    if (article.meta) {
      return !!(
        article.meta.image_hash &&
        article.meta.image_hash !== '' &&
        !article.meta.image_hash.startsWith('http://127.0.0.1')
      );
    }
  }

  removeArticle(dsId) {
    this.dialogService
      .openConfirmDialog('')
      .pipe(
        filter(result => result !== false),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(res => {
        this.publicationService
          .removeArticle(dsId, this.publication.slug)
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe(() => {
            this.articlesRes = this.articlesRes.filter(article => article.ds_id !== dsId);
          });
      });
  }

  onLinkClick(e) {
    if (e.index === 4) {
      this.router.navigate(['/content/newcontent'], {queryParams: {publicationSlug: this.publication.slug}});
    }
  }

  loadMore() {
    this.from = this.to;
    this.to = this.from + this.offset;
    // const sliced = this.dsIdArray.slice(this.from, this.to);
    // this.articleService.getContentsByDsId(sliced);
    this.articlesLoaded = false;
  }

  ngOnDestroy() {
    this.publicationService.tabIndexReq = 0;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
