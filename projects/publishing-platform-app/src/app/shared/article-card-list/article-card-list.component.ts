import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ArticleService } from '../../core/services/article.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { AccountService } from '../../core/services/account.service';

declare var Isotope: any;

@Component({
  selector: 'app-article-card-list',
  templateUrl: './article-card-list.component.html',
  styleUrls: ['./article-card-list.component.scss']
})
export class ArticleCardListComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() articles: Array<any>;
  @Input() hasSeparator: boolean;
  @Input() calculateViewCount: boolean;
  @Input() homepageGrid = false;
  @Input() canDelete;
  @Input() fromPublications: boolean;
  @Output('articleRemove') articleRemove = new EventEmitter();
  @ViewChild('grid', {static: false}) private grid;

  thisYear = new Date().getFullYear();
  public isotopeOptions = {
    transitionDuration: 0,
    horizontalOrder: true,
    itemSelector: '.masonry-item',
    stamp: '.masonry-stamp'
  };

  private isoGrid;
  public ids = [];
  public defaultImage = '/assets/image-loading.png';
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private articleService: ArticleService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private errorService: ErrorService,
    private router: Router,
    private accountService: AccountService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.calculateViewCount) {
        if (this.articles && this.articles.length) {
          this.articles.forEach(value => {
            this.ids.push(value.ds_id);
          });
          // pushing id for last main article view
          if (
            this.articleService.lastArticle &&
            !this.ids.includes(this.articleService.lastArticle.ds_id)
          ) {
            this.ids.push(this.articleService.lastArticle.ds_id);
          }

          if (this.ids) {
            this.articleService.getContentViews(this.ids);
          }
        }
      }

      this.articleService.getContentViewsDataChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(views => {
            views.forEach(view => {
              if (
                this.articleService.lastArticle &&
                view._id === this.articleService.lastArticle.ds_id
              ) {
                this.articleService.lastArticle.viewcount = view.viewcount;
              }
              this.articles.forEach(content => {
                if (content.ds_id == view._id) {
                  content.viewcount = view.viewcount;
                }
              });
            });
          }
        );

      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((error: ErrorEvent) => {
            if (error.action === 'getContentViews') {
              console.log('getContentViews', error.message);
            }
          }
        );
      this.articles.map(res => {
          res.created = this.getCorrectDateFormat(res.created);
          res.published = this.getCorrectDateFormat(res.published);
          return res;
        }
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isPlatformBrowser(this.platformId) && changes.hasOwnProperty('articles')) {
      if (this.fromPublications) {
        if (changes['articles'].previousValue) {
          const ids = [];
          const sliced = changes['articles'].currentValue.slice(changes['articles'].previousValue.length);
          sliced.forEach(value => {
            ids.push(value.ds_id);
          });
          this.articleService.getContentViews(ids);
        }
      }
      setTimeout(() => {
          this.reloadGrid();
        }, 100
      );
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.homepageGrid) {
      this.reloadGrid();
    }
  }

  hasThumbImage(article) {
    return !!(
      article.meta.thumbnail_hash &&
      article.meta.thumbnail_hash !== '' &&
      !article.meta.thumbnail_hash.startsWith('http://127.0.0.1')
    );
  }

  checkImageHashExist(article) {
    return !!(
      article.full_account &&
      article.full_account.meta &&
      article.full_account.meta.image_hash &&
      article.full_account.meta.image_hash !== '' &&
      !article.full_account.meta.image_hash.startsWith('http://127.0.0.1') &&
      article.full_account.meta.image_hash.indexOf('_thumb') !== -1
    );
  }

  setDefaultThumbImage(article) {
    article.meta.thumbnail_hash = '';
  }

  getImage(article) {
    return this.hasThumbImage(article)
      ? article.meta.thumbnail_hash
      : '/assets/no-image-article.jpg';
  }

  reloadGrid() {
    this.isoGrid = new Isotope(this.grid.nativeElement, this.isotopeOptions);
    this.isoGrid.layout();
  }

  redirect(article) {
    this.articleService.getArticleByIdDataChanged.next(article);
    this.router.navigate([`s/${article.ds_id}`]);
  }

  isMyContent(article) {
    return this.accountService.accountInfo && article && article.full_account
      ? this.accountService.accountInfo.publicKey == article.full_account.id
      : false;
  }

  goToPublicationPage(slug) {
    this.router.navigate(['/p/' + slug]);
  }

  getCorrectDateFormat(date) {
    return date && date.slice(-1) !== 'Z' ? date + 'Z' : date;
  }

  removeArticle(dsid, event) {
    event.stopPropagation();
    this.articleRemove.emit(dsid);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }

}
