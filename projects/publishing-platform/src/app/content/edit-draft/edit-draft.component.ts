import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Draft } from '../../core/services/models/draft';
import { ArticleService } from '../../core/services/article.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-edit-draft',
  templateUrl: './edit-draft.component.html',
  styleUrls: ['./edit-draft.component.scss']
})
export class EditDraftComponent implements OnInit, OnDestroy {
  public draft: Draft;
  public draftId: string;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private articleService: ArticleService,
    private activatedRoute: ActivatedRoute,
    private errorService: ErrorService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((params: Params) => {
        this.draftId = params['id'];

        this.articleService.getDraftById(this.draftId);
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

    this.articleService.getDraftByIdDataChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        draft => (this.draft = draft)
      );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
