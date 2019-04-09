import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { DraftData } from '../../core/services/models/draft';
import { ArticleService } from '../../core/services/article.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { DraftService } from '../../core/services/draft.service';

@Component({
  selector: 'app-edit-draft',
  templateUrl: './edit-draft.component.html',
  styleUrls: ['./edit-draft.component.scss']
})
export class EditDraftComponent implements OnInit, OnDestroy {
  public draft: DraftData;
  public draftId: string;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private articleService: ArticleService,
    private activatedRoute: ActivatedRoute,
    private draftService: DraftService,
    private errorService: ErrorService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        filter((params: Params) => params['id']),
        switchMap(params => {
          this.draftId = params['id'];
          return this.draftService.get(this.draftId);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((draft: DraftData) => {
          this.draft = draft;
          console.log(this.draft);
      });

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
          if (data.action === 'getDraftById') {
            this.router.navigate(['/page-not-found']);
          }
        }
      );

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
