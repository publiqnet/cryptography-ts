import { Component, Inject, Input, PLATFORM_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-article-small-card-list',
  templateUrl: './article-small-card-list.component.html',
  styleUrls: ['./article-small-card-list.component.scss']
})
export class ArticleSmallCardListComponent implements OnInit {
  @Input() articles: Array<any>;
  thisYear = new Date().getFullYear();

  constructor(
    private articleService: ArticleService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.articles.map(res => {
        res.created = this.getCorrectDateFormat(res.created);
        res.published = this.getCorrectDateFormat(res.published);
        return res;
      }
    );
  }

  hasThumbImage(article) {
    return !!(
      article.meta.thumbnail_hash &&
      article.meta.thumbnail_hash !== '' &&
      !article.meta.thumbnail_hash.startsWith('http://127.0.0.1')
    );
  }

  getImage(article) {
    return this.hasThumbImage(article)
      ? article.meta.thumbnail_hash
      : '/assets/no-image-article.jpg';
  }

  redirect(article) {
    this.articleService.getArticleByIdDataChanged.next(article);
    this.router.navigate([`/s/${article.ds_id}`]);
  }

  goToPublicationPage(slug) {
    this.router.navigate(['/p/' + slug]);
  }

  getCorrectDateFormat(date) {
    return date && date.slice(-1) !== 'Z' ? date + 'Z' : date;
  }
}
