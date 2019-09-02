import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Search } from '../../core/services/models/search';
import { UtilService } from '../../core/services/util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnChanges {
  @Output() closeSearchBar = new EventEmitter<boolean>();
  @Input() searchResult: Search = null;
  @Input() defaultSearchData = null;
  public activeTab = 'all';
  isInputValueChanged: boolean = false;
  public searchCount = 0;
  private interestedAuthors = {
    'user': {
      'image': 'http://via.placeholder.com/120x120',
      'first_name': 'John',
      'last_name': 'Doe',
      'fullName': 'John Doe'
    },
    'isFollowing': false,
    'slug': 'user_data'
  };

  constructor(private utilService: UtilService,
              private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.searchResult) {
      this.searchCount = this.searchResult.totalCount;
    }
  }

  changeTab(event) {
    this.activeTab = event;
    const searchList = {'stories': 'article', 'publications': 'publication', 'people': 'authors'};
    this.searchCount = (this.activeTab == 'all') ? this.searchResult.totalCount : this.searchResult[searchList[this.activeTab]].length;
  }

  onUserClick(e) {
    this.closeSearchBar.emit(false);
    this.utilService.routerChangeHelper('account', e.slug);
  }

  changeRoute(url) {
    this.router.navigateByUrl(url);
  }
}
