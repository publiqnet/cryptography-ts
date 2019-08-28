import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { debounceTime } from 'rxjs-compat/operator/debounceTime';
import { mergeMap } from 'rxjs-compat/operator/mergeMap';
import { distinctUntilChanged } from 'rxjs-compat/operator/distinctUntilChanged';
import { FormGroup } from '@angular/forms';
import { ContentService } from '../services/content.service';
// import { Search } from '../models/classes/search';
import { ErrorService } from '../services/error.service';
import { Search } from '../models/classes/search';
import { Author } from '../services/models/author';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showSearch: boolean = false;
  public searchData = [];
  public searchWord: string;

  private unsubscribe$ = new ReplaySubject<void>(1);
  public headerData = {};
  isInputValueChanged: boolean = false;
  public searchForm: FormGroup;
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

  parseSearchResults(data) {
    this.searchData  = [];
    if (data && Object.keys(data)) {
      for (const key of Object.keys(data)) {
        this.searchData.push(...data[key]);
      }
    }
  }

  searchEvent(e) {
    this.showSearch = e;
  }

  onInputChange(searchValue: any) {
    this.searchWord = searchValue;
    console.log(searchValue);
    this.contentService.searchByWord(searchValue)
      .subscribe((data: Search) => {
        // this.parseSearchResults(data);

        this.searchData = data;
        this.searchData['authors'] = this.searchData['authors'].map(author => new Author(author));
      }, error => {this.errorService.handleError('search', 'error'); });

  }

  updateHeaderData() {
    this.headerData = {
      logo: 'https://stage-file.publiq.network/default/publiq.svg',
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
