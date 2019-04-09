import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ArticleService } from '../../core/services/article.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { PublicationService } from '../../core/services/publication.service';
import { Content } from '../../core/services/models/content';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss']
})
export class StoriesComponent implements OnInit, OnDestroy {
  public tagStories: Content[];
  private tagName: string;
  public loading = false;

  public seeMoreLoading = false;
  public seeMoreChecker = false;
  private startFromBlock = '0.0.0';
  private storiesDefaultCount = 30;

  private unsubscribe$ = new ReplaySubject<void>(1);
  private previousTitle: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private articleService: ArticleService,
    private errorService: ErrorService,
    private notification: NotificationService,
    private publicationService: PublicationService,
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    // subscribe to router event
    if (isPlatformBrowser(this.platformId)) {
      this.previousTitle = this.titleService.getTitle();
      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: ErrorEvent) => {
          if (data.action === 'getStoriesByTag') {
            this.loading = false;
            this.notification.info(this.errorService.getError('stories_not_found'));
          }
        });

      this.activatedRoute.params
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((params: Params) => {
          if (params && params['name'] != undefined) {
            this.resetFilter();
            this.tagName = params['name'];
            this.titleService.setTitle(this.tagName.toString());
            if (this.tagName) {
              this.loading = true;
              this.articleService.getStoriesByTag(this.tagName, this.startFromBlock, this.storiesDefaultCount + 1);
            }
          }
        });

      zip(
        this.articleService.getArticlesByTagDataChanged,
        this.publicationService.loadStoriesPublicationByDsIdDataChanged,
        this.articleService.authorStoriesViewsChanged
      )
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(data => {
          const stories: Content[] = data[0];
          const publications: any[] = data[1];
          const views: any[] = data[2];

          if (stories.length > this.storiesDefaultCount) {
            const lastIndex = stories.length - 1;
            if (stories[lastIndex].id !== this.startFromBlock) {
              this.startFromBlock = stories[lastIndex].id;
              stories.pop();
            }
          }
          stories.forEach((story: Content) => {
            if (views.length) {
              views.forEach(view => {
                if (story.ds_id == view._id) {
                  story.viewcount = view.viewcount;
                }
              });
            }

            if (publications.length) {
              publications.forEach(nextPublication => {
                if (story.ds_id == nextPublication.dsId) {
                  story.publication = nextPublication.publication;
                }
              });
            }
          });


          this.loading = false;
          this.seeMoreLoading = false;
          this.seeMoreChecker = (stories.length >= this.storiesDefaultCount);
          this.tagStories = (this.tagStories && this.tagStories.length) ? this.tagStories.concat(stories) : stories;
        });
    }
  }

  viewMore() {
    this.seeMoreLoading = true;
    this.articleService.getStoriesByTag(this.tagName, this.startFromBlock, this.storiesDefaultCount + 1);
  }

  resetFilter() {
    this.tagStories = [];
    this.startFromBlock = '0.0.0';
    this.loading = true;
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();

      this.titleService.setTitle(this.previousTitle);
      this.tagStories = [];
      this.publicationService.loadStoriesPublicationByDsIdDataChanged.next([]);
      this.articleService.authorStoriesViewsChanged.next([]);
    }
  }
}
