import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxMasonryOptions } from 'ngx-masonry';
import { ContentService } from '../services/content.service';
import { Content } from '../services/models/content';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

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
  public startFromUri = null;
  public storiesDefaultCount = 4;
  public firstRelevantBlock = [];
  public secondRelevantBlock = [];
  public firstContentBlock = [];
  public secondContentBlock = [];
  public loadedContentBlock = [];
  private unsubscribe$ = new ReplaySubject<void>(1);
  public myOptions: NgxMasonryOptions = {
    transitionDuration: '0s',
    itemSelector: '.story--grid',
    gutter: 10
  };

  public publicationData = [
    {
      'title': 'UX Topics 1',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': '',
      'cover': '',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': true,
      'status': 0
    },
    {
      'title': 'UX Topics 2',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': '',
      'cover': '',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': true,
      'status': 0
    },
    {
      'title': 'UX Topics 3',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    },
    {
      'title': 'UX Topics 4',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    },
    {
      'title': 'UX Topics 5',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    },
    {
      'title': 'UX Topics 6',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    }
  ];

  constructor(
    private router: Router,
    private contentService: ContentService
  ) { }

  ngOnInit() {
    this.contentService.getHomePageContents(this.startFromUri, this.storiesDefaultCount)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((contentData: any) => {
        this.contentArray = contentData.data;
        this.seeMoreChecker = contentData.more;
        this.seeMoreLoading = false;
        if (this.contentArray.length) {
          this.calculateLastStoriUri();
          this.firstRelevantBlock = this.contentArray.slice(0, this.storiesDefaultCount);
          this.secondRelevantBlock = this.contentArray.slice(0, this.storiesDefaultCount);
          this.firstContentBlock = this.contentArray.slice(0, this.storiesDefaultCount / 2);
          this.secondContentBlock = this.contentArray.slice(this.storiesDefaultCount / 2, this.storiesDefaultCount);
          this.loadedContentBlock = this.contentArray.slice(this.storiesDefaultCount);
        }
      });
  }

  calculateLastStoriUri() {
    const lastIndex = this.contentArray.length - 1;
    if (this.contentArray[lastIndex].uri !== this.startFromUri) {
      this.startFromUri = this.contentArray[lastIndex].uri;
    }
  }

  onLayoutComplete(event) {
    if (event && event.length > 1) {
      this.isMasonryLoaded = true;
    }
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
