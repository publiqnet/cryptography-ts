import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject, zip } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { ArticleService } from '../../core/services/article.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { Content } from '../../core/services/models/content';

@Component({
  selector: 'app-search-content',
  templateUrl: './search-content.component.html',
  styleUrls: ['./search-content.component.scss']
})
export class SearchContentComponent implements OnInit, OnDestroy {
  filteredContents: Content[];
  searchTerm = '';
  public loading = false;
  public hasChanges = false;
  private unsubscribe$ = new ReplaySubject<void>(1);

  private storiesDefaultCount = 30;
  storiesStartFromBlock = '0.0.0';
  public seeMoreChecker = false;
  seeMoreLoading = false;

  constructor(
    private articleService: ArticleService,
    private router: Router,
    private errorService: ErrorService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: ErrorEvent) => {
            if (data.action === 'getStoriesByTerm') {
              console.log(data.message);
            }
          }
        );

      this.activatedRoute.params
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(params => {
          this.hasChanges = false;
          if (params['term'] !== 'undefined') {
            this.searchTerm = params['term'];
            this.loading = true;
            this.articleService.getStoriesByTerm(this.searchTerm, this.storiesStartFromBlock, this.storiesDefaultCount + 1);
          } else {
            this.router.navigate(['/']);
          }
        });

      zip(
        this.articleService.getStoriesDataByTermChanged,
        this.articleService.getContentViewsDataChanged
      )
        .pipe(
          filter(data => data != null && data[0]),
          map((data: any[]) => {
            const stories: Content[] = data[0];
            const views = data[1];
            if (stories.length > this.storiesDefaultCount) {
              const lastIndex = stories.length - 1;
              // if (stories[lastIndex].id !== this.storiesStartFromBlock) {
              //   this.storiesStartFromBlock = stories[lastIndex].id;
              //   stories.pop();
              // }
              views.pop();
            }
            stories.forEach(content => {
              views.forEach(view => {
                // if (content.ds_id == view._id) {
                //   content.viewcount = view.viewcount;
                // }
              });
            });
            return stories;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((response: Content[]) => {
            this.seeMoreLoading = false;
            this.loading = false;
            this.hasChanges = true;
            this.seeMoreChecker = (response.length >= this.storiesDefaultCount);
            this.filteredContents = (this.filteredContents && this.filteredContents.length) ? this.filteredContents.concat(response) : response;
          }
        );
    }
  }

  seeMore() {
    this.seeMoreLoading = true;
    this.articleService.getStoriesByTerm(this.searchTerm, this.storiesStartFromBlock, this.storiesDefaultCount + 1);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.hasChanges = false;
      this.unsubscribe$.next();
      this.unsubscribe$.complete();

      this.filteredContents = [];
      this.articleService.getStoriesDataByTerm = [];
      this.articleService.getStoriesDataByTermChanged.next([]);
      this.storiesStartFromBlock = '0.0.0';
    }
  }
}
