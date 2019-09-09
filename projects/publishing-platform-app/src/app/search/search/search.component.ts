import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { Search } from '../../core/services/models/search';
import { UtilService } from '../../core/services/util.service';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { PublicationService } from '../../core/services/publication.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnChanges, OnDestroy {
  @Output() closeSearchBar = new EventEmitter<boolean>();
  @Input() searchResult: Search = null;
  @Input() defaultSearchData = null;
  public activeTab = 'all';
  isInputValueChanged: boolean = false;
  public searchCount = 0;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private utilService: UtilService, private publicationService: PublicationService,
    private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.searchResult) {
      this.searchCount = this.searchResult.totalCount;
    }
  }

  changeTab(event) {
    this.activeTab = event;
    const searchList = { 'stories': 'article', 'publications': 'publication', 'people': 'authors' };
    this.searchCount = (this.activeTab == 'all') ? this.searchResult.totalCount : this.searchResult[searchList[this.activeTab]].length;
  }

  onUserClick(e) {
    this.utilService.routerChangeHelper('account', e.slug);
    this.closeSearchBar.emit(false);
  }

  changeRoute(url) {
    this.router.navigateByUrl(url);
    this.closeSearchBar.emit(false);
  }

  onContentClick(event) {
    this.utilService.routerChangeHelper('content', event);
    this.closeSearchBar.emit(false);
  }

  onPublicationClick(event) {
    this.utilService.routerChangeHelper('publication', event.slug);
    this.closeSearchBar.emit(false);
  }

  onAccountClick(event) {
    this.utilService.routerChangeHelper('account', event.slug);
    this.closeSearchBar.emit(false);
  }

  onTagClick(event) {
    this.utilService.routerChangeHelper('tag', event);
    this.closeSearchBar.emit(false);
  }

  followPublication(event, item) {
    const followType = item.subscribed ? this.publicationService.unfollow(event.slug) : this.publicationService.follow(event.slug);
    followType.pipe(
      takeUntil(this.unsubscribe$)
    )
      .subscribe(
        () => {}
      );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
