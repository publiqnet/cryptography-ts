import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContentService } from '../services/content.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, ReplaySubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { AccountService } from '../services/account.service';
import { Account } from '../services/models/account';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';


@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  public article;
  author: any;
  public authorFirstName: string;
  public authorLastName: string;
  public authorFullName: string;
  public published: number;
  public authorImage: any;
  public loading = true;
  public coverImageUrl = '';
  isCurrentUser = false;

  public env = environment;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private contentService: ContentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    protected sanitizer: DomSanitizer,
    private accountService: AccountService,
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
        console.log(data);

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
            this.authorImage = data.author.image;
            this.author = data.author;
            this.published = data.published;
            if (this.accountService.loggedIn() && this.author && this.accountService.accountInfo.publicKey == this.author.publicKey) {
              this.isCurrentUser = true;
            }
            if (data.author.firstName) {
              this.authorFirstName = data.author.firstName;
            } else {
              this.authorFirstName = '';
            }
            if (data.author.lastName) {
              this.authorLastName = data.author.lastName;
            } else {
              this.authorLastName = '';
            }
            this.authorFullName = this.authorFirstName + ' ' + this.authorLastName;
          });
        } else {
          this.article = data;
        }
      });
  }

  formatDate(date, format) {
    return moment(date * 1000).format(format);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isCurrentUser = false;
  }
}
