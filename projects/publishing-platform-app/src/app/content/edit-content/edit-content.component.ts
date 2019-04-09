import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Content } from '../../core/services/models/content';
import { ArticleService } from '../../core/services/article.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { ComponentCanDeactivate } from '../../guards/pending-changes-guard.service';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-edit-content',
  templateUrl: './edit-content.component.html',
  styleUrls: ['./edit-content.component.scss']
})
export class EditContentComponent
  implements OnInit, OnDestroy, ComponentCanDeactivate {
  public content: Content;
  public contentId: string;
  hasPendingChanges = false;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private activatedRoute: ActivatedRoute,
    private articleService: ArticleService,
    private accountService: AccountService,
    private errorService: ErrorService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.activatedRoute.params
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((params: Params) => {
          if (params['id']) {
            this.contentId = params['id'];
            this.articleService.getArticleById(this.contentId);
          }
        });

      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          (data: ErrorEvent) => {
            if (data.action === 'getArticleById') {
              console.log(data.message);
            }
          }
        );

      this.articleService.getArticleByIdDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          data => {
            this.articleService.setHeaderArticleMeta(null);
            document.querySelector('mat-toolbar').classList.remove('shrink');
            if (data) {
              if (data && data.content) {
                if (data.full_account && this.accountService.accountInfo && data.full_account.name != this.accountService.accountInfo.publicKey) {
                  this.router.navigate(['/page-not-found']);
                }
                this.content = data;
              }
            }
          }
        );
    }
  }

  canDeactivate() {
    return !this.hasPendingChanges;
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();

      this.articleService.getArticleByIdDataChanged.next('');
    }
  }
}
