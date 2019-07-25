import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { NgxMasonryOptions } from 'ngx-masonry';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {

  public contentArray = [];

  public myOptions: NgxMasonryOptions = {
    transitionDuration: '0s',
    itemSelector: '.story--grid',
    gutter: 10
  };

  public publicationData = [
    {
      'title': 'UX Topics 1',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': '',
      'cover': '',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': true,
      'status': 0
    },
    {
      'title': 'UX Topics 2',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': '',
      'cover': '',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': true,
      'status': 0
    },
    {
      'title': 'UX Topics 3',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    },
    {
      'title': 'UX Topics 4',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    },
    {
      'title': 'UX Topics 5',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    },
    {
      'title': 'UX Topics 6',
      'description': 'Tips & News on Social Media Marketing, Online Advertising, Search Engine Optimization, Content Marketing, Growth Hacking, Branding, Start-Ups and more.',
      'logo': 'http://via.placeholder.com/120x120',
      'cover': 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'slug': 'ux_topics',
      'subscribers': 1234,
      'following': false,
      'status': 0
    }
  ];
  public isMasonryLoaded = false;

  constructor(
    private router: Router,
  ) {

  }

  ngOnInit() {
    for (let i = 0; i < 30; ++i) {
      const sentences = [
        'so fat not even Dora can explore her',
        'so  fat I swerved to miss her and ran out of gas',
        'so smelly she put on Right Guard and it went left',
        'so fat she hasn’t got cellulite, she’s got celluheavyso  fat I swerved to miss her and ran out of gasso  ' +
        'fat I swerved to miss her and ran out of gasand ran out of gasso  fat I swerved to miss her and ran out of gasand ran ' +
        'out of gasso  fat I swerved to miss her and ran out of gas',
        'so fat she don’t need no internet – she’s already world wide',
        'so hair her armpits look like Don King in a headlockso  fat I swerved to miss her and ran out of gas',
        'so classless she could be a Marxist utopiaso  fat I swerved to miss her and ran out of gasand' +
        ' ran out of gasso  fat I swerved to miss her and ran out of gasand ran out of gasso  fat I swerved ' +
        'to miss her and ran out of gasand ran out of gasso  fat I swerved to miss her and ran out of gas',
        'so fat she can hear bacon cooking in Canada',
        'so fat she won “The Bachelor” because she all those other bitches',
        'so stupid she believes everything that Brian Williams says',
        'so ugly she scared off Flavor Flav',
        'is like Domino’s Pizza, one call does it alland ran out of gasso  fat I swerved ' +
        'to miss her and ran out of gasand ran out of gasso  fat I swerved to miss her and ran out of gasand ' +
        'ran out of gasso  fat I swerved to miss her and ran out of gas',
        'is twice the man you are',
        'is like Bazooka Joe, 5 cents a blow',
        'is like an ATM, open 24/7',
        'is like a championship ring, everybody puts a finger in her'
      ];
      this.contentArray.push({
        'slug': '5ceb9fc82765246c6cc55b47',
        'author': {
          'slug': '1.0.2',
          'first_name': 'Gohar',
          'last_name': 'Avetisyan',
          'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzlDPRr1xSW0lukY2EmVpAx5Ye1S8H5luUVOK2IqFdcsjCDQxK'
        },
        'created': '11 dec 2019',
        'published': '12 dec 2019',
        'title': 'In the flesh: translating 2d scans into 3d prints NO' + (i + 1) + (sentences[i] ? sentences[i] : '') ,
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
    }
  }

  onLayoutComplete(event) {
    if (event && event.length > 1) {
      this.isMasonryLoaded = true;
    }
  }

  ngOnDestroy() {

  }
}
