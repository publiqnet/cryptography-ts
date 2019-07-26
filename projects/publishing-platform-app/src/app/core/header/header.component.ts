import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

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
    private accountService: AccountService
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
      if (event.slug == 'profile') {
        this.router.navigate([`/a/${this.accountService.accountInfo.publicKey}`]);
      } else if (this.headerRoutesList[event.slug]) {
        this.router.navigate([this.headerRoutesList[event.slug]]);
      }
    } else if (event.slug == 'logout') {
      this.accountService.logout();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
