import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { ContentService } from '../services/content.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { UtilService } from '../services/util.service';
import { PublicationService } from '../services/publication.service';
import { AccountService } from '../services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {

  public contentArray = [];
  public isMasonryLoaded = false;
  public listType = 'grid';
  public seeMoreChecker = false;
  seeMoreLoading = false;
  public blockInfiniteScroll = false;
  requestMade = false;
  public activeLanguage = 'en';
  public following: boolean = true;
  public welcomeBlockVisible = true;
  public startFromUri = null;
  public storiesDefaultCount = 20;
  public storiesPerBlock = 9;
  public firstRelevantBlock = [];
  public secondRelevantBlock = [];
  public firstContentBlock = [];
  public secondContentBlock = [];
  public loadedContentBlock = [];
  public publicationsList = [];
  public hasMorePublications = false;
  public publicationsFromSlug = null;
  public publicationsDefaultCount = 3;
  private unsubscribe$ = new ReplaySubject<void>(1);
  public myOptions: NgxMasonryOptions = {
    transitionDuration: '0s',
    itemSelector: '.story--grid',
    gutter: 10
  };

  constructor(
    private contentService: ContentService,
    private publicationService: PublicationService,
    public utilService: UtilService,
    public accountService: AccountService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.activeLanguage = localStorage.getItem('lang') || 'en';
    this.contentService.getHomePageContents(this.startFromUri, this.storiesDefaultCount)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((contentData: any) => {
        this.loadMorePublications();
        this.contentArray = contentData.data;
        this.seeMoreChecker = contentData.more;
        this.seeMoreLoading = false;
        if (this.contentArray.length) {
          this.calculateLastStoriUri();
          this.firstRelevantBlock = this.contentArray.slice(0, this.storiesDefaultCount);
          this.secondRelevantBlock = this.contentArray.slice(0, this.storiesDefaultCount);
          this.firstContentBlock = this.contentArray.slice(0, this.storiesPerBlock);
          this.secondContentBlock = this.contentArray.slice(this.storiesPerBlock, this.storiesDefaultCount);
          this.loadedContentBlock = this.contentArray.slice(this.storiesDefaultCount);
        }
      });
  }

  loadMorePublications() {
    this.publicationService.getPublications(this.publicationsFromSlug, this.publicationsDefaultCount)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (publicationsListData: any) => {
          this.hasMorePublications = publicationsListData.more;
          this.publicationsList = this.publicationsList.concat(publicationsListData.publications);
          this.following = publicationsListData.subscribed;
          const lastIndex = this.publicationsList.length - 1;
          if (this.publicationsList[lastIndex].slug !== this.publicationsFromSlug) {
            this.publicationsFromSlug = this.publicationsList[lastIndex].slug;
          }
        }
      );
  }


  calculateLastStoriUri() {
    const lastIndex = this.contentArray.length - 1;
    if (this.contentArray[lastIndex].uri !== this.startFromUri) {
      this.startFromUri = this.contentArray[lastIndex].uri;
    }
  }

  followPublication(event) {
    if (event.follow && this.accountService.loggedIn()) {
      this.publicationService.follow(event.slug)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          () => this.following = false
        );
    } else if (event.follow == false && this.accountService.loggedIn()) {
      this.publicationService.unfollow(event.slug)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          () => this.following = true
        );
    } else {
      this.router.navigate(['/user/login']);
    }
  }

  onLayoutComplete(event) {
    if (event && event.length > 1) {
      this.isMasonryLoaded = true;
    }
  }

  goPublicationPage(e) {
    this.utilService.routerChangeHelper('publication', e);
  }

  seeMore() {
    this.seeMoreLoading = true;
    this.blockInfiniteScroll = true;
    this.contentService.getHomePageContents(this.startFromUri, this.storiesDefaultCount)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (data: any) => {
          this.seeMoreChecker = data.more;
          this.seeMoreLoading = false;
          this.contentArray = this.contentArray.concat(data.data);
          this.loadedContentBlock = this.loadedContentBlock.concat(data.data);
          this.calculateLastStoriUri();
          this.blockInfiniteScroll = false;
        }
      );
  }

  useLang(lang) {
    this.activeLanguage = lang;
    localStorage.setItem('lang', lang);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
