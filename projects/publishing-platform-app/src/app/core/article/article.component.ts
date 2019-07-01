import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContentService } from '../services/content.service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  public article;
  public loading = true;
  public coverImageUrl = '';

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private contentService: ContentService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        switchMap((params: any) => {
          return this.contentService.getContentByUri(params.uri);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: any) => {
        const getFileCalls = [];
        if (data.files && data.files.length) {
          data.files.forEach((file) => {
            if (file.mimeType == 'text/html') {
              getFileCalls.push(
                this.contentService.getFileContentFromUrl(file.url)
                  .pipe(
                    tap(fileText => data.text = data.text.replace(file.uri, fileText))
                  )
              );
            }
          });
          forkJoin(getFileCalls).subscribe(nextFileData => {
            data.text = `${data.text}`;
            if (data.cover) {
              this.coverImageUrl = data.cover.url;
            }
            this.article = data;
          });
        } else {
          this.article = data;
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
