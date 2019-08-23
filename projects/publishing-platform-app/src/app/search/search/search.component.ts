import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Output() closeSearchBar = new EventEmitter<boolean>();

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
  private searchTabber = [
    {
      'value': '1',
      'text': 'All'
    },
    {
      'value': '2',
      'text': 'Stories',
    },
    {
      'value': '3',
      'text': 'Publications',
    },
    {
      'value': '4',
      'text': 'People',
    }
  ];

  constructor() {}

  ngOnInit() {

  }

  closeSearch() {
    this.closeSearchBar.emit();
  }

}
