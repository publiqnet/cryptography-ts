import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public isHistoryArticle = false;
  public historyArticleData = '';
  public searchBarOpen = false;

  @ViewChild('search', {static: false}) private searchInput: ElementRef;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              @Inject(PLATFORM_ID) private platformId: Object,
              private apiService: ApiService) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.router && this.router.url && this.router.url.indexOf('search') > -1) {
        const parts = this.router.url.split('/');
        this.searchInput.nativeElement.value = parts.pop() || parts.pop();
      }
    }
  }

  /**
   * Currently is is being used to navigate to blocks.
   *
   * @param search
   */
  doSearch(search) {

    search = search.trim();

    this.searchBarOpen = false;

    if (search.length > 0) {
      this.router.navigate(['/search', search]);
    }
  }

  redirectToHomePage(event: any) {
    event.preventDefault();

    this.router.navigate(['']);
  }

  toggleSearch() {
    if (window && window.innerWidth > 768) {
      return;
    }

    this.searchBarOpen = !this.searchBarOpen;
  }

  ngOnDestroy() {
  }
}
