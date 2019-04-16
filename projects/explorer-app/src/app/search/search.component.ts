import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

export enum SearchTypes {
  block = <any>'block',
  transaction = <any>'transaction',
  account = <any>'account'
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new ReplaySubject<void>(1);
  private searchType = SearchTypes;
  public searchSelectedType;
  public searchData;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              @Inject(PLATFORM_ID) private platformId: Object,
              private apiService: ApiService) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.activatedRoute.params
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((params: Params) => {
          if (params['term']) {
            this.loadSearchData(params['term']);
          } else {
            this.router.navigate(['/page-not-found']);
          }
        });
    }
  }

  loadSearchData(search) {
    this.apiService.search(search)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        if (data && data.type) {
          this.searchSelectedType = data.type;
          this.searchData = data.object;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
