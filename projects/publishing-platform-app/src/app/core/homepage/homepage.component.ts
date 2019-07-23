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
    transitionDuration: '0s'
  };

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

  ngOnDestroy() {

  }
}
