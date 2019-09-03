import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { ContentService } from '../services/content.service';
import { ErrorService } from '../services/error.service';
import { Search } from '../services/models/search';
import { Publications } from '../services/models/publications';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showSearch: boolean = false;
  public searchData: Search;
  public searchWord: string;
  public defaultSearchData = null;
  private unsubscribe$ = new ReplaySubject<void>(1);
  public headerData = {};
  headerRoutesList = {
    '' : '/',
    'wallet' : '/wallet',
    'new-story' : '/content/newcontent',
    'profile' : '/content/newcontent',
    'publications' : '/p/my-publications',
  };

  constructor(
    private router: Router,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private contentService: ContentService,
    private errorService: ErrorService
  ) {
  }

  ngOnInit() {
    this.accountService.accountUpdated$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(result => {
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
      ]
    };
  }

  userAuth(page) {
    this.router.navigate([`/user/${page}`]);
  }

  onRouteChange(event) {
    if (event.action == 'redirect') {
      if (event.slug == 'logout') {
        this.accountService.logout();
      } else if (event.slug == 'profile') {
        this.router.navigate([`/a/${this.accountService.accountInfo.publicKey}`]);
      } else if (this.headerRoutesList[event.slug]) {
        this.router.navigate([this.headerRoutesList[event.slug]]);
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
