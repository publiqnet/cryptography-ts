import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Search } from '../../core/models/classes/search';

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

  constructor() {}

  ngOnInit() {

  }

  ngOnChanges(changes) {
    if ('searchResult' in changes) {
      console.log(this.searchResult);
    }
  }

}
