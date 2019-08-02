import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss']
})
export class PublicationComponent implements OnInit, OnDestroy {
  public coverMenuItems = [
    {
      icon: 'reposition',
      text: 'Reposition',
      value: 'reposition',
    },
    {
      icon: 'delete',
      text: 'Delete',
      value: 'delete',
    },
    {
      icon: 'hidden',
      text: 'Hide Cover',
      value: 'hide-cover',
    },
  ];

  public firstContentBlock = [];
  public followers = [];
  public requests = [];
  public listType = 'grid';

  public masonryOptions: NgxMasonryOptions = {
    transitionDuration: '0s',
    itemSelector: '.story--grid',
    gutter: 10
  };

  public activeTab = 'stories';
  public membersActiveTab = 'requests';

  constructor() {
    for (let i = 0; i < 20; ++i) {
      this.firstContentBlock.push({
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
      });

      this.followers.push({
        'user': {
          'image': 'http://via.placeholder.com/120x120',
          'first_name': 'John',
          'last_name': 'Doe',
          'fullName': 'John Doe'
        },
        'isFollowing': false,
        'slug': 'user_data'
      });

      this.requests.push({
        'user': {
          'image': 'http://via.placeholder.com/120x120',
          'first_name': 'John',
          'last_name': 'Doe',
          'fullName': 'John Doe'
        },
        'isFollowing': false,
        'slug': 'user_data'
      });
    }
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
