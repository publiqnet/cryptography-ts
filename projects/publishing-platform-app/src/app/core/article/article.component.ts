import { Component, OnInit } from '@angular/core';
import { ContentService } from '../services/content.service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  public article;
  public loading = true;

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
        if (data.files.length) {
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
            this.article = data;
          });
        } else {
          this.article = data;
        }
      });
  }
}
