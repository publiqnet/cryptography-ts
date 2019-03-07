import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription } from 'rxjs';

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

  contentDataSubscription: Subscription = Subscription.EMPTY;
  errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private activatedRoute: ActivatedRoute,
    private articleService: ArticleService,
    private accountService: AccountService,
    private errorService: ErrorService,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.activatedRoute.params.subscribe((params: Params) => {
        if (params['id']) {
          this.contentId = params['id'];
          this.articleService.getArticleById(this.contentId);
        }
      });

      this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
        (data: ErrorEvent) => {
          if (data.action === 'getArticleById') {
            console.log(data.message);
          }
        }
      );

      this.contentDataSubscription = this.articleService.getArticleByIdDataChanged.subscribe(
        data => {
          this.articleService.setHeaderArticleMeta(null);
          document.querySelector('mat-toolbar').classList.remove('shrink');
          if (data) {
            if (data && data.content) {
                if (data.full_account && this.accountService.accountInfo && data.full_account.name != this.accountService.accountInfo.name) {
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
      this.articleService.getArticleByIdDataChanged.next('');
      this.contentDataSubscription.unsubscribe();
      this.errorEventEmitterSubscription.unsubscribe();
    }
  }
}
