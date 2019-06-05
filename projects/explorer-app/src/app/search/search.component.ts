import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { SearchResponse } from '../services/models/SearchResponse';
import { Block } from '../services/models/block';
import { Transaction } from '../services/models/Transaction';

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

  loading = false;
  private unsubscribe$ = new ReplaySubject<void>(1);
  public searchType = SearchTypes;
  public searchSelectedType;
  public searchData: Account|Block|Transaction;

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
            this.loading = true;
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
      .subscribe((data: SearchResponse) => {
        this.loading = false;
        this.searchSelectedType = data.type;
        this.searchData = data.object;
      }, () => this.loading = false);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
