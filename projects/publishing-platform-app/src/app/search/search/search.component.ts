import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Search } from '../../core/models/classes/search';
import { UtilService } from '../../core/services/util.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnChanges {
  @Output() closeSearchBar = new EventEmitter<boolean>();
  @Input() searchResult: Search[] = [];
  public activeTab = 'all';
  isInputValueChanged: boolean = false;
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

  ngOnInit() {

  }

  ngOnChanges(changes) {
    if ('searchResult' in changes) {
      console.log(this.searchResult);
    }
  }

  onUserClick(e) {
    console.log(e);
    this.utilService.routerChangeHelper('account', e.slug);
  }

  changeRoute(url) {
    this.router.navigateByUrl(url);
  }


}
