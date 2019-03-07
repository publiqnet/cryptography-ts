import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';

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

  getDraftByIdDataSubscription: Subscription = Subscription.EMPTY;
  errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

  constructor(
    private articleService: ArticleService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private errorService: ErrorService,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.activatedRoute.params.subscribe((params: Params) => {
        this.draftId = params['id'];

        this.articleService.getDraftById(this.draftId);
      });

      this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
        (data: ErrorEvent) => {
          if (data.action === 'getDraftById') {
              console.log(data.message);
              this.router.navigate(['/page-not-found']);
          }
        }
      );

      this.getDraftByIdDataSubscription = this.articleService.getDraftByIdDataChanged.subscribe(
        draft => (this.draft = draft)
      );
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.getDraftByIdDataSubscription.unsubscribe();
      this.errorEventEmitterSubscription.unsubscribe();
    }
  }
}
