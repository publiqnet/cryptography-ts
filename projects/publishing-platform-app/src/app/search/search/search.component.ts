import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Output() closeSearchBar = new EventEmitter<boolean>();
  public activeTab = 'all';
  isInputValueChanged: boolean = false;
  private popPublicationData = {
    'title': 'UX Topics',
    'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
    'logo': 'http://via.placeholder.com/120x120',
    'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'slug': 'ux_topics',
    'subscribers': 1234,
    'following': false,
    'inviter': {
      'name': 'Anechka'
    },
    'status': 0,
    'storiesCount': 0,
    'membersList': [
      {
        'slug': '1.0.2',
        'first_name': 'test 1',
        'last_name': 'A',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 2',
        'last_name': 'B',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 3',
        'last_name': 'C',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 4',
        'last_name': 'D',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 5',
        'last_name': 'E',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 6',
        'last_name': 'G',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      }
    ]
  };
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

  private searchStoriesData = {
    'uri': '5ceb9fc82765246c6cc55b47',
    'author': {
      'slug': '1.0.2',
      'first_name': 'Gohar',
      'last_name': 'Avetisyan',
      'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
    },
    'created': 1563889376,
    'published': 1563889376,
    'title': 'In the flesh: translating 2d scans into 3d prints',
    'tags': [
      '2017',
      'DEVELOPER',
      'FULLSTACK'
    ],
    'image': 'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'publication': {
      'title': 'UX Planet',
      'slug': 'ux_planet'
    },
    'view_count': '1K'
  };
  private searchPublicationsData = {
    'title': 'UX Topics',
    'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
    'logo': 'http://via.placeholder.com/120x120',
    'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'slug': 'ux_topics',
    'subscribers': 1234,
    'following': false,
    'inviter': {
      'name': 'Anechka'
    },
    'status': 0,
    'storiesCount': 0,
    'membersList': [
      {
        'slug': '1.0.2',
        'first_name': 'test 1',
        'last_name': 'A',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 2',
        'last_name': 'B',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 3',
        'last_name': 'C',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 4',
        'last_name': 'D',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 5',
        'last_name': 'E',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      },
      {
        'slug': '1.0.2',
        'first_name': 'test 6',
        'last_name': 'G',
        'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
      }
    ]
  };
  private searchPeopleData = {
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

  onSearchChange(searchValue: string) {
    (searchValue) ? this.isInputValueChanged = true : this.isInputValueChanged = false;
  }

  closeSearch() {
    this.closeSearchBar.emit();
  }

}
