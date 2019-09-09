import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { switchMap, takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { ContentService } from '../services/content.service';
import { ErrorService } from '../services/error.service';
import { Search } from '../services/models/search';
import { Publications } from '../services/models/publications';
import { DecimalPipe } from '@angular/common';
import { Tag } from '../services/models/tag';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [DecimalPipe]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showSearch: boolean = false;
  public searchData: Search;
  public searchWord: string;
  public defaultSearchData = null;
  private unsubscribe$ = new ReplaySubject<void>(1);
  public headerData = {};
  public tagsList: Tag[] = [];

  headerRoutesList = {
    '' : '/',
    'new-story' : '/content/newcontent',
    'profile' : '/content/newcontent',
    'publications' : '/p/my-publications',
  };

  constructor(
    private router: Router,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private contentService: ContentService,
    private errorService: ErrorService,
    private _decimalPipe: DecimalPipe
  ) {
  }

  ngOnInit() {
    this.accountService.accountUpdated$
      .pipe(
        switchMap(() => this.contentService.getAllTags()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((tagsList: Tag[]) => {
        this.tagsList = tagsList;
        this.updateHeaderData();
      });
  }

  searchEvent(event) {
    if (event) {
      document.querySelector('html').classList.add('overflow-hidden');
      this.contentService.getDefaultSearchData()
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: any) => {
          this.defaultSearchData = data;
        });
    } else {
      document.querySelector('html').classList.remove('overflow-hidden');
    }

    this.showSearch = event;
    this.searchData = null;
  }

  onInputChange(searchValue: string) {
    this.searchWord = searchValue;
    if (this.showSearch && this.searchWord != '') {
      this.contentService.searchByWord(searchValue)
        .subscribe((data: Search) => {
          this.searchData = data;
        }, error => {
          console.log(error);
        });
    } else {
      this.searchData = null;
    }
  }

  updateHeaderData() {
    this.headerData = {
      logo: '/assets/images/publiq-media.svg',
      isLogged: this.accountService.loggedIn(),
      navigationLinks: [
        { text: 'Science', slug: 'science' },
        { text: 'History', slug: 'history' },
        { text: 'Geek', slug: 'geek' },
        { text: 'Gardens', slug: 'gardens' },
        { text: 'Entertainment', slug: 'entertainment' },
        { text: 'Education', slug: 'education' },
        { text: 'Outdoors', slug: 'outdoors' },
        { text: 'Quotes', slug: 'quotes' },
        { text: 'Holy Quraan', slug: 'quraan' },
      ],
      userData: {
        user: {
          fullName: this.accountService.loggedIn() ? this.accountService.accountInfo.fullName : '',
          image: this.accountService.loggedIn() ? this.accountService.accountInfo.image : '',
        },
      },
      userLoggedData: [
        {
          icon: 'pbq',
          text: this.accountService.loggedIn() ? this._decimalPipe.transform(this.accountService.accountInfo.balance, '0.0-8') + ' PBQ' : '',
          inner: {
            'text': 'Wallet',
            'icon': 'arrow-right',
          },
          value: 'wallet',
          seperator: true
        },
        {
          icon: 'new-story',
          text: 'New story',
          value: 'new-story'
        },
        {
          icon: 'publication',
          text: 'Publications',
          value: 'publications',
          seperator: true
        },
        {
          icon: 'profile',
          text: 'Profile',
          value: 'profile',
          className: 'silly'
        },
        {
          icon: 'logout',
          text: 'Log Out',
          value: 'logout'
        },
      ],
      notificationData: [],
    };
  }

  userAuth(page) {
    this.router.navigate([`/user/${page}`]);
  }

  onRouteChange(event) {
    if (event.action == 'redirect') {
      if (event.slug == 'logout') {
        this.accountService.logout();
        this.router.navigate(['/']);
      } else if (event.slug == 'profile') {
        this.router.navigate([`/a/${this.accountService.accountInfo.publicKey}`]);
      } else if (event.slug == 'wallet') {
        window.open(environment.wallet_url, '_blank');
      } else if (this.headerRoutesList[event.slug]) {
        this.router.navigate([this.headerRoutesList[event.slug]]);
      }
    }
  }

  onTagSelect(event) {
    this.showSearch = true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
